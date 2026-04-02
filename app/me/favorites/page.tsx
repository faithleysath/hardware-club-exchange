import Link from "next/link";
import Image from "next/image";

import { FavoriteToggleButton } from "@/components/favorite-toggle-button";
import { ListingStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { requireActiveViewer } from "@/lib/auth";
import { listingConditionLabels } from "@/lib/constants";
import { getCategoryLabelMap } from "@/lib/data/categories";
import { getFavoriteListings } from "@/lib/data/engagement";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "我的收藏",
};

export default async function FavoriteListingsPage() {
  const viewer = await requireActiveViewer();
  const [items, categoryLabelMap] = await Promise.all([
    getFavoriteListings(viewer.id),
    getCategoryLabelMap(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">我的收藏</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          先把感兴趣的东西留住，再慢慢对比
        </h1>
      </section>

      {items.length > 0 ? (
        <div className="grid gap-6">
          {items.map((item) => (
            <article
              key={item.listing.id}
              className="grid gap-0 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)] lg:grid-cols-[240px_1fr]"
            >
              <div className="relative min-h-56 bg-zinc-100">
                {item.coverImageUrl ? (
                  <Image
                    src={item.coverImageUrl}
                    alt={item.listing.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 240px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    暂无图片
                  </div>
                )}
              </div>

              <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                      <span className="rounded-full bg-zinc-100 px-3 py-1">
                        {categoryLabelMap[item.listing.category]}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1">
                        {listingConditionLabels[item.listing.condition]}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-zinc-950">
                      {item.listing.title}
                    </h2>
                    <p className="text-sm text-zinc-500">
                      卖家：{item.sellerDisplayName}
                    </p>
                  </div>
                  <ListingStatusBadge status={item.listing.status} />
                </div>

                <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
                  <p>价格：{formatCurrency(item.listing.priceCents)}</p>
                  <p>地点：{item.listing.campusArea || "待协商"}</p>
                  <p>收藏时间：{formatDateTime(item.favoriteCreatedAt)}</p>
                  <p>最近更新时间：{formatDateTime(item.listing.updatedAt)}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/items/${item.listing.id}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    查看详情
                  </Link>
                  <FavoriteToggleButton
                    listingId={item.listing.id}
                    isFavorited={true}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-semibold text-zinc-950">你还没有收藏任何闲置</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
            在详情页点一次收藏，以后就能从这里快速回看。
          </p>
          <Link href="/" className={`${buttonVariants({ size: "md" })} mt-6`}>
            去逛逛
          </Link>
        </section>
      )}
    </div>
  );
}
