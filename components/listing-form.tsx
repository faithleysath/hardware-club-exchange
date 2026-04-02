"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import {
  useForm,
  type Resolver,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  listingConditionOptions,
  MAX_LISTING_IMAGES,
} from "@/lib/constants";
import { type ActionState } from "@/lib/actions/shared";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import { listingFormSchema } from "@/lib/validators";

type ListingFormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;
type ListingFormValues = {
  title: string;
  description: string;
  category: string;
  condition: string;
  priceYuan: string;
  campusArea: string;
  contactNote: string;
  images?: FileList;
};

type ListingFormProps = {
  action: ListingFormAction;
  mode: "create" | "edit";
  viewerHasDefaultContact: boolean;
  categoryOptions: Array<{
    value: string;
    label: string;
    description?: string | null;
    submissionHint?: string | null;
  }>;
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
  categoryOptions,
  initialValues,
}: ListingFormProps) {
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema) as unknown as Resolver<ListingFormValues>,
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      category: initialValues?.category ?? "",
      condition: initialValues?.condition ?? "",
      priceYuan: initialValues?.priceYuan ?? "",
      campusArea: initialValues?.campusArea ?? "",
      contactNote: initialValues?.contactNote ?? "",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(form, action);
  const [existingImages, setExistingImages] = useState(
    initialValues?.existingImages ?? [],
  );
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState(
    initialValues?.category ?? "",
  );
  const selectedCategory =
    categoryOptions.find((option) => option.value === selectedCategoryValue) ?? null;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-7" noValidate>
      <input
        type="hidden"
        name="retainedImageIds"
        value={existingImages.map((image) => image.id).join(",")}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="标题"
          registration={form.register("title")}
          error={getErrorMessage(form.formState.errors.title?.message)}
          description="建议写清型号、配件和成色关键词。"
        />
        <Field
          label="价格（元）"
          registration={form.register("priceYuan")}
          error={getErrorMessage(form.formState.errors.priceYuan?.message)}
          inputMode="decimal"
          placeholder="例如 199"
        />
        <SelectField
          label="分类"
          registration={form.register("category")}
          error={getErrorMessage(form.formState.errors.category?.message)}
          options={categoryOptions}
          onValueChange={setSelectedCategoryValue}
        />
        <SelectField
          label="成色"
          registration={form.register("condition")}
          error={getErrorMessage(form.formState.errors.condition?.message)}
          options={listingConditionOptions}
        />
        <Field
          label="交接地点"
          registration={form.register("campusArea")}
          error={getErrorMessage(form.formState.errors.campusArea?.message)}
          placeholder="例如 创客空间 / 北区宿舍 / 图书馆门口"
        />
        <Field
          label="补充联系方式"
          registration={form.register("contactNote")}
          error={getErrorMessage(form.formState.errors.contactNote?.message)}
          placeholder={
            viewerHasDefaultContact
              ? "可选，默认会使用个人资料里的微信号"
              : "推荐填写微信号 / QQ / 手机号"
          }
        />
      </div>

      {selectedCategory ? (
        <div className="rounded-[1.8rem] border border-zinc-200 bg-zinc-50/80 p-5">
          <p className="text-sm font-medium text-zinc-900">{selectedCategory.label}</p>
          {selectedCategory.description ? (
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              {selectedCategory.description}
            </p>
          ) : null}
          {selectedCategory.submissionHint ? (
            <p className="mt-3 text-xs leading-6 text-zinc-500">
              发布建议：{selectedCategory.submissionHint}
            </p>
          ) : null}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-medium text-zinc-800">物品描述</span>
        <Textarea
          {...form.register("description")}
          placeholder="写清楚来源、使用时长、功能是否正常、配件是否齐全，以及希望如何交接。"
        />
        {form.formState.errors.description ? (
          <span className="text-xs text-red-600">
            {getErrorMessage(form.formState.errors.description.message)}
          </span>
        ) : null}
      </label>

      <div className="space-y-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">图片</span>
          <Input
            {...form.register("images", {
              validate: (files) => {
                if (mode === "create" && (!files || files.length === 0)) {
                  return "至少上传 1 张图片";
                }

                if (files && files.length > MAX_LISTING_IMAGES) {
                  return `最多上传 ${MAX_LISTING_IMAGES} 张图片`;
                }

                return true;
              },
              onChange: (event) => {
                const fileList = event.target.files;
                setSelectedFileNames(
                  fileList
                    ? Array.from(fileList as FileList, (file) => file.name)
                    : [],
                );
              },
            })}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
          />
        </label>
        <p className="text-xs text-zinc-500">
          最多上传 {MAX_LISTING_IMAGES} 张，支持 JPG / PNG / WEBP，单张不超过 4MB。
          {mode === "edit" ? " 新上传的图片会追加到当前保留图片后面。" : ""}
        </p>
        {form.formState.errors.images ? (
          <span className="text-xs text-red-600">
            {getErrorMessage(form.formState.errors.images.message)}
          </span>
        ) : null}

        {selectedFileNames.length > 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-800">本次新增图片</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
              {selectedFileNames.map((fileName) => (
                <span key={fileName} className="rounded-full bg-white px-3 py-1">
                  {fileName}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {existingImages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {existingImages.map((image, index) => (
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
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-900">
                      当前顺序 {index + 1}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600"
                      onClick={() => {
                        setExistingImages((currentImages) =>
                          currentImages.filter((currentImage) => currentImage.id !== image.id),
                        );
                      }}
                    >
                      删除这张
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={index === 0}
                      onClick={() => {
                        setExistingImages((currentImages) => {
                          if (index === 0) {
                            return currentImages;
                          }

                          const nextImages = [...currentImages];
                          const targetImage = nextImages[index];

                          if (!targetImage) {
                            return currentImages;
                          }

                          nextImages[index] = nextImages[index - 1]!;
                          nextImages[index - 1] = targetImage;
                          return nextImages;
                        });
                      }}
                    >
                      前移
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={index === existingImages.length - 1}
                      onClick={() => {
                        setExistingImages((currentImages) => {
                          if (index >= currentImages.length - 1) {
                            return currentImages;
                          }

                          const nextImages = [...currentImages];
                          const targetImage = nextImages[index];

                          if (!targetImage) {
                            return currentImages;
                          }

                          nextImages[index] = nextImages[index + 1]!;
                          nextImages[index + 1] = targetImage;
                          return nextImages;
                        });
                      }}
                    >
                      后移
                    </button>
                    {index !== 0 ? (
                      <button
                        type="button"
                        className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        onClick={() => {
                          setExistingImages((currentImages) => {
                            const targetImage = currentImages.find(
                              (currentImage) => currentImage.id === image.id,
                            );

                            if (!targetImage) {
                              return currentImages;
                            }

                            return [
                              targetImage,
                              ...currentImages.filter(
                                (currentImage) => currentImage.id !== image.id,
                              ),
                            ];
                          });
                        }}
                      >
                        设为封面
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        当前封面
                      </span>
                    )}
                  </div>
                </div>
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

      <div className="flex flex-wrap gap-3">
        <SubmitButton
          pending={isPending}
          pendingLabel={mode === "create" ? "保存草稿中..." : "保存草稿中..."}
          variant="secondary"
          name="intent"
          value="draft"
        >
          保存草稿
        </SubmitButton>
        <SubmitButton
          pending={isPending}
          pendingLabel={mode === "create" ? "提交审核中..." : "保存中..."}
          name="intent"
          value="submit"
        >
          {mode === "create" ? "提交审核" : "保存并重新送审"}
        </SubmitButton>
      </div>
    </form>
  );
}

function Field({
  label,
  registration,
  error,
  description,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
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
  options,
  error,
  onValueChange,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  options: Array<{ value: string; label: string }>;
  error?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <Select
        {...registration}
        onChange={(event) => {
          registration.onChange(event);
          onValueChange?.(event.target.value);
        }}
      >
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
