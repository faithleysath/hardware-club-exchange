import { requireAdminViewer } from "@/lib/auth";
import { getAuditFeed } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "审计日志",
};

export default async function AdminAuditPage() {
  await requireAdminViewer();
  const items = await getAuditFeed();

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">审计日志</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          所有关键管理动作都应该能回溯
        </h1>
      </section>

      <div className="grid gap-5">
        {items.map(({ log, actorDisplayName, actorEmail }) => (
          <article
            key={log.id}
            className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">
                  {log.action}
                </p>
                <h2 className="text-xl font-semibold text-zinc-950">
                  {actorDisplayName} <span className="text-sm font-normal text-zinc-500">({actorEmail ?? "无邮箱"})</span>
                </h2>
                <p className="text-sm text-zinc-500">
                  目标：{log.targetType} / {log.targetId}
                </p>
              </div>
              <p className="text-sm text-zinc-500">{formatDateTime(log.createdAt)}</p>
            </div>

            <pre className="mt-4 overflow-x-auto rounded-[1.5rem] bg-zinc-950 p-4 text-xs leading-6 text-zinc-200">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </div>
  );
}
