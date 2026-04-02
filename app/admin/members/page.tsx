import {
  createManagedMemberAccountAction,
  deleteMemberAction,
  resetMemberPasswordAction,
  updateMemberRoleAction,
  updateMemberStatusAction,
} from "@/lib/actions/admin";
import { requireAdminViewer } from "@/lib/auth";
import { AdminDeleteMemberForm } from "@/components/admin-delete-member-form";
import { AdminResetPasswordForm } from "@/components/admin-reset-password-form";
import { getMemberDirectory } from "@/lib/data/admin";
import { AdminCreateMemberForm } from "@/components/admin-create-member-form";
import { MemberStatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { memberRoleLabels } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "成员管理",
};

export default async function AdminMembersPage() {
  const viewer = await requireAdminViewer();
  const members = await getMemberDirectory();
  const activeAdminCount = members.filter(
    ({ profile }) => profile.role === "admin" && profile.status === "active",
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium text-zinc-500">成员管理</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          决定谁能进入平台，以及谁能参与审核
        </h1>
      </section>

      <section className="rounded-[2.2rem] border border-black/5 bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-zinc-500">管理员创建账号</p>
          <h2 className="text-2xl font-semibold text-zinc-950">
            为没有 GitHub 的成员预先创建邮箱密码账号
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-zinc-500">
            这类账号不能自行注册，只能由管理员在这里创建。创建后，对方可以直接用邮箱和密码登录；
            是否允许立即进入平台，由你这里设定的初始状态决定。
          </p>
        </div>

        <AdminCreateMemberForm action={createManagedMemberAccountAction} />
      </section>

      <div className="grid gap-6">
        {members.map(({ profile, email }) => (
          <article
            key={profile.id}
            className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-zinc-950">
                    {profile.displayName}
                  </h2>
                  <MemberStatusBadge status={profile.status} />
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                    {memberRoleLabels[profile.role]}
                  </span>
                  {viewer.id === profile.id ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      当前账号
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-2 text-sm text-zinc-600 md:grid-cols-2 xl:grid-cols-3">
                  <p>邮箱：{email ?? "未同步"}</p>
                  <p>真实姓名：{profile.realName || "未填写"}</p>
                  <p>微信：{profile.contactWechat || "未填写"}</p>
                  <p>部门：{profile.department || "未填写"}</p>
                  <p>入社年份：{profile.joinYear || "未填写"}</p>
                  <p>注册时间：{formatDateTime(profile.createdAt)}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <form action={updateMemberStatusAction}>
                  <input type="hidden" name="memberId" value={profile.id} />
                  <input
                    type="hidden"
                    name="nextStatus"
                    value={profile.status === "active" ? "suspended" : "active"}
                  />
                  <SubmitButton
                    pendingLabel="处理中..."
                    variant={profile.status === "active" ? "danger" : "secondary"}
                    size="sm"
                    className="w-full"
                  >
                    {profile.status === "active" ? "暂停成员资格" : "激活成员资格"}
                  </SubmitButton>
                </form>

                <form action={updateMemberRoleAction}>
                  <input type="hidden" name="memberId" value={profile.id} />
                  <input
                    type="hidden"
                    name="nextRole"
                    value={profile.role === "admin" ? "member" : "admin"}
                  />
                  <SubmitButton
                    pendingLabel="处理中..."
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    {profile.role === "admin" ? "降为普通成员" : "提升为管理员"}
                  </SubmitButton>
                </form>
              </div>
            </div>

            <div className="mt-5 grid gap-5 border-t border-zinc-100 pt-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <AdminResetPasswordForm
                memberId={profile.id}
                email={email}
                action={resetMemberPasswordAction}
              />

              <AdminDeleteMemberForm
                memberId={profile.id}
                displayName={profile.displayName}
                email={email}
                action={deleteMemberAction}
                disabledReason={
                  viewer.id === profile.id
                    ? "当前登录的管理员账号不能在这里直接删除。"
                    : profile.role === "admin" &&
                        profile.status === "active" &&
                        activeAdminCount <= 1
                      ? "系统至少要保留 1 名激活管理员，所以这个账号暂时不能删除。"
                      : undefined
                }
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
