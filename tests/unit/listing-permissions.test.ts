import { describe, expect, it } from "vitest";

import {
  canSellerTransitionListing,
  canViewerEditListing,
  canViewerSeeListing,
} from "@/lib/listing-permissions";

const activeMember = {
  id: "member-1",
  role: "member" as const,
  status: "active" as const,
};

const activeAdmin = {
  id: "admin-1",
  role: "admin" as const,
  status: "active" as const,
};

const pendingMember = {
  id: "member-2",
  role: "member" as const,
  status: "pending" as const,
};

const publishedListing = {
  sellerId: "seller-1",
  status: "published" as const,
};

describe("canViewerSeeListing", () => {
  it("allows active members to see published listings", () => {
    expect(canViewerSeeListing(activeMember, publishedListing)).toBe(true);
  });

  it("blocks pending members from seeing listings", () => {
    expect(canViewerSeeListing(pendingMember, publishedListing)).toBe(false);
  });

  it("allows admins to see any listing", () => {
    expect(
      canViewerSeeListing(activeAdmin, {
        sellerId: "seller-9",
        status: "rejected",
      }),
    ).toBe(true);
  });
});

describe("canViewerEditListing", () => {
  it("allows the seller to edit non-completed listings", () => {
    expect(
      canViewerEditListing(
        {
          ...activeMember,
          id: "seller-1",
        },
        publishedListing,
      ),
    ).toBe(true);
  });

  it("blocks completed listings for normal sellers", () => {
    expect(
      canViewerEditListing(
        {
          ...activeMember,
          id: "seller-1",
        },
        {
          sellerId: "seller-1",
          status: "completed",
        },
      ),
    ).toBe(false);
  });
});

describe("canSellerTransitionListing", () => {
  it("allows draft to pending_review", () => {
    expect(canSellerTransitionListing("draft", "pending_review")).toBe(true);
  });

  it("does not allow published to reserved directly", () => {
    expect(canSellerTransitionListing("published", "reserved")).toBe(false);
  });

  it("does not allow reserved to completed directly", () => {
    expect(canSellerTransitionListing("reserved", "completed")).toBe(false);
  });

  it("does not allow rejected to completed directly", () => {
    expect(canSellerTransitionListing("rejected", "completed")).toBe(false);
  });
});
