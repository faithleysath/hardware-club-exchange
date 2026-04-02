import "server-only";

import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { getCurrentViewer, type Viewer } from "@/lib/auth";
import {
  type ListingCategory,
  listingCategoryValues,
  type ListingCondition,
  listingConditionValues,
} from "@/lib/constants";
import { db } from "@/lib/db/client";
import { authUsers } from "@/lib/db/auth-schema";
import {
  favorites,
  listingImages,
  listings,
  profiles,
  reports,
  reservationRequests,
} from "@/lib/db/schema";
import { canViewerEditListing, canViewerSeeListing } from "@/lib/listing-permissions";
import { getSignedImageUrlMap } from "@/lib/media";

type SearchParamValue = string | string[] | undefined;

export type MarketplaceFilters = {
  q?: string;
  category?: ListingCategory;
  condition?: ListingCondition;
  maxPriceCents?: number;
};

export async function parseMarketplaceFilters(
  searchParams: Promise<Record<string, SearchParamValue>>,
): Promise<MarketplaceFilters> {
  const resolved = await searchParams;
  const q = typeof resolved.q === "string" ? resolved.q.trim() : undefined;
  const category =
    typeof resolved.category === "string" &&
    listingCategoryValues.includes(resolved.category as ListingCategory)
      ? (resolved.category as ListingCategory)
      : undefined;
  const condition =
    typeof resolved.condition === "string" &&
    listingConditionValues.includes(resolved.condition as ListingCondition)
      ? (resolved.condition as ListingCondition)
      : undefined;
  const maxPriceYuan =
    typeof resolved.maxPrice === "string" && resolved.maxPrice.trim()
      ? Number(resolved.maxPrice.trim())
      : undefined;

  return {
    q: q || undefined,
    category,
    condition,
    maxPriceCents:
      typeof maxPriceYuan === "number" && Number.isFinite(maxPriceYuan)
        ? Math.round(maxPriceYuan * 100)
        : undefined,
  };
}

function buildListingFilterConditions(filters: MarketplaceFilters) {
  const conditions = [inArray(listings.status, ["published", "reserved"])];

  if (filters.q) {
    conditions.push(
      or(
        ilike(listings.title, `%${filters.q}%`),
        ilike(listings.description, `%${filters.q}%`),
      )!,
    );
  }

  if (filters.category) {
    conditions.push(eq(listings.category, filters.category));
  }

  if (filters.condition) {
    conditions.push(eq(listings.condition, filters.condition));
  }

  if (typeof filters.maxPriceCents === "number") {
    conditions.push(lte(listings.priceCents, filters.maxPriceCents));
  }

  return conditions;
}

export async function getMarketplaceListings(filters: MarketplaceFilters) {
  const conditions = buildListingFilterConditions(filters);

  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      category: listings.category,
      condition: listings.condition,
      priceCents: listings.priceCents,
      campusArea: listings.campusArea,
      status: listings.status,
      coverImagePath: listings.coverImagePath,
      createdAt: listings.createdAt,
      publishedAt: listings.publishedAt,
      sellerId: profiles.id,
      sellerDisplayName: profiles.displayName,
    })
    .from(listings)
    .innerJoin(profiles, eq(profiles.id, listings.sellerId))
    .where(and(...conditions))
    .orderBy(desc(sql`coalesce(${listings.publishedAt}, ${listings.createdAt})`))
    .limit(24);

  const imageMap = await getSignedImageUrlMap(rows.map((row) => row.coverImagePath));

  return rows.map((row) => ({
    ...row,
    coverImageUrl: imageMap[row.coverImagePath] ?? null,
  }));
}

export async function getMarketplaceStats(viewer: Viewer | null) {
  const [liveCountRow, myDraftsRow] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(listings)
      .where(inArray(listings.status, ["published", "reserved"])),
    viewer
      ? db
          .select({ total: sql<number>`count(*)::int` })
          .from(listings)
          .where(
            and(
              eq(listings.sellerId, viewer.id),
              inArray(listings.status, ["draft", "pending_review", "rejected"]),
            ),
          )
      : Promise.resolve([{ total: 0 }]),
  ]);

  return {
    liveListings: Number(liveCountRow[0]?.total ?? 0),
    waitingOnMe: Number(myDraftsRow[0]?.total ?? 0),
  };
}

