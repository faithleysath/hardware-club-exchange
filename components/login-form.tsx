"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  nextPath?: string;
  initialMessage?: string | null;
  initialMessageIsError?: boolean;
};

function getPasswordSignInErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials")
  ) {
    return "邮箱或密码不正确，请检查后再试。";
  }

  if (normalized.includes("email not confirmed")) {
    return "这个邮箱还没有被确认，请联系管理员重新创建或检查认证配置。";
  }

  return "邮箱登录失败，请稍后再试。";
}

export function LoginForm({
  nextPath,
  initialMessage = null,
  initialMessageIsError = false,
}: LoginFormProps) {
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [isError, setIsError] = useState(initialMessageIsError);
  const [isOAuthPending, startOAuthTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : "/";

  return (
    <div className="space-y-6">
      <div className="rounded-[1.6rem] border border-zinc-200 bg-zinc-50/80 p-5 text-sm leading-7 text-zinc-600">
        首次登录会自动创建成员档案。当前系统还没有成员数据时，第一位登录成功的账号会自动成为管理员。
        如果你没有 GitHub，需要由管理员先在成员管理里为你创建邮箱密码账号。
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

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "").trim().toLowerCase();
          const password = String(formData.get("password") ?? "");

          if (!email) {
            setIsError(true);
            setMessage("请输入邮箱。");
            return;
          }

          if (!password) {
            setIsError(true);
            setMessage("请输入密码。");
            return;
          }

          startPasswordTransition(async () => {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setIsError(true);
              setMessage(getPasswordSignInErrorMessage(error.message));
              return;
            }

            setIsError(false);
            setMessage("登录成功，正在进入平台...");
            window.location.assign(safeNextPath);
          });
        }}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800">邮箱登录</p>
          <p className="text-xs leading-6 text-zinc-500">
            仅限管理员预先创建的账号使用，不提供公开注册入口。
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-800">邮箱</span>
          <Input name="email" type="email" autoComplete="email" placeholder="member@example.com" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-800">密码</span>
          <Input name="password" type="password" autoComplete="current-password" />
        </label>

        <Button className="w-full" type="submit" disabled={isOAuthPending || isPasswordPending}>
          {isPasswordPending ? "登录中..." : "使用邮箱密码登录"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800">GitHub 登录</p>
          <p className="text-xs leading-6 text-zinc-500">
            如果你已有 GitHub 账号，仍然可以走现有 OAuth 流程。
          </p>
        </div>

        <Button
          className="w-full"
          type="button"
          disabled={isOAuthPending || isPasswordPending}
          onClick={() => {
            startOAuthTransition(async () => {
              const supabase = createSupabaseBrowserClient();
              const redirectTo = new URL("/auth/callback", window.location.origin);

              if (safeNextPath !== "/") {
                redirectTo.searchParams.set("next", safeNextPath);
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
          {isOAuthPending ? "跳转中..." : "使用 GitHub 登录"}
        </Button>

        <p className="text-center text-xs leading-6 text-zinc-500">
          如果按钮点击后提示 provider 未启用，需要先在 Supabase Auth 里开启 GitHub Provider，
          并把当前站点的 `/auth/callback` 加入重定向白名单。
        </p>
      </div>
    </div>
  );
}
