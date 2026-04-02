import Link from "next/link";
import Image from "next/image";

import { ListingStatusActions } from "@/components/listing-status-actions";
import { ListingStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { requireActiveViewer } from "@/lib/auth";
import { getViewerListings } from "@/lib/data/listings";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "我的发布",
};

export default async function MyListingsPage() {
  const viewer = await requireActiveViewer();
  const listings = await getViewerListings(viewer.id);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500">我的发布</p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
            追踪每一条闲置现在走到了哪一步
          </h1>
        </div>
        <Link href="/publish" className={buttonVariants({ size: "sm" })}>
          新建发布
        </Link>
      </section>

      {listings.length > 0 ? (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="grid gap-0 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)] lg:grid-cols-[260px_1fr]"
            >
              <div className="relative bg-zinc-100">
                {listing.coverImageUrl ? (
                  <Image
                    src={listing.coverImageUrl}
                    alt={listing.title}
                    width={960}
                    height={640}
                    unoptimized
                    className="h-full min-h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-56 items-center justify-center text-sm text-zinc-500">
                    暂无图片
                  </div>
                )}
              </div>

              <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-zinc-950">{listing.title}</h2>
                    <p className="text-sm text-zinc-500">
                      最近更新时间：{formatDateTime(listing.updatedAt)}
                    </p>
                  </div>
                  <ListingStatusBadge status={listing.status} />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                  <p>价格：{formatCurrency(listing.priceCents)}</p>
                  <p>地点：{listing.campusArea || "待协商"}</p>
                </div>

                {listing.rejectReason ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    审核备注：{listing.rejectReason}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/items/${listing.id}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    查看详情
                  </Link>
                  <Link
                    href={`/me/listings/${listing.id}/edit`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    {listing.status === "draft" ? "继续编辑草稿" : "编辑并重新送审"}
                  </Link>
                </div>

                <ListingStatusActions listingId={listing.id} status={listing.status} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-semibold text-zinc-950">你还没有发布任何闲置</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
            第一次发布时，平台会自动要求至少 1 张图片和 1 种联系方式，避免内容过于简略。
          </p>
          <Link href="/publish" className={`${buttonVariants({ size: "md" })} mt-6`}>
            去发布第一条
          </Link>
        </section>
      )}
    </div>
  );
}
