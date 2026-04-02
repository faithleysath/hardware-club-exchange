import { AdminReviewCard } from "@/components/admin-review-card";
import { requireAdminViewer } from "@/lib/auth";
import { getPendingReviewListings } from "@/lib/data/admin";
import { getCategoryLabelMap } from "@/lib/data/categories";

export const metadata = {
  title: "审核台",
};

export default async function AdminReviewPage() {
  await requireAdminViewer();
  const [items, categoryLabelMap] = await Promise.all([
    getPendingReviewListings(),
    getCategoryLabelMap(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">审核台</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          逐条确认内容质量，再决定是否公开
        </h1>
      </section>

      {items.length > 0 ? (
        <div className="grid gap-6">
          {items.map((item) => (
            <AdminReviewCard
              key={item.listing.id}
              item={{
                ...item,
                listing: {
                  ...item.listing,
                  categoryLabel: categoryLabelMap[item.listing.category],
                },
              }}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-semibold text-zinc-950">当前没有待处理内容</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-500">
            当成员提交新的闲置或重新编辑被驳回内容时，这里会自动出现。
          </p>
        </section>
      )}
    </div>
  );
}
