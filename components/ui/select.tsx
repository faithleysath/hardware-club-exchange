import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";
