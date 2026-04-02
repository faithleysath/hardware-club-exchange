"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();

        if (!email) {
          setIsError(true);
          setMessage("请先输入社团邮箱。");
          return;
        }

        startTransition(async () => {
          const supabase = createSupabaseBrowserClient();
          const redirectTo = new URL("/auth/confirm", window.location.origin);

          if (nextPath) {
            redirectTo.searchParams.set("next", nextPath);
          }

          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectTo.toString(),
            },
          });

          if (error) {
            setIsError(true);
            setMessage(error.message);
            return;
          }

          setIsError(false);
          setMessage("登录链接已发出。打开邮箱里的 Magic Link 后会自动回到平台。");
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-800" htmlFor="email">
          社团邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          required
        />
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

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "发送中..." : "发送登录链接"}
      </Button>
    </form>
  );
}
