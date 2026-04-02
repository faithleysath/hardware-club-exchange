import { CategorySettingForm } from "@/components/category-setting-form";
import { updateCategorySettingAction } from "@/lib/actions/categories";
import { requireAdminViewer } from "@/lib/auth";
import { getCategorySettings } from "@/lib/data/categories";

export const metadata = {
  title: "分类管理",
};

export default async function AdminCategoriesPage() {
  await requireAdminViewer();
  const items = await getCategorySettings();

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">分类管理</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          调整分类名称、排序、说明和发布建议
        </h1>
      </section>

      <div className="grid gap-6">
        {items.map((item) => (
          <CategorySettingForm
            key={item.category}
            item={item}
            action={updateCategorySettingAction}
          />
        ))}
      </div>
    </div>
  );
}
