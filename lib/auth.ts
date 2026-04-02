import "server-only";

import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/lib/db/client";
import { authUsers } from "@/lib/db/auth-schema";
import { profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEmailName } from "@/lib/utils";

export type Viewer = typeof profiles.$inferSelect & {
  email: string | null;
};

const getViewerById = cache(async (userId: string) => {
  const [viewer] = await db
    .select({
      id: profiles.id,
      role: profiles.role,
      status: profiles.status,
      displayName: profiles.displayName,
      realName: profiles.realName,
      contactWechat: profiles.contactWechat,
      department: profiles.department,
      joinYear: profiles.joinYear,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      email: authUsers.email,
    })
    .from(profiles)
    .leftJoin(authUsers, eq(authUsers.id, profiles.id))
    .where(eq(profiles.id, userId))
    .limit(1);

  return viewer ?? null;
});

const getCurrentAuthUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

async function ensureProfileForUser(user: NonNullable<Awaited<ReturnType<typeof getCurrentAuthUser>>>) {
  const existingViewer = await getViewerById(user.id);

  if (existingViewer) {
    return existingViewer;
  }

  const [adminCountRow] = await db
    .select({ total: count() })
    .from(profiles)
    .where(and(eq(profiles.role, "admin"), eq(profiles.status, "active")));

  const shouldBootstrapAdmin = Number(adminCountRow?.total ?? 0) === 0;
  const displayNameCandidates = [
    user.user_metadata.user_name,
    user.user_metadata.preferred_username,
    user.user_metadata.display_name,
    user.user_metadata.full_name,
    user.user_metadata.name,
  ];
  const displayName =
    displayNameCandidates.find(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    ) ?? getEmailName(user.email);

  const [createdProfile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      displayName,
      role: shouldBootstrapAdmin ? "admin" : "member",
      status: shouldBootstrapAdmin ? "active" : "pending",
    })
    .returning();

  return {
    ...createdProfile,
    email: user.email ?? null,
  };
}

export const getCurrentViewer = cache(async () => {
  const user = await getCurrentAuthUser();

  if (!user) {
    return null;
  }

  return ensureProfileForUser(user);
});

export async function requireAuthenticatedViewer() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/login");
  }

  return viewer;
}

export async function requireActiveViewer() {
  const viewer = await requireAuthenticatedViewer();

  if (viewer.status !== "active") {
    redirect("/waiting-approval");
  }

  return viewer;
}

export async function requireAdminViewer() {
  const viewer = await requireActiveViewer();

  if (viewer.role !== "admin") {
    redirect("/");
  }

  return viewer;
}
