import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { signOutAction } from "@/lib/actions/auth";
import { type Viewer } from "@/lib/auth";
import { memberRoleLabels } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { MemberStatusBadge } from "@/components/status-badge";

export function SiteHeader({ viewer }: { viewer: Viewer | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f1e7]/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
                HC
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">
                  Hardware Club Exchange
                </p>
                <p className="truncate text-xs text-zinc-500">社团内部闲置交换平台</p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              发现闲置
            </Link>
            {viewer ? (
              <>
                <Link
                  href="/publish"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  发布闲置
                </Link>
                <Link
                  href="/me/listings"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  我的发布
                </Link>
                <Link
                  href="/me/profile"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  个人资料
                </Link>
                {viewer.role === "admin" ? (
                  <>
                    <Link
                      href="/admin/review"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      审核台
                    </Link>
                    <Link
                      href="/admin/members"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      成员管理
                    </Link>
                    <Link
                      href="/admin/audit"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      审计日志
                    </Link>
                  </>
                ) : null}
              </>
            ) : null}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {viewer ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 md:flex">
                  <div>
                    <p className="text-sm font-medium text-zinc-950">
                      {viewer.displayName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {memberRoleLabels[viewer.role]}
                    </p>
                  </div>
                  <MemberStatusBadge status={viewer.status} />
                </div>
                <form action={signOutAction}>
                  <button
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    退出登录
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className={buttonVariants({ size: "sm" })}>
                成员登录
              </Link>
            )}
          </div>
        </div>

        <MobileNav viewer={viewer} />
      </div>
    </header>
  );
}
