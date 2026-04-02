export const memberRoleValues = ["member", "admin"] as const;
export type MemberRole = (typeof memberRoleValues)[number];

export const memberStatusValues = ["pending", "active", "suspended"] as const;
export type MemberStatus = (typeof memberStatusValues)[number];

export const listingCategoryValues = [
  "board",
  "sensor",
  "tool",
  "device",
  "component",
  "other",
] as const;
export type ListingCategory = (typeof listingCategoryValues)[number];

export const listingConditionValues = [
  "new",
  "like_new",
  "used",
  "for_parts",
] as const;
export type ListingCondition = (typeof listingConditionValues)[number];

export const listingStatusValues = [
  "draft",
  "pending_review",
  "published",
  "reserved",
  "completed",
  "rejected",
  "removed",
] as const;
export type ListingStatus = (typeof listingStatusValues)[number];

export const reservationStatusValues = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "closed",
] as const;
export type ReservationStatus = (typeof reservationStatusValues)[number];

export const reportStatusValues = ["open", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof reportStatusValues)[number];

export const memberRoleLabels: Record<MemberRole, string> = {
  member: "成员",
  admin: "管理员",
};

export const memberStatusLabels: Record<MemberStatus, string> = {
  pending: "待审核",
  active: "已激活",
  suspended: "已停用",
};

export const listingCategoryLabels: Record<ListingCategory, string> = {
  board: "开发板",
  sensor: "传感器",
  tool: "工具设备",
  device: "整机设备",
  component: "元器件",
  other: "其他",
};

export const listingConditionLabels: Record<ListingCondition, string> = {
  new: "全新未用",
  like_new: "接近全新",
  used: "正常使用痕迹",
  for_parts: "维修/拆件",
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  draft: "草稿",
  pending_review: "待审核",
  published: "上架中",
  reserved: "已预订",
  completed: "已成交",
  rejected: "已驳回",
  removed: "已下架",
};

export const reportStatusLabels: Record<ReportStatus, string> = {
  open: "待处理",
  resolved: "已处理",
  dismissed: "已忽略",
};

export const listingStatusTone: Record<
  ListingStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  reserved: "warning",
  completed: "neutral",
  rejected: "danger",
  removed: "danger",
};

export const memberStatusTone: Record<
  MemberStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  pending: "warning",
  active: "success",
  suspended: "danger",
};

export const LISTING_IMAGE_BUCKET = "listing-images";
export const MAX_LISTING_IMAGES = 4;
export const MAX_LISTING_IMAGE_BYTES = 4 * 1024 * 1024;

export const listingCategoryOptions = listingCategoryValues.map((value) => ({
  value,
  label: listingCategoryLabels[value],
}));

export const listingConditionOptions = listingConditionValues.map((value) => ({
  value,
  label: listingConditionLabels[value],
}));
