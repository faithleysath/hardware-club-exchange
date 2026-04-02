"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { createReservationRequestAction } from "@/lib/actions/engagement";
import {
  getErrorMessage,
  useServerActionForm,
} from "@/lib/client-action-form";
import { reservationRequestSchema } from "@/lib/validators";

type CreateReservationRequestAction = typeof createReservationRequestAction;
type ReservationRequestFormValues = {
  listingId: string;
  message: string;
};

export function ReservationRequestForm({
  listingId,
  action,
}: {
  listingId: string;
  action: CreateReservationRequestAction;
}) {
  const form = useForm<ReservationRequestFormValues>({
    resolver:
      zodResolver(reservationRequestSchema) as unknown as Resolver<ReservationRequestFormValues>,
    defaultValues: {
      listingId,
      message: "",
    },
    mode: "onBlur",
  });
  const { formRef, state, isPending, onSubmit } = useServerActionForm(form, action, {
    onSuccess(currentForm) {
      currentForm.reset({
        listingId,
        message: "",
      });
    },
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" {...form.register("listingId")} />
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-900">发起预约</p>
        <p className="text-xs leading-6 text-zinc-500">
          可以补一句你的使用场景、希望的交接时间，卖家会按顺序处理。
        </p>
      </div>

      <Textarea
        {...form.register("message")}
        placeholder="例如：我这周都在实验室，想优先约周三晚上面交。"
      />
      {form.formState.errors.message ? (
        <p className="text-xs text-red-600">
          {getErrorMessage(form.formState.errors.message.message)}
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

      <SubmitButton pending={isPending} pendingLabel="发送中...">
        发送预约
      </SubmitButton>
    </form>
  );
}
