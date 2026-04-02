import { ProfileForm } from "@/components/profile-form";
import { updateProfileAction } from "@/lib/actions/auth";
import { requireAuthenticatedViewer } from "@/lib/auth";

export const metadata = {
  title: "个人资料",
};

export default async function ProfilePage() {
  const viewer = await requireAuthenticatedViewer();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium text-zinc-500">个人资料</p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
            把默认联系方式和成员信息维护好
          </h1>
        </div>
        <ProfileForm viewer={viewer} action={updateProfileAction} />
      </section>
    </div>
  );
}
