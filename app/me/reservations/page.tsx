import Link from "next/link";
import Image from "next/image";

import { updateReservationRequestAction } from "@/lib/actions/engagement";
import {
  ListingStatusBadge,
  ReservationStatusBadge,
} from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { requireActiveViewer } from "@/lib/auth";
import { listingConditionLabels } from "@/lib/constants";
import { getCategoryLabelMap } from "@/lib/data/categories";
import { getReservationDashboard } from "@/lib/data/engagement";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "我的预约",
};

export default async function ReservationDashboardPage() {
  const viewer = await requireActiveViewer();
  const [dashboard, categoryLabelMap] = await Promise.all([
    getReservationDashboard(viewer.id),
    getCategoryLabelMap(),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">我的预约</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          买家看自己的进度，卖家按顺序处理候补
        </h1>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-500">我发出的预约</p>
            <h2 className="text-2xl font-semibold text-zinc-950">
              当前共 {dashboard.outgoing.length} 条
            </h2>
          </div>
          <Link href="/" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            继续浏览闲置
          </Link>
        </div>

        {dashboard.outgoing.length > 0 ? (
          <div className="grid gap-5">
            {dashboard.outgoing.map((item) => (
              <article
                key={item.request.id}
                className="grid gap-0 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)] lg:grid-cols-[220px_1fr]"
              >
                <div className="relative min-h-52 bg-zinc-100">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={item.listing.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 220px, 100vw"
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
                      <h3 className="text-2xl font-semibold text-zinc-950">
                        {item.listing.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        卖家：{item.sellerDisplayName}
                      </p>
                    </div>
                    <ReservationStatusBadge status={item.request.status} />
                  </div>

                  <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
                    <p>价格：{formatCurrency(item.listing.priceCents)}</p>
                    <p>闲置状态：<span className="inline-flex align-middle"><ListingStatusBadge status={item.listing.status} /></span></p>
                    <p>预约时间：{formatDateTime(item.request.createdAt)}</p>
                    <p>地点：{item.listing.campusArea || "待协商"}</p>
                  </div>

                  {item.request.message ? (
                    <p className="rounded-3xl bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                      我的留言：{item.request.message}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/items/${item.listing.id}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      查看详情
                    </Link>
                    {(item.request.status === "pending" || item.request.status === "accepted") ? (
                      <form action={updateReservationRequestAction}>
                        <input type="hidden" name="requestId" value={item.request.id} />
                        <input type="hidden" name="action" value="cancel" />
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "secondary", size: "sm" })}
                        >
                          取消预约
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-8 text-center">
            <p className="text-zinc-500">你还没有发出任何预约。</p>
          </section>
        )}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-zinc-500">我的闲置收到的预约</p>
          <h2 className="text-2xl font-semibold text-zinc-950">
            当前共 {dashboard.incoming.length} 条
          </h2>
        </div>

        {dashboard.incoming.length > 0 ? (
          <div className="grid gap-5">
            {dashboard.incoming.map((item) => (
              <article
                key={item.request.id}
                className="grid gap-0 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)] lg:grid-cols-[220px_1fr]"
              >
                <div className="relative min-h-52 bg-zinc-100">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={item.listing.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 220px, 100vw"
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
                      <h3 className="text-2xl font-semibold text-zinc-950">
                        {item.listing.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        预约人：{item.buyerDisplayName}
                        {item.buyerContactWechat ? ` / 微信：${item.buyerContactWechat}` : ""}
                      </p>
                    </div>
                    <ReservationStatusBadge status={item.request.status} />
                  </div>

                  <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
                    <p>价格：{formatCurrency(item.listing.priceCents)}</p>
                    <p>闲置状态：<span className="inline-flex align-middle"><ListingStatusBadge status={item.listing.status} /></span></p>
                    <p>预约时间：{formatDateTime(item.request.createdAt)}</p>
                    <p>地点：{item.listing.campusArea || "待协商"}</p>
                  </div>

                  {item.request.message ? (
                    <p className="rounded-3xl bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                      对方留言：{item.request.message}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/items/${item.listing.id}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      查看详情
                    </Link>

                    {item.request.status === "pending" ? (
                      <>
                        <form action={updateReservationRequestAction}>
                          <input type="hidden" name="requestId" value={item.request.id} />
                          <input type="hidden" name="action" value="accept" />
                          <button type="submit" className={buttonVariants({ size: "sm" })}>
                            接受预约
                          </button>
                        </form>
                        <form action={updateReservationRequestAction}>
                          <input type="hidden" name="requestId" value={item.request.id} />
                          <input type="hidden" name="action" value="reject" />
                          <button
                            type="submit"
                            className={buttonVariants({ variant: "secondary", size: "sm" })}
                          >
                            拒绝
                          </button>
                        </form>
                      </>
                    ) : null}

                    {item.request.status === "accepted" ? (
                      <>
                        <form action={updateReservationRequestAction}>
                          <input type="hidden" name="requestId" value={item.request.id} />
                          <input type="hidden" name="action" value="close" />
                          <button type="submit" className={buttonVariants({ size: "sm" })}>
                            标记成交
                          </button>
                        </form>
                        <form action={updateReservationRequestAction}>
                          <input type="hidden" name="requestId" value={item.request.id} />
                          <input type="hidden" name="action" value="cancel" />
                          <button
                            type="submit"
                            className={buttonVariants({ variant: "secondary", size: "sm" })}
                          >
                            释放给候补
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-8 text-center">
            <p className="text-zinc-500">你的闲置还没有收到预约。</p>
          </section>
        )}
      </section>
    </div>
  );
}
