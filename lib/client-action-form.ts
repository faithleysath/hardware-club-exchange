"use client";

import { type FormEvent, useRef, useState, useTransition } from "react";
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

function getActionErrorState(error: unknown): ActionState {
  const details = getErrorMessage(error);
  const baseMessage = "操作失败，请稍后重试。";

  return {
    status: "error",
    message:
      process.env.NODE_ENV === "development" && details
        ? `${baseMessage} ${details}`
        : baseMessage,
    fieldErrors: {},
  };
}

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formElement = event.currentTarget;

    return form.handleSubmit(() => {
      startTransition(async () => {
        try {
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
        } catch (error) {
          form.clearErrors();
          setState(getActionErrorState(error));
        }
      });
    })(event);
  };

  return {
    formRef,
    state,
    isPending,
    onSubmit,
  };
}
