"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  pending?: boolean;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pending = false,
  pendingLabel = "提交中...",
  ...props
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isPending = pending || formPending;

  return (
    <Button {...props} type="submit" disabled={isPending || props.disabled}>
      {isPending ? pendingLabel : children}
    </Button>
  );
}
