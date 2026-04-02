"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import type { resetMemberPasswordAction } from "@/lib/actions/admin";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import { adminPasswordResetSchema } from "@/lib/validators";

type ResetMemberPasswordAction = typeof resetMemberPasswordAction;
type ResetMemberPasswordValues = {
  memberId: string;
  password: string;
};

export function AdminResetPasswordForm({
  memberId,
  email,
  action,
}: {
  memberId: string;
  email: string | null;
  action: ResetMemberPasswordAction;
}) {
  const canResetPassword = Boolean(email);

  const form = useForm<ResetMemberPasswordValues>({
    resolver:
      zodResolver(adminPasswordResetSchema) as unknown as Resolver<ResetMemberPasswordValues>,
    defaultValues: {
      memberId,
      password: "",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(
    form,
    action,
    {
      onSuccess(currentForm) {
        currentForm.reset({
          memberId,
          password: "",
        });
      },
    },
  );

  if (!canResetPassword) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-sm leading-7 text-zinc-500">
        这个成员当前没有邮箱，暂时不能直接设置邮箱密码。
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" {...form.register("memberId")} />

      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-800">管理员重置密码</p>
        <p className="text-xs leading-6 text-zinc-500">
          当前登录邮箱：{email}。如果这个成员原本只用 GitHub 登录，重置后也会补上邮箱密码登录。
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-800">新密码</span>
        <Input
          {...form.register("password")}
          type="password"
          autoComplete="new-password"
          placeholder="至少 8 位"
        />
      </label>

      {form.formState.errors.password ? (
        <p className="text-xs text-red-600">
          {getErrorMessage(form.formState.errors.password.message)}
        </p>
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

      <SubmitButton
        pending={isPending}
        pendingLabel="重置中..."
        variant="secondary"
        size="sm"
      >
        重置密码
      </SubmitButton>
    </form>
  );
}
