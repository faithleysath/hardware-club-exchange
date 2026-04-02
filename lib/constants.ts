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

export const listingCategoryDefaults: Record<
  ListingCategory,
  {
    label: string;
    description: string;
    submissionHint: string;
  }
> = {
  board: {
    label: "开发板",
    description: "如 STM32、ESP32、Arduino、FPGA 开发板等。",
    submissionHint: "建议写清主控型号、焊接情况、是否带下载器和配件。",
  },
  sensor: {
    label: "传感器",
    description: "如 IMU、雷达、摄像头、环境传感器、定位模块等。",
    submissionHint: "建议注明接口类型、量程、校准情况和兼容平台。",
  },
  tool: {
    label: "工具设备",
    description: "如示波器、焊台、电源、热风枪、手动工具等。",
    submissionHint: "建议写清品牌型号、可用状态、是否有耗材或附件。",
  },
  device: {
    label: "整机设备",
    description: "如打印机、工控机、机器人底盘、测试整机等。",
    submissionHint: "建议补充通电情况、主要故障点、运输和交接限制。",
  },
  component: {
    label: "元器件",
    description: "如芯片、连接器、电机、模组、散件套装等。",
    submissionHint: "建议注明数量、封装、是否拆机件以及是否成套出售。",
  },
  other: {
    label: "其他",
    description: "放不进以上分类的社团内部闲置物品。",
    submissionHint: "建议写清用途、来源和为什么归到其他类。",
  },
};

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
  board: listingCategoryDefaults.board.label,
  sensor: listingCategoryDefaults.sensor.label,
  tool: listingCategoryDefaults.tool.label,
  device: listingCategoryDefaults.device.label,
  component: listingCategoryDefaults.component.label,
  other: listingCategoryDefaults.other.label,
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

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  pending: "待卖家处理",
  accepted: "已接受",
  rejected: "已拒绝",
  cancelled: "已取消",
  closed: "已关闭",
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

export const reportStatusTone: Record<
  ReportStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  open: "warning",
  resolved: "success",
  dismissed: "neutral",
};

export const reservationStatusTone: Record<
  ReservationStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  cancelled: "neutral",
  closed: "neutral",
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
