import { notFound } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { requireActiveViewer } from "@/lib/auth";
import { getSelectableCategorySettings } from "@/lib/data/categories";
import { getEditableListing } from "@/lib/data/listings";
import { updateListingAction } from "@/lib/actions/listings";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "编辑闲置",
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const viewer = await requireActiveViewer();
  const { id } = await params;
  const detail = await getEditableListing(id, viewer);

  if (!detail) {
    notFound();
  }

  const boundAction = updateListingAction.bind(null, id);
  const categorySettings = await getSelectableCategorySettings(detail.listing.category);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-medium text-zinc-500">编辑闲置</p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
            修改后会重新进入审核队列
          </h1>
          <p className="text-sm leading-7 text-zinc-500">
            当前内容由管理员可见。你可以删除、重排现有图片，或新增图片追加到末尾。
          </p>
        </div>

        <ListingForm
          action={boundAction}
          mode="edit"
          viewerHasDefaultContact={Boolean(viewer.contactWechat)}
          categoryOptions={categorySettings.map((item) => ({
            value: item.category,
            label: item.label,
            description: item.description,
            submissionHint: item.submissionHint,
          }))}
          initialValues={{
            title: detail.listing.title,
            description: detail.listing.description,
            category: detail.listing.category,
            condition: detail.listing.condition,
            priceYuan: String(detail.listing.priceCents / 100),
            campusArea: detail.listing.campusArea ?? "",
            contactNote: detail.listing.contactNote ?? "",
            existingImages: detail.images.map((image) => ({
              id: image.id,
              url: image.url,
            })),
          }}
        />
      </section>
    </div>
  );
}
