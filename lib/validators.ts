import { z } from "zod";

import {
  listingCategoryValues,
  listingConditionValues,
  memberRoleValues,
  memberStatusValues,
} from "@/lib/constants";
import { parsePriceToCents } from "@/lib/utils";

const optionalTrimmedText = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().max(max).optional(),
  );

const normalizedEmail = z
  .string()
  .trim()
  .min(1, "请输入邮箱")
  .email("请输入合法邮箱")
  .transform((value) => value.toLowerCase());

export const listingFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "标题至少需要 4 个字")
    .max(60, "标题请控制在 60 个字内"),
  description: z
    .string()
    .trim()
    .min(20, "描述至少需要 20 个字")
    .max(2000, "描述请控制在 2000 个字内"),
  category: z.enum(listingCategoryValues, {
    message: "请选择一个分类",
  }),
  condition: z.enum(listingConditionValues, {
    message: "请选择物品成色",
  }),
  priceYuan: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const cents = parsePriceToCents(value);

      if (!Number.isFinite(cents) || Number.isNaN(cents) || cents < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "请输入合法价格",
        });

        return z.NEVER;
      }

      if (cents > 999_999_00) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "价格超出 MVP 允许范围",
        });

        return z.NEVER;
      }

      return cents;
    }),
  campusArea: optionalTrimmedText(40),
  contactNote: optionalTrimmedText(100),
});

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "展示名至少需要 2 个字")
    .max(24, "展示名请控制在 24 个字内"),
  realName: optionalTrimmedText(24),
  contactWechat: optionalTrimmedText(40),
  department: optionalTrimmedText(40),
  joinYear: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed ? Number(trimmed) : undefined;
    },
    z
      .number()
      .int("年级必须是整数")
      .min(2010, "年级看起来太早了")
      .max(new Date().getFullYear() + 1, "年级看起来太晚了")
      .optional(),
  ),
});

export const memberStatusFormSchema = z.object({
  memberId: z.string().uuid(),
  nextStatus: z.enum(["pending", "active", "suspended"]),
});

export const memberRoleFormSchema = z.object({
  memberId: z.string().uuid(),
  nextRole: z.enum(memberRoleValues),
});

export const passwordLoginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1, "请输入密码"),
});

export const managedMemberAccountSchema = z.object({
  email: normalizedEmail,
  password: z
    .string()
    .min(8, "临时密码至少需要 8 位")
    .max(72, "密码请控制在 72 位以内"),
  displayName: optionalTrimmedText(24),
  initialStatus: z.enum(memberStatusValues).refine(
    (value) => value === "pending" || value === "active",
    "新建账号只能设为待审核或已激活",
  ),
});

export const adminPasswordResetSchema = z.object({
  memberId: z.string().uuid(),
  password: z
    .string()
    .min(8, "新密码至少需要 8 位")
    .max(72, "密码请控制在 72 位以内"),
});

export const listingStatusActionSchema = z.object({
  listingId: z.string().uuid(),
  nextStatus: z.enum(["published", "reserved", "completed", "removed"]),
});

export const adminReviewActionSchema = z.object({
  listingId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "remove"]),
  reason: optionalTrimmedText(200),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;
export type ManagedMemberAccountValues = z.infer<typeof managedMemberAccountSchema>;
export type AdminPasswordResetValues = z.infer<typeof adminPasswordResetSchema>;
