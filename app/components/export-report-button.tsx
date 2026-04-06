"use client";

import { Button } from "@/components/ui/button";

type Summary = {
  totalBalance: number;
  income: number;
  expense: number;
  profit: number;
  txCount: number;
  periodLabel: string;
};

export function ExportReportButton({ summary }: { summary: Summary }) {
  function handleExport() {
    const rows = [
      ["Period", summary.periodLabel],
      ["Total Balance", summary.totalBalance],
      ["Income", summary.income],
      ["Expense", summary.expense],
      ["Profit/Loss", summary.profit],
      ["Transactions", summary.txCount],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fincute-report-${summary.periodLabel.replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      Export CSV
    </Button>
  );
}
