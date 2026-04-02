import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export function buttonVariants({
  variant = "primary",
  size = "md",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" &&
      "bg-zinc-950 text-white shadow-[0_10px_35px_rgba(15,23,42,0.2)] hover:bg-zinc-800",
    variant === "secondary" &&
      "border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50",
    variant === "ghost" &&
      "text-zinc-700 hover:bg-white/70 hover:text-zinc-950",
    variant === "danger" &&
      "bg-red-600 text-white hover:bg-red-700",
    size === "md" && "h-11 px-5 text-sm",
    size === "sm" && "h-9 px-4 text-sm",
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
