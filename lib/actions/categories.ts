"use server";

import { revalidatePath } from "next/cache";

import {
  getFieldErrors,
  initialActionState,
  type ActionState,
} from "@/lib/actions/shared";
import { requireAdminViewer } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { auditLogs, listingCategorySettings } from "@/lib/db/schema";
import { categorySettingSchema } from "@/lib/validators";

function isMissingRelationError(error: unknown) {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "42P01"
  );
}

export async function updateCategorySettingAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireAdminViewer();
  const parsed = categorySettingSchema.safeParse({
    category: String(formData.get("category") ?? ""),
    label: String(formData.get("label") ?? ""),
    description: String(formData.get("description") ?? ""),
    submissionHint: String(formData.get("submissionHint") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
    isActive: String(formData.get("isActive") ?? "false"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正分类配置。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(listingCategorySettings)
        .values(parsed.data)
        .onConflictDoUpdate({
          target: listingCategorySettings.category,
          set: {
            label: parsed.data.label,
            description: parsed.data.description,
            submissionHint: parsed.data.submissionHint,
            sortOrder: parsed.data.sortOrder,
            isActive: parsed.data.isActive,
            updatedAt: new Date(),
          },
        });

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: "category.updated",
        targetType: "listing_category_setting",
        targetId: crypto.randomUUID(),
        metadata: {
          category: parsed.data.category,
          label: parsed.data.label,
          isActive: parsed.data.isActive,
          sortOrder: parsed.data.sortOrder,
        },
      });
    });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return {
        status: "error",
        message: "分类管理表尚未迁移，请先执行最新数据库迁移。",
        fieldErrors: {},
      };
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "保存分类失败，请稍后再试。",
      fieldErrors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/publish");
  revalidatePath("/me/favorites");
  revalidatePath("/me/reservations");
  revalidatePath("/admin/review");
  revalidatePath("/admin/categories");

  return {
    status: "success",
    message: "分类配置已更新。",
    fieldErrors: {},
  };
}
