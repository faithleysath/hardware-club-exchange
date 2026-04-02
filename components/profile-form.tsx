"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type Resolver,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import type { Viewer } from "@/lib/auth";
import type { updateProfileAction } from "@/lib/actions/auth";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import { profileFormSchema } from "@/lib/validators";

type ProfileAction = typeof updateProfileAction;
type ProfileFormValues = {
  displayName: string;
  realName: string;
  contactWechat: string;
  department: string;
  joinYear: string;
};

export function ProfileForm({
  viewer,
  action,
}: {
  viewer: Viewer;
  action: ProfileAction;
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as unknown as Resolver<ProfileFormValues>,
    defaultValues: {
      displayName: viewer.displayName,
      realName: viewer.realName ?? "",
      contactWechat: viewer.contactWechat ?? "",
      department: viewer.department ?? "",
      joinYear: viewer.joinYear?.toString() ?? "",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(
    form,
    action,
    {
      onSuccess(currentForm) {
        const values = currentForm.getValues();

        currentForm.reset({
          displayName: values.displayName.trim(),
          realName: values.realName.trim(),
          contactWechat: values.contactWechat.trim(),
          department: values.department.trim(),
          joinYear: values.joinYear.trim(),
        });
      },
    },
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="展示名"
          registration={form.register("displayName")}
          error={getErrorMessage(form.formState.errors.displayName?.message)}
          description="会展示在闲置列表和审核台里。"
        />
        <Field
          label="真实姓名"
          registration={form.register("realName")}
          error={getErrorMessage(form.formState.errors.realName?.message)}
          description="仅社团内部使用，便于管理员识别。"
        />
        <Field
          label="微信号"
          registration={form.register("contactWechat")}
          error={getErrorMessage(form.formState.errors.contactWechat?.message)}
          description="作为默认联系方式使用。"
        />
        <Field
          label="部门 / 小组"
          registration={form.register("department")}
          error={getErrorMessage(form.formState.errors.department?.message)}
        />
        <Field
          label="入社年份"
          registration={form.register("joinYear")}
          error={getErrorMessage(form.formState.errors.joinYear?.message)}
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

      <SubmitButton pending={isPending} pendingLabel="保存中...">
        保存资料
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
