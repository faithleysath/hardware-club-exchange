import Image from "next/image";

import { reviewReportAction } from "@/lib/actions/engagement";
import { ReportStatusBadge, ListingStatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime } from "@/lib/utils";

export function AdminReportCard({
  item,
}: {
  item: {
    report: {
      id: string;
      reason: string;
      status: "open" | "resolved" | "dismissed";
      resolutionNote: string | null;
      createdAt: Date;
      handledAt: Date | null;
    };
    listing: {
      id: string;
      title: string;
      status: Parameters<typeof ListingStatusBadge>[0]["status"];
    };
    reporterDisplayName: string;
    handlerDisplayName: string | null;
    coverImageUrl: string | null;
  };
}) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
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

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-500">举报处理</p>
              <h2 className="text-2xl font-semibold text-zinc-950">{item.listing.title}</h2>
              <div className="flex flex-wrap gap-2">
                <ReportStatusBadge status={item.report.status} />
                <ListingStatusBadge status={item.listing.status} />
              </div>
            </div>
            <p className="text-sm text-zinc-500">{formatDateTime(item.report.createdAt)}</p>
          </div>

          <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <p>举报人：{item.reporterDisplayName}</p>
            <p>当前处理人：{item.handlerDisplayName ?? "未处理"}</p>
            <p>举报记录 ID：{item.report.id}</p>
            <p>最近处理时间：{formatDateTime(item.report.handledAt)}</p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            举报原因：{item.report.reason}
          </div>

          {item.report.resolutionNote ? (
            <div className="rounded-3xl bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
              已有处理备注：{item.report.resolutionNote}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <form action={reviewReportAction} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <input type="hidden" name="reportId" value={item.report.id} />
              <input type="hidden" name="nextStatus" value="resolved" />
              <h3 className="mb-2 font-medium text-emerald-900">处理并关闭</h3>
              <textarea
                name="resolutionNote"
                className="mb-4 min-h-28 w-full rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="写清楚处理动作，例如已下架、已联系卖家补充信息等。"
              />
              <SubmitButton pendingLabel="处理中..." className="w-full">
                标记已处理
              </SubmitButton>
            </form>

            <form action={reviewReportAction} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
              <input type="hidden" name="reportId" value={item.report.id} />
              <input type="hidden" name="nextStatus" value="dismissed" />
              <h3 className="mb-2 font-medium text-zinc-900">忽略举报</h3>
              <textarea
                name="resolutionNote"
                className="mb-4 min-h-28 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                placeholder="例如：描述不够充分但未发现违规，不做下架处理。"
              />
              <SubmitButton pendingLabel="处理中..." variant="secondary" className="w-full">
                标记已忽略
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
