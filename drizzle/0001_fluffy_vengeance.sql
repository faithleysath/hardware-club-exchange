CREATE TABLE "listing_category_settings" (
	"category" "listing_category" PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"submission_hint" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "listing_category_settings_sort_idx" ON "listing_category_settings" USING btree ("sort_order","is_active");--> statement-breakpoint
CREATE TRIGGER "listing_category_settings_set_updated_at"
BEFORE UPDATE ON "public"."listing_category_settings"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
INSERT INTO "public"."listing_category_settings" (
  "category",
  "label",
  "description",
  "submission_hint",
  "sort_order",
  "is_active"
)
VALUES
  (
    'board',
    '开发板',
    '如 STM32、ESP32、Arduino、FPGA 开发板等。',
    '建议写清主控型号、焊接情况、是否带下载器和配件。',
    0,
    true
  ),
  (
    'sensor',
    '传感器',
    '如 IMU、雷达、摄像头、环境传感器、定位模块等。',
    '建议注明接口类型、量程、校准情况和兼容平台。',
    1,
    true
  ),
  (
    'tool',
    '工具设备',
    '如示波器、焊台、电源、热风枪、手动工具等。',
    '建议写清品牌型号、可用状态、是否有耗材或附件。',
    2,
    true
  ),
  (
    'device',
    '整机设备',
    '如打印机、工控机、机器人底盘、测试整机等。',
    '建议补充通电情况、主要故障点、运输和交接限制。',
    3,
    true
  ),
  (
    'component',
    '元器件',
    '如芯片、连接器、电机、模组、散件套装等。',
    '建议注明数量、封装、是否拆机件以及是否成套出售。',
    4,
    true
  ),
  (
    'other',
    '其他',
    '放不进以上分类的社团内部闲置物品。',
    '建议写清用途、来源和为什么归到其他类。',
    5,
    true
  )
ON CONFLICT ("category") DO NOTHING;--> statement-breakpoint
ALTER TABLE "public"."listing_category_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "listing_category_settings_select_active"
ON "public"."listing_category_settings"
FOR SELECT
TO authenticated
USING ("public"."is_active_member"());--> statement-breakpoint
CREATE POLICY "listing_category_settings_select_admin"
ON "public"."listing_category_settings"
FOR SELECT
TO authenticated
USING ("public"."is_admin"());--> statement-breakpoint