export async function getListingByIdForViewer(listingId: string, viewer: Viewer) {
  const [row] = await db
    .select({
      listing: listings,
      seller: profiles,
      sellerEmail: authUsers.email,
    })
    .from(listings)
    .innerJoin(profiles, eq(profiles.id, listings.sellerId))
    .leftJoin(authUsers, eq(authUsers.id, profiles.id))
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!row || !canViewerSeeListing(viewer, row.listing)) {
    return null;
  }

  const imageRows = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder, listingImages.createdAt);

  const imageMap = await getSignedImageUrlMap(
    imageRows.map((image) => image.storagePath),
  );

  const [favoriteRow, myReservationRow, myOpenReportRow, incomingReservationCountRow] =
    await Promise.all([
      row.listing.sellerId === viewer.id
        ? Promise.resolve(null)
        : db
            .select({
              listingId: favorites.listingId,
            })
            .from(favorites)
            .where(
              and(
                eq(favorites.userId, viewer.id),
                eq(favorites.listingId, listingId),
              ),
            )
            .limit(1)
            .then((result) => result[0] ?? null),
      row.listing.sellerId === viewer.id
        ? Promise.resolve(null)
        : db
            .select({
              id: reservationRequests.id,
              status: reservationRequests.status,
              message: reservationRequests.message,
              createdAt: reservationRequests.createdAt,
            })
            .from(reservationRequests)
            .where(
              and(
                eq(reservationRequests.listingId, listingId),
                eq(reservationRequests.buyerId, viewer.id),
                inArray(reservationRequests.status, ["pending", "accepted"]),
              ),
            )
            .orderBy(desc(reservationRequests.createdAt))
            .limit(1)
            .then((result) => result[0] ?? null),
      row.listing.sellerId === viewer.id
        ? Promise.resolve(null)
        : db
            .select({
              id: reports.id,
            })
            .from(reports)
            .where(
              and(
                eq(reports.listingId, listingId),
                eq(reports.reporterId, viewer.id),
                eq(reports.status, "open"),
              ),
            )
            .limit(1)
            .then((result) => result[0] ?? null),
      row.listing.sellerId !== viewer.id
        ? Promise.resolve([{ total: 0 }])
        : db
            .select({
              total: sql<number>`count(*)::int`,
            })
            .from(reservationRequests)
            .where(
              and(
                eq(reservationRequests.listingId, listingId),
                inArray(reservationRequests.status, ["pending", "accepted"]),
              ),
            ),
    ]);

  return {
    ...row,
    images: imageRows.map((image) => ({
      ...image,
      url: imageMap[image.storagePath] ?? null,
    })),
    canEdit: canViewerEditListing(viewer, row.listing),
    viewerState: {
      isFavorited: Boolean(favoriteRow),
      reservation: myReservationRow,
      hasOpenReport: Boolean(myOpenReportRow),
      incomingReservationCount: Number(incomingReservationCountRow[0]?.total ?? 0),
    },
  };
}

export async function getViewerListings(viewerId: string) {
  const rows = await db
    .select({
      listing: listings,
    })
    .from(listings)
    .where(eq(listings.sellerId, viewerId))
    .orderBy(desc(listings.updatedAt));

  const imageMap = await getSignedImageUrlMap(
    rows.map((row) => row.listing.coverImagePath),
  );

  return rows.map((row) => ({
    ...row.listing,
    coverImageUrl: imageMap[row.listing.coverImagePath] ?? null,
  }));
}

export async function getEditableListing(listingId: string, viewer: Viewer) {
  const detail = await getListingByIdForViewer(listingId, viewer);

  if (!detail || !detail.canEdit) {
    return null;
  }

  return detail;
}

export async function getHomePageData(
  filters: MarketplaceFilters,
) {
  const viewer = await getCurrentViewer();

  if (!viewer || viewer.status !== "active") {
    return {
      viewer,
      listings: [],
      stats: {
        liveListings: 0,
        waitingOnMe: 0,
      },
    };
  }

  const [marketplaceListings, stats] = await Promise.all([
    getMarketplaceListings(filters),
    getMarketplaceStats(viewer),
  ]);

  return {
    viewer,
    listings: marketplaceListings,
    stats,
  };
}
