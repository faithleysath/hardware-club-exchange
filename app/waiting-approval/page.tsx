import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { MemberStatusBadge } from "@/components/status-badge";
import { updateProfileAction } from "@/lib/actions/auth";
import { requireAuthenticatedViewer } from "@/lib/auth";

export const metadata = {
  title: "等待成员审核",
};

export default async function WaitingApprovalPage() {
  const viewer = await requireAuthenticatedViewer();

  if (viewer.status === "active") {
    redirect("/");
  }

  const title =
    viewer.status === "pending" ? "你的账号正在等待管理员激活" : "当前账号已被暂停";
  const description =
    viewer.status === "pending"
      ? "先把资料补完整，管理员会根据这些信息完成成员审核。"
      : "如需恢复，请联系管理员核实成员状态。你仍然可以更新资料。";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[2.5rem] border border-black/5 bg-zinc-950 p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.16)]">
        <div className="space-y-5">
          <MemberStatusBadge status={viewer.status} />
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="text-base leading-8 text-zinc-300">{description}</p>
          <p className="text-sm leading-7 text-zinc-400">
            你现在还不能浏览闲置详情或发布内容，但管理员看到的是你当前填写的最新资料。
          </p>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-zinc-500">成员资料</p>
          <h2 className="text-3xl font-semibold text-zinc-950">先把身份信息交代清楚</h2>
        </div>
        <ProfileForm viewer={viewer} action={updateProfileAction} />
      </section>
    </div>
  );
}
