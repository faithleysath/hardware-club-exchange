"use client";

import Image from "next/image";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  listingCategoryOptions,
  listingConditionOptions,
  MAX_LISTING_IMAGES,
} from "@/lib/constants";
import { initialActionState, type ActionState } from "@/lib/actions/shared";

type ListingFormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type ListingFormProps = {
  action: ListingFormAction;
  mode: "create" | "edit";
  viewerHasDefaultContact: boolean;
  initialValues?: {
    title: string;
    description: string;
    category: string;
    condition: string;
    priceYuan: string;
    campusArea: string;
    contactNote: string;
    existingImages?: Array<{ id: string; url: string | null }>;
  };
};

export function ListingForm({
  action,
  mode,
  viewerHasDefaultContact,
  initialValues,
}: ListingFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-7">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="标题"
          name="title"
          defaultValue={initialValues?.title ?? ""}
          error={state.fieldErrors.title}
          description="建议写清型号、配件和成色关键词。"
        />
        <Field
          label="价格（元）"
          name="priceYuan"
          defaultValue={initialValues?.priceYuan ?? ""}
          error={state.fieldErrors.priceYuan}
          inputMode="decimal"
          placeholder="例如 199"
        />
        <SelectField
          label="分类"
          name="category"
          defaultValue={initialValues?.category ?? ""}
          error={state.fieldErrors.category}
          options={listingCategoryOptions}
        />
        <SelectField
          label="成色"
          name="condition"
          defaultValue={initialValues?.condition ?? ""}
          error={state.fieldErrors.condition}
          options={listingConditionOptions}
        />
        <Field
          label="交接地点"
          name="campusArea"
          defaultValue={initialValues?.campusArea ?? ""}
          error={state.fieldErrors.campusArea}
          placeholder="例如 创客空间 / 北区宿舍 / 图书馆门口"
        />
        <Field
          label="补充联系方式"
          name="contactNote"
          defaultValue={initialValues?.contactNote ?? ""}
          error={state.fieldErrors.contactNote}
          placeholder={
            viewerHasDefaultContact
              ? "可选，默认会使用个人资料里的微信号"
              : "推荐填写微信号 / QQ / 手机号"
          }
        />
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-800">物品描述</span>
        <Textarea
          name="description"
          defaultValue={initialValues?.description ?? ""}
          placeholder="写清楚来源、使用时长、功能是否正常、配件是否齐全，以及希望如何交接。"
        />
        {state.fieldErrors.description ? (
          <span className="text-xs text-red-600">{state.fieldErrors.description}</span>
        ) : null}
      </label>

      <div className="space-y-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">图片</span>
          <Input
            name="images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
          />
        </label>
        <p className="text-xs text-zinc-500">
          最多上传 {MAX_LISTING_IMAGES} 张，支持 JPG / PNG / WEBP，单张不超过 4MB。
          {mode === "edit" ? " 如果重新上传，将替换当前图片组。" : ""}
        </p>
        {state.fieldErrors.images ? (
          <span className="text-xs text-red-600">{state.fieldErrors.images}</span>
        ) : null}

        {initialValues?.existingImages?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {initialValues.existingImages.map((image, index) => (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white"
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={`当前图片 ${index + 1}`}
                    width={640}
                    height={320}
                    unoptimized
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                    图片不可用
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
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

      <SubmitButton pendingLabel={mode === "create" ? "提交审核中..." : "保存中..."}>
        {mode === "create" ? "提交审核" : "保存并重新送审"}
      </SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  description,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  description?: string;
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
  options,
  error,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  defaultValue?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Select name={name} defaultValue={defaultValue}>
        <option value="">请选择</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
