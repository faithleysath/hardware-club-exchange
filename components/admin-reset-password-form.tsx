"use client";

import { useActionState, useEffect, useRef } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/actions/shared";
import type { resetMemberPasswordAction } from "@/lib/actions/admin";

type ResetMemberPasswordAction = typeof resetMemberPasswordAction;

export function AdminResetPasswordForm({
  memberId,
  email,
  action,
}: {
  memberId: string;
  email: string | null;
  action: ResetMemberPasswordAction;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const canResetPassword = Boolean(email);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (!canResetPassword) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-sm leading-7 text-zinc-500">
        这个成员当前没有邮箱，暂时不能直接设置邮箱密码。
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="memberId" value={memberId} />

      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-800">管理员重置密码</p>
        <p className="text-xs leading-6 text-zinc-500">
          当前登录邮箱：{email}。如果这个成员原本只用 GitHub 登录，重置后也会补上邮箱密码登录。
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-800">新密码</span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="至少 8 位"
        />
      </label>

      {state.fieldErrors.password ? (
        <p className="text-xs text-red-600">{state.fieldErrors.password}</p>
      ) : null}

      {state.message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton pendingLabel="重置中..." variant="secondary" size="sm">
        重置密码
      </SubmitButton>
    </form>
  );
}
