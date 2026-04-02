CREATE TYPE "public"."listing_category" AS ENUM('board', 'sensor', 'tool', 'device', 'component', 'other');--> statement-breakpoint
CREATE TYPE "public"."listing_condition" AS ENUM('new', 'like_new', 'used', 'for_parts');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending_review', 'published', 'reserved', 'completed', 'rejected', 'removed');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled', 'closed');--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "listing_category" NOT NULL,
	"condition" "listing_condition" NOT NULL,
	"price_cents" integer NOT NULL,
	"contact_note" text,
	"campus_area" text,
	"status" "listing_status" DEFAULT 'pending_review' NOT NULL,
	"reject_reason" text,
	"cover_image_path" text NOT NULL,
	"published_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"status" "member_status" DEFAULT 'pending' NOT NULL,
	"display_name" text NOT NULL,
	"real_name" text,
	"contact_wechat" text,
	"department" text,
	"join_year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"resolution_note" text,
	"handled_by" uuid,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"message" text,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"handled_by" uuid,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_auth_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_handled_by_profiles_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_requests" ADD CONSTRAINT "reservation_requests_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_requests" ADD CONSTRAINT "reservation_requests_buyer_id_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_requests" ADD CONSTRAINT "reservation_requests_handled_by_profiles_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorites_user_created_idx" ON "favorites" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_images_listing_sort_idx" ON "listing_images" USING btree ("listing_id","sort_order");--> statement-breakpoint
CREATE INDEX "listings_status_category_created_idx" ON "listings" USING btree ("status","category","created_at");--> statement-breakpoint
CREATE INDEX "listings_seller_status_idx" ON "listings" USING btree ("seller_id","status");--> statement-breakpoint
CREATE INDEX "reports_status_created_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "reservation_requests_listing_status_idx" ON "reservation_requests" USING btree ("listing_id","status");--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."is_active_member"(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = COALESCE(target_user_id, auth.uid())
      AND status = 'active'
  );
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."is_admin"(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = COALESCE(target_user_id, auth.uid())
      AND status = 'active'
      AND role = 'admin'
  );
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."is_active_member"(uuid) TO authenticated;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."is_admin"(uuid) TO authenticated;--> statement-breakpoint
CREATE TRIGGER "profiles_set_updated_at"
BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "listings_set_updated_at"
BEFORE UPDATE ON "public"."listings"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "reservation_requests_set_updated_at"
BEFORE UPDATE ON "public"."reservation_requests"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
INSERT INTO "storage"."buckets" ("id", "name", "public", "file_size_limit", "allowed_mime_types")
VALUES (
  'listing-images',
  'listing-images',
  false,
  4194304,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT ("id") DO UPDATE
SET
  "public" = EXCLUDED."public",
  "file_size_limit" = EXCLUDED."file_size_limit",
  "allowed_mime_types" = EXCLUDED."allowed_mime_types";--> statement-breakpoint
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."listing_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."reservation_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "profiles_select_self"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = id);--> statement-breakpoint
CREATE POLICY "profiles_select_active_directory"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING ("public"."is_active_member"() AND status = 'active');--> statement-breakpoint
CREATE POLICY "profiles_select_admin"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING ("public"."is_admin"());--> statement-breakpoint
CREATE POLICY "listings_select_visible"
ON "public"."listings"
FOR SELECT
TO authenticated
USING (
  "public"."is_admin"()
  OR seller_id = auth.uid()
  OR (
    "public"."is_active_member"()
    AND status IN ('published', 'reserved', 'completed')
  )
);--> statement-breakpoint
CREATE POLICY "listing_images_select_visible"
ON "public"."listing_images"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "public"."listings" AS listing
    WHERE listing.id = listing_id
      AND (
        "public"."is_admin"()
        OR listing.seller_id = auth.uid()
        OR (
          "public"."is_active_member"()
          AND listing.status IN ('published', 'reserved', 'completed')
        )
      )
  )
);--> statement-breakpoint
CREATE POLICY "favorites_select_own"
ON "public"."favorites"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "reservation_requests_select_relevant"
ON "public"."reservation_requests"
FOR SELECT
TO authenticated
USING (
  "public"."is_admin"()
  OR buyer_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM "public"."listings" AS listing
    WHERE listing.id = listing_id
      AND listing.seller_id = auth.uid()
  )
);--> statement-breakpoint
CREATE POLICY "reports_select_relevant"
ON "public"."reports"
FOR SELECT
TO authenticated
USING (
  "public"."is_admin"()
  OR reporter_id = auth.uid()
);--> statement-breakpoint
CREATE POLICY "audit_logs_select_admin"
ON "public"."audit_logs"
FOR SELECT
TO authenticated
USING ("public"."is_admin"());
