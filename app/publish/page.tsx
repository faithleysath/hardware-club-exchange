import { ListingForm } from "@/components/listing-form";
import { createListingAction } from "@/lib/actions/listings";
import { requireActiveViewer } from "@/lib/auth";
import { getActiveCategorySettings } from "@/lib/data/categories";

export const metadata = {
  title: "发布闲置",
};

export default async function PublishPage() {
  const [viewer, categorySettings] = await Promise.all([
    requireActiveViewer(),
    getActiveCategorySettings(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-medium text-zinc-500">发布闲置</p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
            把信息一次写清楚，审核通过会更快
          </h1>
          <p className="text-sm leading-7 text-zinc-500">
            第一版默认先审核后公开。你也可以先保存草稿，再回来补图、调顺序或确认描述。
          </p>
        </div>

        <ListingForm
          action={createListingAction}
          mode="create"
          viewerHasDefaultContact={Boolean(viewer.contactWechat)}
          categoryOptions={categorySettings.map((item) => ({
            value: item.category,
            label: item.label,
            description: item.description,
            submissionHint: item.submissionHint,
          }))}
        />
      </section>
    </div>
  );
}
