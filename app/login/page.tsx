import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getCurrentViewer } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "成员登录",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect(viewer.status === "active" ? "/" : "/waiting-approval");
  }

  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : undefined;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2.5rem] border border-black/5 bg-zinc-950 p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.14)]">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Access</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          用社团邮箱进入内部交换平台
        </h1>
        <p className="mt-5 text-base leading-8 text-zinc-300">
          登录成功后，系统会自动创建你的成员档案。首位进入平台的账号会被自动设为管理员，
          之后的新成员默认进入待审核状态。
        </p>
      </section>

      <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)]">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-zinc-500">Magic Link 登录</p>
          <h2 className="text-3xl font-semibold text-zinc-950">输入邮箱，剩下交给系统</h2>
        </div>
        <LoginForm nextPath={nextPath} />
      </section>
    </div>
  );
}
