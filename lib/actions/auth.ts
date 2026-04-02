"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedViewer } from "@/lib/auth";
import { initialActionState, type ActionState, getFieldErrors } from "@/lib/actions/shared";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileFormSchema } from "@/lib/validators";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfileAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireAuthenticatedViewer();

  const parsed = profileFormSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    realName: String(formData.get("realName") ?? ""),
    contactWechat: String(formData.get("contactWechat") ?? ""),
    department: String(formData.get("department") ?? ""),
    joinYear: String(formData.get("joinYear") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正表单中的内容。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  await db
    .update(profiles)
    .set({
      displayName: parsed.data.displayName,
      realName: parsed.data.realName,
      contactWechat: parsed.data.contactWechat,
      department: parsed.data.department,
      joinYear: parsed.data.joinYear,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, viewer.id));

  revalidatePath("/");
  revalidatePath("/waiting-approval");
  revalidatePath("/me/profile");
  revalidatePath("/admin/members");

  return {
    status: "success",
    message:
      viewer.status === "active"
        ? "资料已更新，后续发布将使用最新资料。"
        : "资料已更新，管理员现在会看到你的最新信息。",
    fieldErrors: {},
  };
}
