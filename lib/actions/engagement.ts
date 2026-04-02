"use server";

import {
  and,
  eq,
  inArray,
  ne,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  getFieldErrors,
  initialActionState,
  type ActionState,
} from "@/lib/actions/shared";
import { requireActiveViewer, requireAdminViewer } from "@/lib/auth";
import { db } from "@/lib/db/client";
import {
  auditLogs,
  favorites,
  listings,
  reports,
  reservationRequests,
} from "@/lib/db/schema";
import {
  favoriteToggleSchema,
  reportCreateSchema,
  reportReviewSchema,
  reservationActionSchema,
  reservationRequestSchema,
} from "@/lib/validators";

function revalidateEngagementPaths(listingId: string) {
  revalidatePath("/");
  revalidatePath(`/items/${listingId}`);
  revalidatePath("/me/listings");
  revalidatePath("/me/reservations");
  revalidatePath("/me/favorites");
  revalidatePath("/admin/reports");
}

export async function toggleFavoriteAction(formData: FormData) {
  const viewer = await requireActiveViewer();
  const parsed = favoriteToggleSchema.safeParse({
    listingId: String(formData.get("listingId") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("收藏参数不合法");
  }

  const [listing] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      status: listings.status,
    })
    .from(listings)
    .where(eq(listings.id, parsed.data.listingId))
    .limit(1);

  if (!listing) {
    throw new Error("未找到对应闲置");
  }

  if (listing.sellerId === viewer.id) {
    throw new Error("不能收藏自己发布的闲置");
  }

  if (!inArrayValue(listing.status, ["published", "reserved", "completed"])) {
    throw new Error("当前状态不支持收藏");
  }

  const [existingFavorite] = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, viewer.id),
        eq(favorites.listingId, parsed.data.listingId),
      ),
    )
    .limit(1);

  if (existingFavorite) {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, viewer.id),
          eq(favorites.listingId, parsed.data.listingId),
        ),
      );
  } else {
    await db.insert(favorites).values({
      userId: viewer.id,
      listingId: parsed.data.listingId,
    });
  }

  revalidateEngagementPaths(parsed.data.listingId);
}

export async function createReservationRequestAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireActiveViewer();
  const parsed = reservationRequestSchema.safeParse({
    listingId: String(formData.get("listingId") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正预约信息。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const [listing] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      status: listings.status,
      title: listings.title,
    })
    .from(listings)
    .where(eq(listings.id, parsed.data.listingId))
    .limit(1);

  if (!listing) {
    return {
      status: "error",
      message: "这条闲置不存在或已不可用。",
      fieldErrors: {},
    };
  }

  if (listing.sellerId === viewer.id) {
    return {
      status: "error",
      message: "不能预约自己发布的闲置。",
      fieldErrors: {},
    };
  }

  if (!inArrayValue(listing.status, ["published", "reserved"])) {
    return {
      status: "error",
      message: "当前状态不再接受预约。",
      fieldErrors: {},
    };
  }

  const [existingRequest] = await db
    .select({
      id: reservationRequests.id,
    })
    .from(reservationRequests)
    .where(
      and(
        eq(reservationRequests.listingId, parsed.data.listingId),
        eq(reservationRequests.buyerId, viewer.id),
        inArray(reservationRequests.status, ["pending", "accepted"]),
      ),
    )
    .limit(1);

  if (existingRequest) {
    return {
      status: "error",
      message: "你已经对这条闲置发起过待处理预约了。",
      fieldErrors: {},
    };
  }

  await db.insert(reservationRequests).values({
    listingId: parsed.data.listingId,
    buyerId: viewer.id,
    message: parsed.data.message,
  });

  revalidateEngagementPaths(parsed.data.listingId);

  return {
    status: "success",
    message:
      listing.status === "reserved"
        ? "预约已加入候补队列，卖家会按顺序处理。"
        : "预约已发送给卖家，等待对方处理。",
    fieldErrors: {},
  };
}

