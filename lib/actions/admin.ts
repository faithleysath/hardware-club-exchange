"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdminViewer } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { auditLogs, profiles } from "@/lib/db/schema";
import { memberRoleFormSchema, memberStatusFormSchema } from "@/lib/validators";

async function getProfileById(profileId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  return profile ?? null;
}

async function getActiveAdminCount() {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(profiles)
    .where(and(eq(profiles.role, "admin"), eq(profiles.status, "active")));

  return Number(row?.total ?? 0);
}

function revalidateAdminPaths() {
  revalidatePath("/admin/members");
  revalidatePath("/admin/audit");
}

export async function updateMemberStatusAction(formData: FormData) {
  const viewer = await requireAdminViewer();
  const parsed = memberStatusFormSchema.safeParse({
    memberId: String(formData.get("memberId") ?? ""),
    nextStatus: String(formData.get("nextStatus") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("成员状态参数不合法");
  }

  const target = await getProfileById(parsed.data.memberId);

  if (!target) {
    throw new Error("未找到目标成员");
  }

  if (
    target.role === "admin" &&
    target.status === "active" &&
    parsed.data.nextStatus !== "active" &&
    (await getActiveAdminCount()) <= 1
  ) {
    throw new Error("至少保留 1 名激活管理员");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(profiles)
      .set({
        status: parsed.data.nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, parsed.data.memberId));

    await tx.insert(auditLogs).values({
      actorId: viewer.id,
      action: "profile.status_changed",
      targetType: "profile",
      targetId: parsed.data.memberId,
      metadata: {
        from: target.status,
        to: parsed.data.nextStatus,
      },
    });
  });

  revalidateAdminPaths();
  revalidatePath("/");
}

export async function updateMemberRoleAction(formData: FormData) {
  const viewer = await requireAdminViewer();
  const parsed = memberRoleFormSchema.safeParse({
    memberId: String(formData.get("memberId") ?? ""),
    nextRole: String(formData.get("nextRole") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("成员角色参数不合法");
  }

  const target = await getProfileById(parsed.data.memberId);

  if (!target) {
    throw new Error("未找到目标成员");
  }

  if (
    target.role === "admin" &&
    parsed.data.nextRole !== "admin" &&
    target.status === "active" &&
    (await getActiveAdminCount()) <= 1
  ) {
    throw new Error("至少保留 1 名激活管理员");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(profiles)
      .set({
        role: parsed.data.nextRole,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, parsed.data.memberId));

    await tx.insert(auditLogs).values({
      actorId: viewer.id,
      action: "profile.role_changed",
      targetType: "profile",
      targetId: parsed.data.memberId,
      metadata: {
        from: target.role,
        to: parsed.data.nextRole,
      },
    });
  });

  revalidateAdminPaths();
}
