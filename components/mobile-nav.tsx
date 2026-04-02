"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUserRound,
  FolderKanban,
  Heart,
  FilePlus2,
  Home,
  ListChecks,
  Shield,
  TriangleAlert,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Viewer } from "@/lib/auth";

const baseItems = [{ href: "/", label: "首页", icon: Home }];

export function MobileNav({ viewer }: { viewer: Viewer | null }) {
  const pathname = usePathname();

  const items = [...baseItems];

  if (!viewer) {
    items.push({
      href: "/login",
      label: "登录",
      icon: CircleUserRound,
    });
  } else if (viewer.status !== "active") {
    items.push(
      {
        href: "/waiting-approval",
        label: "审核中",
        icon: ListChecks,
      },
      {
        href: "/me/profile",
        label: "资料",
        icon: CircleUserRound,
      },
    );
  } else {
    items.push(
      {
        href: "/publish",
        label: "发布",
        icon: FilePlus2,
      },
      {
        href: "/me/listings",
        label: "我的发布",
        icon: ListChecks,
      },
      {
        href: "/me/reservations",
        label: "预约",
        icon: ListChecks,
      },
      {
        href: "/me/favorites",
        label: "收藏",
        icon: Heart,
      },
      {
        href: "/me/profile",
        label: "资料",
        icon: CircleUserRound,
      },
    );

    if (viewer.role === "admin") {
      items.push(
        {
          href: "/admin/review",
          label: "审核台",
          icon: Shield,
        },
        {
          href: "/admin/members",
          label: "成员",
          icon: Users,
        },
        {
          href: "/admin/reports",
          label: "举报",
          icon: TriangleAlert,
        },
        {
          href: "/admin/categories",
          label: "分类",
          icon: FolderKanban,
        },
      );
    }
  }

  return (
    <div className="border-t border-black/5 px-4 py-3 md:hidden">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-zinc-950 text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)]"
                  : "border border-zinc-200 bg-white text-zinc-700",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
