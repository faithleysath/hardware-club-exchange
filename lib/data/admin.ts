import "server-only";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { authUsers } from "@/lib/db/auth-schema";
import { auditLogs, listings, profiles } from "@/lib/db/schema";
import { getSignedImageUrlMap } from "@/lib/media";

export async function getPendingReviewListings() {
  const rows = await db
    .select({
      listing: listings,
      seller: profiles,
      sellerEmail: authUsers.email,
    })
    .from(listings)
    .innerJoin(profiles, eq(profiles.id, listings.sellerId))
    .leftJoin(authUsers, eq(authUsers.id, profiles.id))
    .where(inArray(listings.status, ["pending_review", "rejected"]))
    .orderBy(desc(listings.updatedAt));

  const imageMap = await getSignedImageUrlMap(
    rows.map((row) => row.listing.coverImagePath),
  );

  return rows.map((row) => ({
    ...row,
    coverImageUrl: imageMap[row.listing.coverImagePath] ?? null,
  }));
}

export async function getMemberDirectory() {
  return db
    .select({
      profile: profiles,
      email: authUsers.email,
    })
    .from(profiles)
    .leftJoin(authUsers, eq(authUsers.id, profiles.id))
    .orderBy(profiles.status, desc(profiles.createdAt));
}

export async function getAuditFeed() {
  return db
    .select({
      log: auditLogs,
      actorDisplayName: profiles.displayName,
      actorEmail: authUsers.email,
    })
    .from(auditLogs)
    .innerJoin(profiles, eq(profiles.id, auditLogs.actorId))
    .leftJoin(authUsers, eq(authUsers.id, profiles.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(40);
}
