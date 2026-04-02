"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireActiveViewer } from "@/lib/auth";
import {
  getFieldErrors,
  initialActionState,
  type ActionState,
} from "@/lib/actions/shared";
import { MAX_LISTING_IMAGES, type ListingStatus } from "@/lib/constants";
import { db } from "@/lib/db/client";
import {
  auditLogs,
  listingImages,
  listings,
  reservationRequests,
} from "@/lib/db/schema";
import { canSellerTransitionListing } from "@/lib/listing-permissions";
import {
  deleteListingImages,
  extractImageFiles,
  uploadListingImages,
  validateImageFiles,
} from "@/lib/media";
import { resolveRetainedImageIds } from "@/lib/listing-image-retention";
import {
  adminReviewActionSchema,
  listingFormSchema,
  listingStatusActionSchema,
} from "@/lib/validators";

type ListingMutationRecord = typeof listings.$inferSelect & {
  images: Array<typeof listingImages.$inferSelect>;
};

type ListingIntent = "draft" | "submit";
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function getListingMutationRecord(listingId: string) {
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return null;
  }

  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder, listingImages.createdAt);

  return {
    ...listing,
    images,
  } satisfies ListingMutationRecord;
}

function createListingPayload(formData: FormData) {
  return listingFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    priceYuan: String(formData.get("priceYuan") ?? ""),
    campusArea: String(formData.get("campusArea") ?? ""),
    contactNote: String(formData.get("contactNote") ?? ""),
  });
}

function getListingIntent(formData: FormData): ListingIntent {
  return formData.get("intent") === "draft" ? "draft" : "submit";
}

function getRetainedImageIds(formData: FormData, currentImages: ListingMutationRecord["images"]) {
  return resolveRetainedImageIds({
    retainedImageIdsValue: formData.get("retainedImageIds"),
    currentImageIds: currentImages.map((image) => image.id),
  });
}

function revalidateListingPaths(listingId: string) {
  revalidatePath("/");
  revalidatePath("/publish");
  revalidatePath("/me/listings");
  revalidatePath("/me/reservations");
  revalidatePath("/me/favorites");
  revalidatePath(`/items/${listingId}`);
  revalidatePath("/admin/review");
  revalidatePath("/admin/audit");
  revalidatePath("/admin/reports");
}

async function syncReservationRequestsForListingStatus(
  tx: DbTransaction,
  params: {
    listingId: string;
    nextStatus: ListingStatus;
    actorId: string;
  },
) {
  const now = new Date();

  if (
    params.nextStatus === "draft" ||
    params.nextStatus === "pending_review" ||
    params.nextStatus === "rejected" ||
    params.nextStatus === "removed"
  ) {
    await tx
      .update(reservationRequests)
      .set({
        status: "rejected",
        handledBy: params.actorId,
        handledAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(reservationRequests.listingId, params.listingId),
          eq(reservationRequests.status, "pending"),
        ),
      );

    await tx
      .update(reservationRequests)
      .set({
        status: "cancelled",
        handledBy: params.actorId,
        handledAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(reservationRequests.listingId, params.listingId),
          eq(reservationRequests.status, "accepted"),
        ),
      );
  }

  if (params.nextStatus === "published") {
    await tx
      .update(reservationRequests)
      .set({
        status: "cancelled",
        handledBy: params.actorId,
        handledAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(reservationRequests.listingId, params.listingId),
          eq(reservationRequests.status, "accepted"),
        ),
      );
  }

  if (params.nextStatus === "completed") {
    await tx
      .update(reservationRequests)
      .set({
        status: "rejected",
        handledBy: params.actorId,
        handledAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(reservationRequests.listingId, params.listingId),
          eq(reservationRequests.status, "pending"),
        ),
      );

    await tx
      .update(reservationRequests)
      .set({
        status: "closed",
        handledBy: params.actorId,
        handledAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(reservationRequests.listingId, params.listingId),
          eq(reservationRequests.status, "accepted"),
        ),
      );
  }
}

