import { describe, expect, it } from "vitest";

import { listingFormSchema, profileFormSchema } from "@/lib/validators";

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
