import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning";
}) {
  const map = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-cute-mint/70 text-slate-800",
    warning: "bg-cute-pink/70 text-slate-800",
  } as const;
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", map[tone])}>
      {children}
    </span>
  );
}

