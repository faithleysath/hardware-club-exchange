import Image from "next/image";

import { reviewListingAction } from "@/lib/actions/listings";
import { ListingStatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { listingCategoryLabels, listingConditionLabels } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type AdminReviewCardProps = {
  item: {
    listing: {
      id: string;
      title: string;
      description: string;
      category: keyof typeof listingCategoryLabels;
      condition: keyof typeof listingConditionLabels;
      priceCents: number;
      status: Parameters<typeof ListingStatusBadge>[0]["status"];
      campusArea: string | null;
      rejectReason: string | null;
      updatedAt: Date;
    };
    seller: {
      displayName: string;
      contactWechat: string | null;
    };
    sellerEmail: string | null;
    coverImageUrl: string | null;
  };
};

export function AdminReviewCard({ item }: AdminReviewCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="relative h-full min-h-64 bg-zinc-100">
          {item.coverImageUrl ? (
            <Image
              src={item.coverImageUrl}
              alt={item.listing.title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 280px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              暂无封面
            </div>
          )}
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  {listingCategoryLabels[item.listing.category]}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1">
                  {listingConditionLabels[item.listing.condition]}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-zinc-950">
                {item.listing.title}
              </h3>
            </div>
            <ListingStatusBadge status={item.listing.status} />
          </div>

          <div className="grid gap-4 text-sm text-zinc-600 md:grid-cols-2">
            <p>卖家：{item.seller.displayName}</p>
            <p>邮箱：{item.sellerEmail ?? "未同步"}</p>
            <p>微信：{item.seller.contactWechat ?? "未填写"}</p>
            <p>价格：{formatCurrency(item.listing.priceCents)}</p>
            <p>地点：{item.listing.campusArea || "待协商"}</p>
            <p>最近更新时间：{formatDateTime(item.listing.updatedAt)}</p>
          </div>

          <p className="rounded-3xl bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
            {item.listing.description}
          </p>

          {item.listing.rejectReason ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              上次驳回原因：{item.listing.rejectReason}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <form action={reviewListingAction} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <input type="hidden" name="listingId" value={item.listing.id} />
              <input type="hidden" name="decision" value="approve" />
              <h4 className="mb-2 font-medium text-emerald-900">通过上架</h4>
              <p className="mb-4 text-sm text-emerald-700">
                审核通过后会立即出现在成员列表中。
              </p>
              <SubmitButton pendingLabel="通过中..." className="w-full">
                通过
              </SubmitButton>
            </form>

            <form action={reviewListingAction} className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <input type="hidden" name="listingId" value={item.listing.id} />
              <input type="hidden" name="decision" value="reject" />
              <h4 className="mb-2 font-medium text-amber-900">驳回并说明</h4>
              <textarea
                name="reason"
                required
                className="mb-4 min-h-28 w-full rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="写清楚需要卖家补充或修改的地方。"
              />
              <SubmitButton variant="secondary" pendingLabel="驳回中..." className="w-full">
                驳回
              </SubmitButton>
            </form>

            <form action={reviewListingAction} className="rounded-3xl border border-red-200 bg-red-50 p-4">
              <input type="hidden" name="listingId" value={item.listing.id} />
              <input type="hidden" name="decision" value="remove" />
              <h4 className="mb-2 font-medium text-red-900">直接下架</h4>
              <textarea
                name="reason"
                required
                className="mb-4 min-h-28 w-full rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400"
                placeholder="用于违规、明显不适合公开的内容。"
              />
              <SubmitButton variant="danger" pendingLabel="下架中..." className="w-full">
                下架
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
