import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning" | "success" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "neutral" && "bg-zinc-200 text-zinc-700",
        tone === "warning" && "bg-amber-100 text-amber-800",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "danger" && "bg-red-100 text-red-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
