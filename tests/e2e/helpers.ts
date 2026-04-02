import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const pngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6pS6sAAAAASUVORK5CYII=",
  "base64",
);

type SeededUserRole = "member" | "admin";
type SeededUserStatus = "pending" | "active" | "suspended";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const postgresUrl = process.env.POSTGRES_URL;

if (!supabaseUrl || !serviceRoleKey || !postgresUrl) {
  throw new Error("E2E tests require Supabase and Postgres environment variables");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const sql = postgres(postgresUrl, {
  prepare: false,
  max: 1,
});

export function createRunId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function seedUser(params: {
  email: string;
  password: string;
  displayName: string;
  role: SeededUserRole;
  status: SeededUserStatus;
}) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      display_name: params.displayName,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to seed auth user");
  }

  await sql`
    insert into public.profiles (id, role, status, display_name)
    values (${data.user.id}, ${params.role}, ${params.status}, ${params.displayName})
    on conflict (id) do update
    set
      role = excluded.role,
      status = excluded.status,
      display_name = excluded.display_name
  `;

  return {
    id: data.user.id,
    email: params.email,
    password: params.password,
    displayName: params.displayName,
  };
}

export async function createListing(params: {
  sellerId: string;
  title: string;
  category?: "board" | "sensor" | "tool" | "device" | "component" | "other";
  condition?: "new" | "like_new" | "used" | "for_parts";
  status?: "published" | "reserved" | "completed";
}) {
  const listingId = crypto.randomUUID();
  const imagePath = `${params.sellerId}/${listingId}/e2e-cover.png`;

  const { error } = await supabaseAdmin.storage
    .from("listing-images")
    .upload(imagePath, pngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  await sql`
    insert into public.listings (
      id,
      seller_id,
      title,
      description,
      category,
      condition,
      price_cents,
      contact_note,
      campus_area,
      status,
      cover_image_path,
      published_at
    )
    values (
      ${listingId},
      ${params.sellerId},
      ${params.title},
      ${"测试生成的闲置，用于 Playwright 端到端验证。"},
      ${params.category ?? "board"},
      ${params.condition ?? "used"},
      ${12900},
      ${"微信 test-seller"},
      ${"创客空间"},
      ${params.status ?? "published"},
      ${imagePath},
      ${new Date()}
    )
  `;

  await sql`
    insert into public.listing_images (listing_id, storage_path, sort_order, alt_text)
    values (${listingId}, ${imagePath}, 0, ${params.title})
  `;

  return {
    id: listingId,
    imagePath,
  };
}

export async function findListingByTitle(title: string) {
  const rows = await sql<{
    id: string;
    cover_image_path: string;
  }[]>`
    select id, cover_image_path
    from public.listings
    where title = ${title}
    order by created_at desc
    limit 1
  `;

  return rows[0] ?? null;
}

export async function findAuthUserIdByEmail(email: string) {
  const rows = await sql<{
    id: string;
  }[]>`
    select id
    from auth.users
    where lower(email) = lower(${email})
    order by created_at desc
    limit 1
  `;

  return rows[0]?.id ?? null;
}

export async function cleanupSeededData(params: {
  userIds: string[];
  listingIds: string[];
  imagePaths: string[];
}) {
  if (params.listingIds.length > 0) {
    await sql`delete from public.listings where id = any(${params.listingIds}::uuid[])`;
  }

  if (params.imagePaths.length > 0) {
    await supabaseAdmin.storage.from("listing-images").remove(params.imagePaths);
  }

  for (const userId of params.userIds) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  }
}

export async function loginWithPassword(page: Page, params: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill(params.email);
  await page.getByLabel("密码").fill(params.password);
  await page.getByRole("button", { name: "使用邮箱密码登录" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "退出登录" }).click();
  await page.waitForURL(/\/login/);
}

export async function uploadPng(page: Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "e2e-listing.png",
    mimeType: "image/png",
    buffer: pngBuffer,
  });
}

export async function expectToastLikeMessage(page: Page, text: string) {
  await expect(page.getByText(text)).toBeVisible();
}
