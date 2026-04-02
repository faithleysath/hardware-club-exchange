import Link from "next/link";
import Image from "next/image";
import { MapPin, Tag } from "lucide-react";

import { ListingStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { listingCategoryLabels, listingConditionLabels } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    category: keyof typeof listingCategoryLabels;
    condition: keyof typeof listingConditionLabels;
    priceCents: number;
    campusArea: string | null;
    status: Parameters<typeof ListingStatusBadge>[0]["status"];
    sellerDisplayName: string;
    coverImageUrl: string | null;
    publishedAt: Date | null;
    createdAt: Date;
  };
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
      <div className="relative h-56 bg-zinc-100">
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            unoptimized
            sizes="(min-width: 1280px) 32vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            暂无可用图片
          </div>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-zinc-950">{listing.title}</h3>
            <p className="text-sm text-zinc-500">卖家：{listing.sellerDisplayName}</p>
          </div>
          <ListingStatusBadge status={listing.status} />
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
          <span className="rounded-full bg-zinc-100 px-3 py-1">
            {listingCategoryLabels[listing.category]}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1">
            {listingConditionLabels[listing.condition]}
          </span>
        </div>

        <div className="flex items-center gap-2 text-2xl font-semibold text-zinc-950">
          <Tag className="h-5 w-5 text-amber-700" />
          {formatCurrency(listing.priceCents)}
        </div>

        <div className="space-y-2 text-sm text-zinc-500">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {listing.campusArea || "地点可协商"}
          </p>
          <p>更新时间：{formatDateTime(listing.publishedAt ?? listing.createdAt)}</p>
        </div>

        <Link href={`/items/${listing.id}`} className={buttonVariants({ variant: "secondary" })}>
          查看详情
        </Link>
      </div>
    </article>
  );
}