export async function updateReservationRequestAction(formData: FormData) {
  const viewer = await requireActiveViewer();
  const parsed = reservationActionSchema.safeParse({
    requestId: String(formData.get("requestId") ?? ""),
    action: String(formData.get("action") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("预约处理参数不合法");
  }

  const [request] = await db
    .select({
      request: reservationRequests,
      listing: listings,
    })
    .from(reservationRequests)
    .innerJoin(listings, eq(listings.id, reservationRequests.listingId))
    .where(eq(reservationRequests.id, parsed.data.requestId))
    .limit(1);

  if (!request) {
    throw new Error("未找到预约记录");
  }

  const isSeller = request.listing.sellerId === viewer.id;
  const isBuyer = request.request.buyerId === viewer.id;
  const isAdmin = viewer.role === "admin";

  if (parsed.data.action === "accept" || parsed.data.action === "reject" || parsed.data.action === "close") {
    if (!isSeller && !isAdmin) {
      throw new Error("只有卖家或管理员可以处理这条预约");
    }
  }

  if (parsed.data.action === "cancel" && !isBuyer && !isSeller && !isAdmin) {
    throw new Error("无权取消这条预约");
  }

  if (parsed.data.action === "accept") {
    if (request.request.status !== "pending") {
      throw new Error("只有待处理预约可以被接受");
    }

    const [existingAcceptedRequest] = await db
      .select({ id: reservationRequests.id })
      .from(reservationRequests)
      .where(
        and(
          eq(reservationRequests.listingId, request.listing.id),
          eq(reservationRequests.status, "accepted"),
          ne(reservationRequests.id, request.request.id),
        ),
      )
      .limit(1);

    if (existingAcceptedRequest) {
      throw new Error("这条闲置已经有一个被接受的预约了");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(reservationRequests)
        .set({
          status: "accepted",
          handledBy: viewer.id,
          handledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(reservationRequests.id, request.request.id));

      await tx
        .update(listings)
        .set({
          status: "reserved",
          updatedAt: new Date(),
        })
        .where(eq(listings.id, request.listing.id));

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: "reservation.accepted",
        targetType: "reservation_request",
        targetId: request.request.id,
        metadata: {
          listingId: request.listing.id,
        },
      });
    });
  }

  if (parsed.data.action === "reject") {
    if (request.request.status !== "pending") {
      throw new Error("只有待处理预约可以被拒绝");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(reservationRequests)
        .set({
          status: "rejected",
          handledBy: viewer.id,
          handledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(reservationRequests.id, request.request.id));

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: "reservation.rejected",
        targetType: "reservation_request",
        targetId: request.request.id,
        metadata: {
          listingId: request.listing.id,
        },
      });
    });
  }

  if (parsed.data.action === "cancel") {
    if (!inArrayValue(request.request.status, ["pending", "accepted"])) {
      throw new Error("当前预约状态不能取消");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(reservationRequests)
        .set({
          status: "cancelled",
          handledBy: isBuyer ? request.request.handledBy : viewer.id,
          handledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(reservationRequests.id, request.request.id));

      if (request.request.status === "accepted" && request.listing.status === "reserved") {
        await tx
          .update(listings)
          .set({
            status: "published",
            completedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(listings.id, request.listing.id));
      }

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: "reservation.cancelled",
        targetType: "reservation_request",
        targetId: request.request.id,
        metadata: {
          listingId: request.listing.id,
          cancelledBy: isBuyer ? "buyer" : isSeller ? "seller" : "admin",
        },
      });
    });
  }

  if (parsed.data.action === "close") {
    if (request.request.status !== "accepted") {
      throw new Error("只有已接受预约可以被关闭");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(reservationRequests)
        .set({
          status: "closed",
          handledBy: viewer.id,
          handledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(reservationRequests.id, request.request.id));

      await tx
        .update(listings)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(listings.id, request.listing.id));

      await tx.insert(auditLogs).values({
        actorId: viewer.id,
        action: "reservation.closed",
        targetType: "reservation_request",
        targetId: request.request.id,
        metadata: {
          listingId: request.listing.id,
        },
      });
    });
  }

  revalidateEngagementPaths(request.listing.id);
}

export async function createReportAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void _previousState;

  const viewer = await requireActiveViewer();
  const parsed = reportCreateSchema.safeParse({
    listingId: String(formData.get("listingId") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先补充举报原因。",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const [listing] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      status: listings.status,
    })
    .from(listings)
    .where(eq(listings.id, parsed.data.listingId))
    .limit(1);

  if (!listing) {
    return {
      status: "error",
      message: "未找到对应闲置。",
      fieldErrors: {},
    };
  }

  if (listing.sellerId === viewer.id) {
    return {
      status: "error",
      message: "不能举报自己发布的内容。",
      fieldErrors: {},
    };
  }

  const [existingOpenReport] = await db
    .select({
      id: reports.id,
    })
    .from(reports)
    .where(
      and(
        eq(reports.listingId, parsed.data.listingId),
        eq(reports.reporterId, viewer.id),
        eq(reports.status, "open"),
      ),
    )
    .limit(1);

  if (existingOpenReport) {
    return {
      status: "error",
      message: "你已经提交过一条待处理举报了。",
      fieldErrors: {},
    };
  }

  await db.insert(reports).values({
    listingId: parsed.data.listingId,
    reporterId: viewer.id,
    reason: parsed.data.reason,
  });

  revalidateEngagementPaths(parsed.data.listingId);

  return {
    status: "success",
    message: "举报已提交，管理员会在审核台处理。",
    fieldErrors: {},
  };
}

export async function reviewReportAction(formData: FormData) {
  const viewer = await requireAdminViewer();
  const parsed = reportReviewSchema.safeParse({
    reportId: String(formData.get("reportId") ?? ""),
    nextStatus: String(formData.get("nextStatus") ?? ""),
    resolutionNote: String(formData.get("resolutionNote") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("举报处理参数不合法");
  }

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, parsed.data.reportId))
    .limit(1);

  if (!report) {
    throw new Error("未找到举报记录");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(reports)
      .set({
        status: parsed.data.nextStatus,
        resolutionNote: parsed.data.resolutionNote,
        handledBy: viewer.id,
        handledAt: new Date(),
      })
      .where(eq(reports.id, parsed.data.reportId));

    await tx.insert(auditLogs).values({
      actorId: viewer.id,
      action: `report.${parsed.data.nextStatus}`,
      targetType: "report",
      targetId: parsed.data.reportId,
      metadata: {
        listingId: report.listingId,
        resolutionNote: parsed.data.resolutionNote ?? null,
      },
    });
  });

  revalidateEngagementPaths(report.listingId);
}

function inArrayValue<T extends string>(value: string, items: readonly T[]) {
  return items.includes(value as T);
}
