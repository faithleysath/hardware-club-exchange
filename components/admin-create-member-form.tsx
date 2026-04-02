"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type Resolver,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { createManagedMemberAccountAction } from "@/lib/actions/admin";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import { managedMemberAccountSchema } from "@/lib/validators";

type CreateManagedMemberAccountAction = typeof createManagedMemberAccountAction;
type CreateManagedMemberAccountValues = {
  email: string;
  displayName: string;
  password: string;
  initialStatus: "pending" | "active";
};

export function AdminCreateMemberForm({
  action,
}: {
  action: CreateManagedMemberAccountAction;
}) {
  const form = useForm<CreateManagedMemberAccountValues>({
    resolver:
      zodResolver(managedMemberAccountSchema) as unknown as Resolver<CreateManagedMemberAccountValues>,
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      initialStatus: "pending",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(
    form,
    action,
    {
      onSuccess(currentForm) {
        currentForm.reset({
          email: "",
          displayName: "",
          password: "",
          initialStatus: "pending",
        });
      },
    },
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="邮箱"
          registration={form.register("email")}
          type="email"
          autoComplete="email"
          placeholder="member@example.com"
          error={getErrorMessage(form.formState.errors.email?.message)}
          description="这个邮箱以后可以直接用来登录，不开放自助注册。"
        />
        <Field
          label="展示名"
          registration={form.register("displayName")}
          placeholder="可留空，默认取邮箱前缀"
          error={getErrorMessage(form.formState.errors.displayName?.message)}
          description="显示在成员目录、发布页和审核台里。"
        />
        <Field
          label="临时密码"
          registration={form.register("password")}
          type="password"
          autoComplete="new-password"
          placeholder="至少 8 位"
          error={getErrorMessage(form.formState.errors.password?.message)}
          description="由管理员线下发给对方，当前版本暂不开放自助注册。"
        />
        <SelectField
          label="初始状态"
          registration={form.register("initialStatus")}
          error={getErrorMessage(form.formState.errors.initialStatus?.message)}
          description="设为已激活后，对方第一次登录就能直接使用平台。"
        >
          <option value="pending">待审核</option>
          <option value="active">已激活</option>
        </SelectField>
      </div>

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

      <SubmitButton pending={isPending} pendingLabel="创建中...">
        创建邮箱账号
      </SubmitButton>
    </form>
  );
}

function Field({
  label,
  registration,
  description,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  description?: string;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Input {...registration} {...props} />
      {description ? <span className="text-xs text-zinc-500">{description}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  registration,
  description,
  error,
  children,
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  description?: string;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Select {...registration}>
        {children}
      </Select>
      {description ? <span className="text-xs text-zinc-500">{description}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
