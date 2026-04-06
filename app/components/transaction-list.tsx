"use client";

import { format } from "date-fns";
import { BadgeDollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Transaction, WalletAccount, Category } from "@prisma/client";
import { ItemActions } from "@/app/components/item-actions";
import { useTransactionFilter } from "@/lib/store";
import { formatIDR } from "@/lib/utils";

type Tx = Transaction & { account: WalletAccount; category: Category };

export function TransactionList({ transactions }: { transactions: Tx[] }) {
  const view = useTransactionFilter((s) => s.view);
  const filtered =
    view === "ALL" ? transactions : transactions.filter((t) => t.type === view);

  return (
    <div className="space-y-2">
      {filtered.map((tx) => (
        <div
          key={tx.id}
          className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              {tx.type === "INCOME" ? (
                <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-rose-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{tx.category.name}</p>
              <p className="text-xs text-slate-500">
                {format(tx.date, "MMM d, yyyy")} • {tx.account.name}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {formatIDR(Number(tx.amount))}
              </p>
              {tx.note && <p className="text-xs text-slate-500">{tx.note}</p>}
            </div>
            <ItemActions
              kind="transaction"
              endpoint="/api/transactions"
              payload={{
                id: tx.id,
                amount: Number(tx.amount),
                note: tx.note,
                type: tx.type,
                debtId: (tx as any).debtId,
                savingsGoalId: (tx as any).savingsGoalId,
              }}
            />
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
          <BadgeDollarSign className="h-6 w-6 text-cute-purple" />
          <p className="mt-2 text-sm font-semibold text-slate-900">No transactions yet</p>
          <p className="text-xs text-slate-500">Add your first income or expense.</p>
        </div>
      )}
    </div>
  );
}
