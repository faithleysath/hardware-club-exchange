import { ListingForm } from "@/components/listing-form";
import { createListingAction } from "@/lib/actions/listings";
import { requireActiveViewer } from "@/lib/auth";

export const metadata = {
  title: "发布闲置",
};

export default async function PublishPage() {
  const viewer = await requireActiveViewer();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-medium text-zinc-500">发布闲置</p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
            把信息一次写清楚，审核通过会更快
          </h1>
          <p className="text-sm leading-7 text-zinc-500">
            第一版默认先审核后公开。若你未在个人资料里填写微信号，请在表单中补充一条联系方式。
          </p>
        </div>

        <ListingForm
          action={createListingAction}
          mode="create"
          viewerHasDefaultContact={Boolean(viewer.contactWechat)}
        />
      </section>
    </div>
  );
}
