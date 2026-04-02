"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver, type UseFormRegisterReturn } from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { updateCategorySettingAction } from "@/lib/actions/categories";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import type { CategorySettingRecord } from "@/lib/data/categories";
import { categorySettingSchema } from "@/lib/validators";

type UpdateCategorySettingAction = typeof updateCategorySettingAction;
type CategorySettingFormValues = {
  category: CategorySettingRecord["category"];
  label: string;
  description: string;
  submissionHint: string;
  sortOrder: string;
  isActive: string;
};

export function CategorySettingForm({
  item,
  action,
}: {
  item: CategorySettingRecord;
  action: UpdateCategorySettingAction;
}) {
  const form = useForm<CategorySettingFormValues>({
    resolver:
      zodResolver(categorySettingSchema) as unknown as Resolver<CategorySettingFormValues>,
    defaultValues: {
      category: item.category,
      label: item.label,
      description: item.description ?? "",
      submissionHint: item.submissionHint ?? "",
      sortOrder: String(item.sortOrder),
      isActive: item.isActive ? "true" : "false",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(form, action);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5 rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)]" noValidate>
      <input type="hidden" {...form.register("category")} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-500">{item.category}</p>
        <h2 className="text-2xl font-semibold text-zinc-950">{item.label}</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="显示名称"
          registration={form.register("label")}
          error={getErrorMessage(form.formState.errors.label?.message)}
        />
        <Field
          label="排序"
          registration={form.register("sortOrder")}
          error={getErrorMessage(form.formState.errors.sortOrder?.message)}
          inputMode="numeric"
        />
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-800">分类描述</span>
        <Textarea {...form.register("description")} />
        {form.formState.errors.description ? (
          <span className="text-xs text-red-600">
            {getErrorMessage(form.formState.errors.description.message)}
          </span>
        ) : null}
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-800">发布建议</span>
        <Textarea {...form.register("submissionHint")} />
        {form.formState.errors.submissionHint ? (
          <span className="text-xs text-red-600">
            {getErrorMessage(form.formState.errors.submissionHint.message)}
          </span>
        ) : null}
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-800">当前状态</span>
        <Select {...form.register("isActive")}>
          <option value="true">启用，成员可见</option>
          <option value="false">停用，仅保留历史数据</option>
        </Select>
      </label>

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

      <SubmitButton pending={isPending} pendingLabel="保存中..." className="w-full">
        保存分类配置
      </SubmitButton>
    </form>
  );
}

function Field({
  label,
  registration,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Input {...registration} {...props} />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
