import { describe, expect, it } from "vitest";

import {
  adminPasswordResetSchema,
  categorySettingSchema,
  reportCreateSchema,
  listingFormSchema,
  managedMemberAccountSchema,
  passwordLoginSchema,
  profileFormSchema,
  reservationRequestSchema,
} from "@/lib/validators";

describe("listingFormSchema", () => {
  it("parses a valid listing form and converts price to cents", () => {
    const result = listingFormSchema.parse({
      title: "ESP32 开发板带外壳",
      description: "九成新，带排针和下载线，测试通过，适合做入门项目。",
      category: "board",
      condition: "used",
      priceYuan: "89.9",
      campusArea: "创客空间",
      contactNote: "微信 same-as-profile",
    });

    expect(result.priceYuan).toBe(8990);
    expect(result.category).toBe("board");
  });

  it("rejects invalid prices", () => {
    const result = listingFormSchema.safeParse({
      title: "开发板",
      description: "这个描述长度其实已经够了，但是价格是非法的。",
      category: "board",
      condition: "used",
      priceYuan: "not-a-number",
      campusArea: "",
      contactNote: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("profileFormSchema", () => {
  it("normalizes blank optional fields to undefined", () => {
    const result = profileFormSchema.parse({
      displayName: "Faith",
      realName: "",
      contactWechat: "",
      department: "  ",
      joinYear: "",
    });

    expect(result.realName).toBeUndefined();
    expect(result.contactWechat).toBeUndefined();
    expect(result.department).toBeUndefined();
    expect(result.joinYear).toBeUndefined();
  });
});

describe("passwordLoginSchema", () => {
  it("normalizes email casing and whitespace", () => {
    const result = passwordLoginSchema.parse({
      email: "  Member@Example.com ",
      password: "secret-pass",
    });

    expect(result.email).toBe("member@example.com");
  });
});

describe("managedMemberAccountSchema", () => {
  it("accepts pending and active as initial status", () => {
    const pending = managedMemberAccountSchema.parse({
      email: "pending@example.com",
      password: "temporary-pass",
      displayName: "",
      initialStatus: "pending",
    });

    const active = managedMemberAccountSchema.parse({
      email: "active@example.com",
      password: "temporary-pass",
      displayName: "  Active User ",
      initialStatus: "active",
    });

    expect(pending.displayName).toBeUndefined();
    expect(active.displayName).toBe("Active User");
  });

  it("rejects suspended as an initial status", () => {
    const result = managedMemberAccountSchema.safeParse({
      email: "member@example.com",
      password: "temporary-pass",
      displayName: "",
      initialStatus: "suspended",
    });

    expect(result.success).toBe(false);
  });
});

describe("adminPasswordResetSchema", () => {
  it("accepts a valid member id and strong-enough password", () => {
    const result = adminPasswordResetSchema.parse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      password: "temporary-pass",
    });

    expect(result.memberId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects too-short passwords", () => {
    const result = adminPasswordResetSchema.safeParse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("reservationRequestSchema", () => {
  it("accepts a valid request payload", () => {
    const result = reservationRequestSchema.parse({
      listingId: "550e8400-e29b-41d4-a716-446655440000",
      message: "  想约周三晚上面交  ",
    });

    expect(result.message).toBe("想约周三晚上面交");
  });
});

describe("reportCreateSchema", () => {
  it("rejects report reasons that are too short", () => {
    const result = reportCreateSchema.safeParse({
      listingId: "550e8400-e29b-41d4-a716-446655440000",
      reason: "太短",
    });

    expect(result.success).toBe(false);
  });
});

describe("categorySettingSchema", () => {
  it("normalizes category settings and converts booleans", () => {
    const result = categorySettingSchema.parse({
      category: "board",
      label: "开发板",
      description: "  常见主控开发板  ",
      submissionHint: "  写清芯片型号  ",
      sortOrder: "3",
      isActive: "true",
    });

    expect(result.sortOrder).toBe(3);
    expect(result.isActive).toBe(true);
    expect(result.description).toBe("常见主控开发板");
  });
});