export async function createListingAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireActiveViewer();
  const intent = getListingIntent(formData);
  const parsed = createListingPayload(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正发布信息。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const imageFiles = extractImageFiles(formData);

  if (imageFiles.length === 0) {
    return {
      status: "error",
      message: "至少上传 1 张图片，成员才知道你在卖什么。",
      fieldErrors: {
        images: "至少上传 1 张图片",
      },
    };
  }

  try {
    validateImageFiles(imageFiles);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "图片校验失败",
      fieldErrors: {
        images: error instanceof Error ? error.message : "图片校验失败",
      },
    };
  }

  if (
    intent !== "draft" &&
    !viewer.contactWechat &&
    !parsed.data.contactNote
  ) {
    return {
      status: "error",
      message: "请填写本条联系方式，或先在个人资料里补充微信号。",
      fieldErrors: {
        contactNote: "当前账号还没有默认联系方式",
      },
    };
  }

  const listingId = crypto.randomUUID();
  let uploadedPaths: string[] = [];

  try {
    uploadedPaths = await uploadListingImages({
      files: imageFiles,
      listingId,
      ownerId: viewer.id,
    });

    await db.transaction(async (tx) => {
      await tx.insert(listings).values({
        id: listingId,
        sellerId: viewer.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        condition: parsed.data.condition,
        priceCents: parsed.data.priceYuan,
        campusArea: parsed.data.campusArea,
        contactNote: parsed.data.contactNote,
        status: intent === "draft" ? "draft" : "pending_review",
        coverImagePath: uploadedPaths[0]!,
      });

      await tx.insert(listingImages).values(
        uploadedPaths.map((storagePath, index) => ({
          listingId,
          storagePath,
          sortOrder: index,
          altText: parsed.data.title,
        })),
      );

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: intent === "draft" ? "listing.drafted" : "listing.submitted",
        targetType: "listing",
        targetId: listingId,
        metadata: {
          title: parsed.data.title,
        },
      });
    });
  } catch (error) {
    await deleteListingImages(uploadedPaths);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "发布失败，请稍后再试。",
      fieldErrors: {},
    };
  }

  revalidateListingPaths(listingId);
  redirect(intent === "draft" ? "/me/listings?draft=1" : "/me/listings?created=1");
}

export async function updateListingAction(
  listingId: string,
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireActiveViewer();
  const current = await getListingMutationRecord(listingId);
  const intent = getListingIntent(formData);

  if (!current || (viewer.role !== "admin" && current.sellerId !== viewer.id)) {
    return {
      status: "error",
      message: "找不到可编辑的闲置。",
      fieldErrors: {},
    };
  }

  if (current.status === "completed") {
    return {
      status: "error",
      message: "已成交的闲置不能再编辑，请重新发布一条新的记录。",
      fieldErrors: {},
    };
  }

  const parsed = createListingPayload(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正编辑信息。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  if (
    intent !== "draft" &&
    !viewer.contactWechat &&
    !parsed.data.contactNote
  ) {
    return {
      status: "error",
      message: "请补一条联系方式，避免审核通过后成员无法联系你。",
      fieldErrors: {
        contactNote: "需要至少一种联系方式",
      },
    };
  }

  const newImageFiles = extractImageFiles(formData);
  const retainedImageIds = getRetainedImageIds(formData, current.images);

  try {
    validateImageFiles(newImageFiles);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "图片校验失败",
      fieldErrors: {
        images: error instanceof Error ? error.message : "图片校验失败",
      },
    };
  }

  const retainedImages = retainedImageIds
    .map((imageId) => current.images.find((image) => image.id === imageId) ?? null)
    .filter((image): image is NonNullable<typeof image> => Boolean(image));

  let uploadedPaths: string[] = [];

  try {
    if (newImageFiles.length > 0) {
      uploadedPaths = await uploadListingImages({
        files: newImageFiles,
        listingId,
        ownerId: viewer.id,
      });
    }

    const nextImageRecords = [
      ...retainedImages.map((image) => ({
        storagePath: image.storagePath,
        altText: image.altText ?? parsed.data.title,
      })),
      ...uploadedPaths.map((storagePath) => ({
        storagePath,
        altText: parsed.data.title,
      })),
    ];

    if (nextImageRecords.length === 0) {
      return {
        status: "error",
        message: "至少保留 1 张图片，成员才知道你在卖什么。",
        fieldErrors: {
          images: "至少保留 1 张图片",
        },
      };
    }

    if (nextImageRecords.length > MAX_LISTING_IMAGES) {
      return {
        status: "error",
        message: "图片数量超过上限，请减少后再试。",
        fieldErrors: {
          images: `最多保留 ${MAX_LISTING_IMAGES} 张图片`,
        },
      };
    }

    const nextStatus =
      viewer.role === "admin"
        ? current.status
        : intent === "draft"
          ? "draft"
          : "pending_review";
    const nextPublishedAt =
      nextStatus === "published" ? current.publishedAt ?? new Date() : null;
    const nextCompletedAt = null;

    await db.transaction(async (tx) => {
      await tx
        .update(listings)
        .set({
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
          condition: parsed.data.condition,
          priceCents: parsed.data.priceYuan,
          campusArea: parsed.data.campusArea,
          contactNote: parsed.data.contactNote,
          status: nextStatus,
          rejectReason: null,
          coverImagePath: nextImageRecords[0]!.storagePath,
          publishedAt: nextPublishedAt,
          completedAt: nextCompletedAt,
          updatedAt: new Date(),
        })
        .where(eq(listings.id, listingId));

      await tx.delete(listingImages).where(eq(listingImages.listingId, listingId));
      await tx.insert(listingImages).values(
        nextImageRecords.map((image, index) => ({
          listingId,
          storagePath: image.storagePath,
          sortOrder: index,
          altText: image.altText,
        })),
      );

      await syncReservationRequestsForListingStatus(tx, {
        listingId,
        nextStatus,
        actorId: viewer.id,
      });

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: viewer.role === "admin" ? "listing.admin_edited" : "listing.edited",
        targetType: "listing",
        targetId: listingId,
        metadata: {
          status: nextStatus,
          keptImages: retainedImages.length,
          addedImages: uploadedPaths.length,
        },
      });
    });

    const removedPaths = current.images
      .filter((image) => !retainedImageIds.includes(image.id))
      .map((image) => image.storagePath);

    await deleteListingImages(removedPaths);
  } catch (error) {
    await deleteListingImages(uploadedPaths);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "更新失败，请稍后再试。",
      fieldErrors: {},
    };
  }

  revalidateListingPaths(listingId);
  redirect(
    intent === "draft" ? "/me/listings?draft=1" : "/me/listings?updated=1",
  );
}

