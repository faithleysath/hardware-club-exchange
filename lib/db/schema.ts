import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  listingCategoryValues,
  listingConditionValues,
  listingStatusValues,
  memberRoleValues,
  memberStatusValues,
  reportStatusValues,
  reservationStatusValues,
} from "@/lib/constants";

export const memberRoleEnum = pgEnum("member_role", memberRoleValues);
export const memberStatusEnum = pgEnum("member_status", memberStatusValues);
export const listingCategoryEnum = pgEnum(
  "listing_category",
  listingCategoryValues,
);
export const listingConditionEnum = pgEnum(
  "listing_condition",
  listingConditionValues,
);
export const listingStatusEnum = pgEnum("listing_status", listingStatusValues);
export const reservationStatusEnum = pgEnum(
  "reservation_status",
  reservationStatusValues,
);
export const reportStatusEnum = pgEnum("report_status", reportStatusValues);

export const listingCategorySettings = pgTable(
  "listing_category_settings",
  {
    category: listingCategoryEnum("category").primaryKey(),
    label: text("label").notNull(),
    description: text("description"),
    submissionHint: text("submission_hint"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("listing_category_settings_sort_idx").on(
      table.sortOrder,
      table.isActive,
    ),
  ],
);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  role: memberRoleEnum("role").default("member").notNull(),
  status: memberStatusEnum("status").default("pending").notNull(),
  displayName: text("display_name").notNull(),
  realName: text("real_name"),
  contactWechat: text("contact_wechat"),
  department: text("department"),
  joinYear: integer("join_year"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: listingCategoryEnum("category").notNull(),
    condition: listingConditionEnum("condition").notNull(),
    priceCents: integer("price_cents").notNull(),
    contactNote: text("contact_note"),
    campusArea: text("campus_area"),
    status: listingStatusEnum("status").default("pending_review").notNull(),
    rejectReason: text("reject_reason"),
    coverImagePath: text("cover_image_path").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("listings_status_category_created_idx").on(
      table.status,
      table.category,
      table.createdAt,
    ),
    index("listings_seller_status_idx").on(table.sellerId, table.status),
  ],
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("listing_images_listing_sort_idx").on(
      table.listingId,
      table.sortOrder,
    ),
  ],
);

export const reservationRequests = pgTable(
  "reservation_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    message: text("message"),
    status: reservationStatusEnum("status").default("pending").notNull(),
    handledBy: uuid("handled_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reservation_requests_listing_status_idx").on(
      table.listingId,
      table.status,
    ),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId] }),
    index("favorites_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").default("open").notNull(),
    resolutionNote: text("resolution_note"),
    handledBy: uuid("handled_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("reports_status_created_idx").on(table.status, table.createdAt)],
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ListingCategorySetting = typeof listingCategorySettings.$inferSelect;
