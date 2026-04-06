"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function AddTransactionForm({
  accounts,
  categories,
  savingsGoals,
  debts,
}: {
  accounts: Option[];
  categories: Option[];
  savingsGoals?: Option[];
  debts?: Option[];
}) {
  const [state, setState] = useState(() => ({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    type: "EXPENSE",
    accountId: accounts[0]?.id ?? "",
    categoryId: categories[0]?.id ?? "",
    savingsGoalId: savingsGoals?.[0]?.id ?? "",
    debtId: debts?.[0]?.id ?? "",
    note: "",
  }));
  const [loading, setLoading] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(String(state.amount).replace(/[^0-9]/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      alert("Nominal harus lebih besar dari 0");
      return;
    }
    if (!state.accountId || !state.categoryId) {
      alert("Pilih akun dan kategori");
      return;
    }

    setLoading(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...state,
        amount: numericAmount,
      }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Amount">
          <Input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            value={
              amountDisplay ||
              (state.amount ? new Intl.NumberFormat("id-ID").format(Number(state.amount)) : "")
            }
            placeholder="Rp0"
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              if (!raw) {
                setAmountDisplay("");
                setState((s) => ({ ...s, amount: "" }));
                return;
              }
              const numeric = Number(raw);
              const formatted = new Intl.NumberFormat("id-ID").format(numeric);
              setAmountDisplay(formatted);
              setState((s) => ({ ...s, amount: numeric }));
            }}
            onBlur={() => {
              const numeric = Number(state.amount);
              setAmountDisplay(numeric ? new Intl.NumberFormat("id-ID").format(numeric) : "");
            }}
            required
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={state.date}
            onChange={(e) => setState({ ...state, date: e.target.value })}
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Type">
          <select
            className={cn(
              "h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            )}
            value={state.type}
            onChange={(e) => setState({ ...state, type: e.target.value })}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </Field>
        <Field label="Account">
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            value={state.accountId}
            onChange={(e) => setState({ ...state, accountId: e.target.value })}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Category">
        <select
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          value={state.categoryId}
          onChange={(e) => setState({ ...state, categoryId: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      {savingsGoals && savingsGoals.length > 0 && (
        <Field label="Link to savings goal (optional)">
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            value={state.savingsGoalId}
            onChange={(e) => setState({ ...state, savingsGoalId: e.target.value })}
          >
            <option value="">-- None --</option>
            {savingsGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {debts && debts.length > 0 && (
        <Field label="Link to debt (optional)">
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            value={state.debtId}
            onChange={(e) => setState({ ...state, debtId: e.target.value })}
          >
            <option value="">-- None --</option>
            {debts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Note">
        <Input value={state.note} onChange={(e) => setState({ ...state, note: e.target.value })} />
      </Field>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Quick add"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500">{label}</Label>
      {children}
    </div>
  );
}
