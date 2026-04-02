"use client";

import { useRef, useState, useTransition } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  initialActionState,
  type ActionState,
} from "@/lib/actions/shared";

export type StatefulFormAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type UseServerActionFormOptions<TValues extends FieldValues> = {
  onSuccess?: (
    form: UseFormReturn<TValues>,
    formElement: HTMLFormElement,
    nextState: ActionState,
  ) => void;
};

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return undefined;
}

export function useServerActionForm<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  action: StatefulFormAction,
  options: UseServerActionFormOptions<TValues> = {},
) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<ActionState>(initialActionState);
  const [isPending, startTransition] = useTransition();

  const onSubmit = form.handleSubmit((_values, event) => {
    const formElement = event?.currentTarget;

    if (!formElement) {
      return;
    }

    startTransition(async () => {
      const nextState = await action(state, new FormData(formElement));

      setState(nextState);
      form.clearErrors();

      for (const [field, message] of Object.entries(nextState.fieldErrors)) {
        form.setError(field as Path<TValues>, {
          type: "server",
          message,
        });
      }

      if (nextState.status === "success") {
        options.onSuccess?.(form, formElement, nextState);
      }
    });
  });

  return {
    formRef,
    state,
    isPending,
    onSubmit,
  };
}
