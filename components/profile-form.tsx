"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/actions/shared";
import type { Viewer } from "@/lib/auth";
import type { updateProfileAction } from "@/lib/actions/auth";

type ProfileAction = typeof updateProfileAction;

export function ProfileForm({
  viewer,
  action,
}: {
  viewer: Viewer;
  action: ProfileAction;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="展示名"
          name="displayName"
          defaultValue={viewer.displayName}
          error={state.fieldErrors.displayName}
          description="会展示在闲置列表和审核台里。"
        />
        <Field
          label="真实姓名"
          name="realName"
          defaultValue={viewer.realName ?? ""}
          error={state.fieldErrors.realName}
          description="仅社团内部使用，便于管理员识别。"
        />
        <Field
          label="微信号"
          name="contactWechat"
          defaultValue={viewer.contactWechat ?? ""}
          error={state.fieldErrors.contactWechat}
          description="作为默认联系方式使用。"
        />
        <Field
          label="部门 / 小组"
          name="department"
          defaultValue={viewer.department ?? ""}
          error={state.fieldErrors.department}
        />
        <Field
          label="入社年份"
          name="joinYear"
          defaultValue={viewer.joinYear?.toString() ?? ""}
          error={state.fieldErrors.joinYear}
          inputMode="numeric"
          placeholder="例如 2024"
        />
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

      <SubmitButton pendingLabel="保存中...">保存资料</SubmitButton>
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
