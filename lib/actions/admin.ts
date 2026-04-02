"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  getFieldErrors,
  initialActionState,
  type ActionState,
} from "@/lib/actions/shared";
import { requireAdminViewer } from "@/lib/auth";
import { authUsers } from "@/lib/db/auth-schema";
import { db } from "@/lib/db/client";
import { auditLogs, profiles } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEmailName } from "@/lib/utils";
import {
  adminPasswordResetSchema,
  managedMemberAccountSchema,
  memberRoleFormSchema,
  memberStatusFormSchema,
} from "@/lib/validators";

async function getProfileById(profileId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  return profile ?? null;
}

async function getAuthUserById(profileId: string) {
  const [authUser] = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
    })
    .from(authUsers)
    .where(eq(authUsers.id, profileId))
    .limit(1);

  return authUser ?? null;
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

function getManagedAccountErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already been registered") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("duplicate")
  ) {
    return "这个邮箱已经存在，不能重复创建。";
  }

  if (normalized.includes("password")) {
    return "密码不符合 Supabase 当前策略，请换一个更长的临时密码。";
  }

  return "创建账号失败，请稍后再试。";
}

export async function createManagedMemberAccountAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireAdminViewer();
  const parsed = managedMemberAccountSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    initialStatus: String(formData.get("initialStatus") ?? "pending"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正账号信息。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const [existingUser] = await db
    .select({
      id: authUsers.id,
    })
    .from(authUsers)
    .where(sql`lower(${authUsers.email}) = ${parsed.data.email}`)
    .limit(1);

  if (existingUser) {
    return {
      status: "error",
      message: "这个邮箱已经存在，不能重复创建。",
      fieldErrors: {
        email: "邮箱已存在",
      },
    };
  }

  const displayName = parsed.data.displayName ?? getEmailName(parsed.data.email);
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      auth_source: "admin_managed_password",
    },
  });
  const normalizedAdminError = error?.message.toLowerCase() ?? "";

  if (error || !data.user) {
    return {
      status: "error",
      message: getManagedAccountErrorMessage(error?.message ?? "unknown"),
      fieldErrors: normalizedAdminError.includes("password")
        ? {
            password: "请使用更长一些的临时密码",
          }
        : normalizedAdminError.includes("already") || normalizedAdminError.includes("duplicate")
          ? {
              email: "邮箱已存在",
            }
          : {},
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(profiles).values({
        id: data.user.id,
        displayName,
        role: "member",
        status: parsed.data.initialStatus,
      });

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: "profile.account_created",
        targetType: "profile",
        targetId: data.user.id,
        metadata: {
          email: parsed.data.email,
          authProvider: "password",
          initialStatus: parsed.data.initialStatus,
        },
      });
    });
  } catch {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);

    return {
      status: "error",
      message: "账号创建到一半失败，系统已自动回滚，请稍后重试。",
      fieldErrors: {},
    };
  }

  revalidateAdminPaths();

  return {
    status: "success",
    message:
      parsed.data.initialStatus === "active"
        ? "账号已创建并激活，对方现在可以直接用邮箱和密码登录。"
        : "账号已创建，对方可以登录，但仍会处于待审核状态。",
    fieldErrors: {},
  };
}

export async function resetMemberPasswordAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireAdminViewer();
  const parsed = adminPasswordResetSchema.safeParse({
    memberId: String(formData.get("memberId") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正新密码。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const [target, authUser] = await Promise.all([
    getProfileById(parsed.data.memberId),
    getAuthUserById(parsed.data.memberId),
  ]);

  if (!target) {
    return {
      status: "error",
      message: "未找到目标成员。",
      fieldErrors: {},
    };
  }

  if (!authUser?.email) {
    return {
      status: "error",
      message: "这个成员没有可用于邮箱密码登录的邮箱，暂时不能直接重置密码。",
      fieldErrors: {},
    };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(parsed.data.memberId, {
    password: parsed.data.password,
    email_confirm: true,
  });
  const normalizedAdminError = error?.message.toLowerCase() ?? "";

  if (error) {
    return {
      status: "error",
      message: getManagedAccountErrorMessage(error.message),
      fieldErrors: normalizedAdminError.includes("password")
        ? {
            password: "请使用更长一些的新密码",
          }
        : {},
    };
  }

  await db.insert(auditLogs).values({
    actorId: viewer.id,
    action: "profile.password_reset",
    targetType: "profile",
    targetId: parsed.data.memberId,
    metadata: {
      email: authUser.email,
    },
  });

  revalidateAdminPaths();

  return {
    status: "success",
    message:
      "密码已重置。对方现在可以使用这个邮箱和新密码登录；如果原本只用 GitHub，这次也会补上邮箱密码登录。",
    fieldErrors: {},
  };
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