export async function updateListingStatusAction(formData: FormData) {
  const viewer = await requireActiveViewer();
  const parsed = listingStatusActionSchema.safeParse({
    listingId: String(formData.get("listingId") ?? ""),
    nextStatus: String(formData.get("nextStatus") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("状态参数不合法");
  }

  const current = await getListingMutationRecord(parsed.data.listingId);

  if (!current || (viewer.role !== "admin" && current.sellerId !== viewer.id)) {
    throw new Error("无权修改该闲置状态");
  }

  if (
    viewer.role !== "admin" &&
    !canSellerTransitionListing(current.status, parsed.data.nextStatus)
  ) {
    throw new Error("当前状态不允许这样切换");
  }

  const nextPublishedAt =
    parsed.data.nextStatus === "published"
      ? current.publishedAt ?? new Date()
      : parsed.data.nextStatus === "pending_review" ||
          parsed.data.nextStatus === "removed"
        ? null
        : current.publishedAt;
  const nextCompletedAt =
    parsed.data.nextStatus === "completed" ? new Date() : null;

  await db.transaction(async (tx) => {
    await tx
      .update(listings)
      .set({
        status: parsed.data.nextStatus,
        rejectReason: null,
        publishedAt: nextPublishedAt,
        completedAt: nextCompletedAt,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, parsed.data.listingId));

    await syncReservationRequestsForListingStatus(tx, {
      listingId: parsed.data.listingId,
      nextStatus: parsed.data.nextStatus,
      actorId: viewer.id,
    });

    await tx.insert(auditLogs).values({
      actorId: viewer.id,
      action: "listing.status_changed",
      targetType: "listing",
      targetId: parsed.data.listingId,
      metadata: {
        from: current.status,
        to: parsed.data.nextStatus,
      },
    });
  });

  revalidateListingPaths(parsed.data.listingId);
}

export async function reviewListingAction(formData: FormData) {
  const viewer = await requireActiveViewer();

  if (viewer.role !== "admin") {
    throw new Error("需要管理员权限");
  }

  const parsed = adminReviewActionSchema.safeParse({
    listingId: String(formData.get("listingId") ?? ""),
    decision: String(formData.get("decision") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("审核参数不合法");
  }

  if (
    (parsed.data.decision === "reject" || parsed.data.decision === "remove") &&
    !parsed.data.reason
  ) {
    throw new Error("驳回或下架时请填写原因");
  }

  const current = await getListingMutationRecord(parsed.data.listingId);

  if (!current) {
    throw new Error("未找到待审核闲置");
  }

  const decisionMap = {
    approve: "published",
    reject: "rejected",
    remove: "removed",
  } as const;

  const nextStatus = decisionMap[parsed.data.decision];

  await db.transaction(async (tx) => {
    await tx
      .update(listings)
      .set({
        status: nextStatus,
        rejectReason:
          parsed.data.decision === "approve" ? null : parsed.data.reason ?? null,
        publishedAt:
          parsed.data.decision === "approve"
            ? current.publishedAt ?? new Date()
            : null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, parsed.data.listingId));

    await syncReservationRequestsForListingStatus(tx, {
      listingId: parsed.data.listingId,
      nextStatus,
      actorId: viewer.id,
    });

    await tx.insert(auditLogs).values({
      actorId: viewer.id,
      action: `listing.${parsed.data.decision}d`,
      targetType: "listing",
      targetId: parsed.data.listingId,
      metadata: {
        reason: parsed.data.reason ?? null,
        previousStatus: current.status,
        nextStatus,
      },
    });
  });

  revalidateListingPaths(parsed.data.listingId);
}
