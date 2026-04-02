import type { ListingStatus, MemberRole, MemberStatus } from "@/lib/constants";

type ViewerLike = {
  id: string;
  role: MemberRole;
  status: MemberStatus;
};

type ListingLike = {
  sellerId: string;
  status: ListingStatus;
};

const publicListingStatuses = new Set<ListingStatus>([
  "published",
  "reserved",
  "completed",
]);

export type SellerActionStatus =
  | "pending_review"
  | "published"
  | "reserved"
  | "completed"
  | "removed";

const sellerTransitionMap: Partial<Record<ListingStatus, SellerActionStatus[]>> = {
  draft: ["pending_review", "removed"],
  rejected: ["pending_review", "removed"],
  published: ["removed"],
  reserved: ["removed"],
};

export function isPublicListingStatus(status: ListingStatus) {
  return publicListingStatuses.has(status);
}

export function canViewerSeeListing(
  viewer: ViewerLike | null,
  listing: ListingLike,
) {
  if (!viewer) {
    return false;
  }

  if (viewer.role === "admin" && viewer.status === "active") {
    return true;
  }

  if (viewer.status !== "active") {
    return false;
  }

  if (viewer.id === listing.sellerId) {
    return true;
  }

  return isPublicListingStatus(listing.status);
}

export function canViewerEditListing(
  viewer: ViewerLike,
  listing: ListingLike,
) {
  if (viewer.status !== "active") {
    return false;
  }

  if (viewer.role === "admin") {
    return true;
  }

  return viewer.id === listing.sellerId && listing.status !== "completed";
}

export function canSellerTransitionListing(
  currentStatus: ListingStatus,
  nextStatus: SellerActionStatus,
) {
  return sellerTransitionMap[currentStatus]?.includes(nextStatus) ?? false;
}

export function getSellerStatusActions(status: ListingStatus) {
  return sellerTransitionMap[status] ?? [];
}
