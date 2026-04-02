import "server-only";

import { aliasedTable, and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  favorites,
  listings,
  profiles,
  reports,
  reservationRequests,
} from "@/lib/db/schema";
import { getSignedImageUrlMap } from "@/lib/media";

export async function getFavoriteListings(viewerId: string) {
  const rows = await db
    .select({
      favoriteCreatedAt: favorites.createdAt,
      listing: listings,
      sellerDisplayName: profiles.displayName,
    })
    .from(favorites)
    .innerJoin(listings, eq(listings.id, favorites.listingId))
    .innerJoin(profiles, eq(profiles.id, listings.sellerId))
    .where(
      and(
        eq(favorites.userId, viewerId),
        inArray(listings.status, ["published", "reserved", "completed"]),
      ),
    )
    .orderBy(desc(favorites.createdAt));

  const imageMap = await getSignedImageUrlMap(
    rows.map((row) => row.listing.coverImagePath),
  );

  return rows.map((row) => ({
    ...row,
    coverImageUrl: imageMap[row.listing.coverImagePath] ?? null,
  }));
}

export async function getReservationDashboard(viewerId: string) {
  const buyerProfiles = aliasedTable(profiles, "buyer_profiles");
  const sellerProfiles = aliasedTable(profiles, "seller_profiles");

  const [outgoingRows, incomingRows] = await Promise.all([
    db
      .select({
        request: reservationRequests,
        listing: listings,
        sellerDisplayName: sellerProfiles.displayName,
      })
      .from(reservationRequests)
      .innerJoin(listings, eq(listings.id, reservationRequests.listingId))
      .innerJoin(sellerProfiles, eq(sellerProfiles.id, listings.sellerId))
      .where(eq(reservationRequests.buyerId, viewerId))
      .orderBy(desc(reservationRequests.createdAt)),
    db
      .select({
        request: reservationRequests,
        listing: listings,
        buyerDisplayName: buyerProfiles.displayName,
        buyerContactWechat: buyerProfiles.contactWechat,
      })
      .from(reservationRequests)
      .innerJoin(listings, eq(listings.id, reservationRequests.listingId))
      .innerJoin(buyerProfiles, eq(buyerProfiles.id, reservationRequests.buyerId))
      .where(eq(listings.sellerId, viewerId))
      .orderBy(desc(reservationRequests.createdAt)),
  ]);

  const imageMap = await getSignedImageUrlMap([
    ...outgoingRows.map((row) => row.listing.coverImagePath),
    ...incomingRows.map((row) => row.listing.coverImagePath),
  ]);

  return {
    outgoing: outgoingRows.map((row) => ({
      ...row,
      coverImageUrl: imageMap[row.listing.coverImagePath] ?? null,
    })),
    incoming: incomingRows.map((row) => ({
      ...row,
      coverImageUrl: imageMap[row.listing.coverImagePath] ?? null,
    })),
  };
}

export async function getAdminReportQueue() {
  const reporterProfiles = aliasedTable(profiles, "reporter_profiles");
  const handlerProfiles = aliasedTable(profiles, "handler_profiles");

  const rows: Array<{
    report: typeof reports.$inferSelect;
    listing: typeof listings.$inferSelect;
    reporterDisplayName: string;
    handlerDisplayName: string | null;
  }> = await db
    .select({
      report: reports,
      listing: listings,
      reporterDisplayName: reporterProfiles.displayName,
      handlerDisplayName: handlerProfiles.displayName,
    })
    .from(reports)
    .innerJoin(listings, eq(listings.id, reports.listingId))
    .innerJoin(reporterProfiles, eq(reporterProfiles.id, reports.reporterId))
    .leftJoin(handlerProfiles, eq(handlerProfiles.id, reports.handledBy))
    .orderBy(
      reports.status,
      desc(reports.createdAt),
    );

  const imageMap = await getSignedImageUrlMap(
    rows.map((row) => row.listing.coverImagePath),
  );

  return rows.map((row) => ({
    ...row,
    coverImageUrl: imageMap[row.listing.coverImagePath] ?? null,
  }));
}
