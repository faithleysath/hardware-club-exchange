"use client";

import { useActionState, useEffect, useRef } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/actions/shared";
import type { createManagedMemberAccountAction } from "@/lib/actions/admin";

type CreateManagedMemberAccountAction = typeof createManagedMemberAccountAction;

export function AdminCreateMemberForm({
  action,
}: {
  action: CreateManagedMemberAccountAction;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="邮箱"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="member@example.com"
          error={state.fieldErrors.email}
          description="这个邮箱以后可以直接用来登录，不开放自助注册。"
        />
        <Field
          label="展示名"
          name="displayName"
          placeholder="可留空，默认取邮箱前缀"
          error={state.fieldErrors.displayName}
          description="显示在成员目录、发布页和审核台里。"
        />
        <Field
          label="临时密码"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="至少 8 位"
          error={state.fieldErrors.password}
          description="由管理员线下发给对方，当前版本暂不开放自助注册。"
        />
        <SelectField
          label="初始状态"
          name="initialStatus"
          error={state.fieldErrors.initialStatus}
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

      <SubmitButton pendingLabel="创建中...">创建邮箱账号</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  description,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  description?: string;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Input name={name} {...props} />
      {description ? <span className="text-xs text-zinc-500">{description}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  description,
  error,
  children,
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  description?: string;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Select name={name} defaultValue="pending">
        {children}
      </Select>
      {description ? <span className="text-xs text-zinc-500">{description}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
