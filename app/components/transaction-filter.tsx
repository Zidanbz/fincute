"use client";

import { Button } from "@/components/ui/button";
import { useTransactionFilter } from "@/lib/store";

export function TransactionFilter() {
  const { view, setView } = useTransactionFilter();
  const options: { label: string; value: typeof view }[] = [
    { label: "All", value: "ALL" },
    { label: "Income", value: "INCOME" },
    { label: "Expense", value: "EXPENSE" },
  ];
  return (
    <div className="mb-3 flex gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={view === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => setView(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

