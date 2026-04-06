"use client";

import { cn } from "@/lib/utils";

export function InsightBadge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "warning" | "positive";
}) {
  const colors =
    tone === "warning"
      ? "bg-cute-pink/50 text-slate-900"
      : tone === "positive"
      ? "bg-cute-mint/60 text-slate-900"
      : "bg-cute-blue/40 text-slate-900";
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-medium shadow-sm transition hover:shadow-md",
        colors
      )}
    >
      {label}
    </div>
  );
}

