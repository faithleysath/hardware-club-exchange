import { AdminReportCard } from "@/components/admin-report-card";
import { requireAdminViewer } from "@/lib/auth";
import { getAdminReportQueue } from "@/lib/data/engagement";

export const metadata = {
  title: "举报处理",
};

export default async function AdminReportsPage() {
  await requireAdminViewer();
  const items = await getAdminReportQueue();

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">举报处理</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          集中处理内容问题，再决定是否下架或忽略
        </h1>
      </section>

      {items.length > 0 ? (
        <div className="grid gap-6">
          {items.map((item) => (
            <AdminReportCard key={item.report.id} item={item} />
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-semibold text-zinc-950">当前没有举报记录</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-500">
            成员从详情页提交举报后，这里会自动出现待处理项。
          </p>
        </section>
      )}
    </div>
  );
}
