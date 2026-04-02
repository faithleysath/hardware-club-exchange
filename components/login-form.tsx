"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  nextPath?: string;
  initialMessage?: string | null;
  initialMessageIsError?: boolean;
};

export function LoginForm({
  nextPath,
  initialMessage = null,
  initialMessageIsError = false,
}: LoginFormProps) {
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [isError, setIsError] = useState(initialMessageIsError);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-zinc-200 bg-zinc-50/80 p-5 text-sm leading-7 text-zinc-600">
        首次登录会自动创建成员档案。当前系统还没有成员数据时，第一位登录成功的账号会自动成为管理员。
      </div>

      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <Button
        className="w-full"
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const supabase = createSupabaseBrowserClient();
            const redirectTo = new URL("/auth/callback", window.location.origin);

            if (nextPath) {
              redirectTo.searchParams.set("next", nextPath);
            }

            const { error } = await supabase.auth.signInWithOAuth({
              provider: "github",
              options: {
                redirectTo: redirectTo.toString(),
              },
            });

            if (error) {
              setIsError(true);
              setMessage(error.message);
              return;
            }

            setIsError(false);
            setMessage("正在跳转到 GitHub 授权...");
          });
        }}
      >
        {isPending ? "跳转中..." : "使用 GitHub 登录"}
      </Button>

      <p className="text-center text-xs leading-6 text-zinc-500">
        如果按钮点击后提示 provider 未启用，需要先在 Supabase Auth 里开启 GitHub Provider，
        并把当前站点的 `/auth/callback` 加入重定向白名单。
      </p>
    </div>
  );
}
