"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { createReportAction } from "@/lib/actions/engagement";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import { reportCreateSchema } from "@/lib/validators";

type CreateReportAction = typeof createReportAction;
type ReportFormValues = {
  listingId: string;
  reason: string;
};

export function ReportForm({
  listingId,
  action,
}: {
  listingId: string;
  action: CreateReportAction;
}) {
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportCreateSchema) as unknown as Resolver<ReportFormValues>,
    defaultValues: {
      listingId,
      reason: "",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(form, action, {
    onSuccess(currentForm) {
      currentForm.reset({
        listingId,
        reason: "",
      });
    },
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" {...form.register("listingId")} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-900">举报内容</p>
        <p className="text-xs leading-6 text-zinc-500">
          仅在明显违规、虚假或不适合公开时使用，管理员会看到你的说明。
        </p>
      </div>

      <Textarea
        {...form.register("reason")}
        placeholder="例如：图片与描述严重不符，且联系方式存在明显引流信息。"
      />
      {form.formState.errors.reason ? (
        <p className="text-xs text-red-600">
          {getErrorMessage(form.formState.errors.reason.message)}
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

      <SubmitButton pending={isPending} pendingLabel="提交中..." variant="secondary">
        提交举报
      </SubmitButton>
    </form>
  );
}
