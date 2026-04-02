import "server-only";

import { asc } from "drizzle-orm";
import { cache } from "react";

import {
  listingCategoryDefaults,
  listingCategoryLabels,
  type ListingCategory,
  listingCategoryValues,
} from "@/lib/constants";
import { db } from "@/lib/db/client";
import { listingCategorySettings } from "@/lib/db/schema";

export type CategorySettingRecord = {
  category: ListingCategory;
  label: string;
  description: string | null;
  submissionHint: string | null;
  sortOrder: number;
  isActive: boolean;
};

function buildDefaultCategorySettings(): CategorySettingRecord[] {
  return listingCategoryValues.map((category, index) => ({
    category,
    label: listingCategoryLabels[category],
    description: listingCategoryDefaults[category].description,
    submissionHint: listingCategoryDefaults[category].submissionHint,
    sortOrder: index,
    isActive: true,
  }));
}

function isRecoverableCategorySettingsError(error: unknown) {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "42P01" || error.code === "57014")
  );
}

function mergeCategorySettings(
  rows: Array<typeof listingCategorySettings.$inferSelect>,
) {
  const rowMap = new Map(rows.map((row) => [row.category, row]));

  return listingCategoryValues
    .map((category, index) => {
      const row = rowMap.get(category);
      const fallback = listingCategoryDefaults[category];

      return {
        category,
        label: row?.label ?? fallback.label,
        description: row?.description ?? fallback.description,
        submissionHint: row?.submissionHint ?? fallback.submissionHint,
        sortOrder: row?.sortOrder ?? index,
        isActive: row?.isActive ?? true,
      } satisfies CategorySettingRecord;
    })
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.category.localeCompare(right.category);
    });
}

export const getCategorySettings = cache(async () => {
  try {
    const rows = await db
      .select()
      .from(listingCategorySettings)
      .orderBy(
        asc(listingCategorySettings.sortOrder),
        asc(listingCategorySettings.category),
      );

    if (rows.length === 0) {
      return buildDefaultCategorySettings();
    }

    return mergeCategorySettings(rows);
  } catch (error) {
    if (isRecoverableCategorySettingsError(error)) {
      return buildDefaultCategorySettings();
    }

    throw error;
  }
});

export const getActiveCategorySettings = cache(async () => {
  const settings = await getCategorySettings();
  return settings.filter((item) => item.isActive);
});

export const getCategoryLabelMap = cache(async () => {
  const settings = await getCategorySettings();

  return Object.fromEntries(
    settings.map((item) => [item.category, item.label]),
  ) as Record<ListingCategory, string>;
});

export async function getSelectableCategorySettings(
  currentCategory?: ListingCategory | null,
) {
  const settings = await getCategorySettings();

  return settings.filter(
    (item) => item.isActive || item.category === currentCategory,
  );
}
