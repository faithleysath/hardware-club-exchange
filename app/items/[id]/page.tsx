import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ListingStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { requireActiveViewer } from "@/lib/auth";
import { getListingByIdForViewer } from "@/lib/data/listings";
import { listingCategoryLabels, listingConditionLabels } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const viewer = await requireActiveViewer();
  const { id } = await params;
  const detail = await getListingByIdForViewer(id, viewer);

  if (!detail) {
    notFound();
  }

  const contact =
    detail.listing.contactNote ||
    detail.seller.contactWechat ||
    detail.sellerEmail ||
    "卖家暂未填写联系方式";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="space-y-6">
        <div className="relative h-[420px] overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
          {detail.images[0]?.url ? (
            <Image
              src={detail.images[0].url}
              alt={detail.listing.title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center bg-zinc-100 text-zinc-500">
              暂无图片
            </div>
          )}
        </div>

        {detail.images.length > 1 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {detail.images.slice(1).map((image, index) => (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-[1.5rem] border border-black/5 bg-white"
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={`${detail.listing.title} 附图 ${index + 2}`}
                    width={640}
                    height={384}
                    unoptimized
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                    图片不可用
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  {listingCategoryLabels[detail.listing.category]}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  {listingConditionLabels[detail.listing.condition]}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
                {detail.listing.title}
              </h1>
            </div>
            <ListingStatusBadge status={detail.listing.status} />
          </div>

          <div className="mt-6 text-3xl font-semibold text-zinc-950">
            {formatCurrency(detail.listing.priceCents)}
          </div>

          <div className="mt-6 space-y-3 text-sm leading-7 text-zinc-600">
            <p>卖家：{detail.seller.displayName}</p>
            <p>地点：{detail.listing.campusArea || "待协商"}</p>
            <p>发布时间：{formatDateTime(detail.listing.publishedAt ?? detail.listing.createdAt)}</p>
          </div>

          <div className="mt-6 rounded-[1.8rem] bg-zinc-50 p-5 text-sm leading-8 text-zinc-700">
            {detail.listing.description}
          </div>

          {detail.listing.rejectReason &&
          (viewer.id === detail.listing.sellerId || viewer.role === "admin") ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              审核备注：{detail.listing.rejectReason}
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.8rem] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-900">联系卖家</p>
            <p className="mt-2 text-sm leading-7 text-emerald-800">{contact}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              返回列表
            </Link>
            {detail.canEdit ? (
              <Link
                href={`/me/listings/${detail.listing.id}/edit`}
                className={buttonVariants({ size: "sm" })}
              >
                编辑这条闲置
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
