"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function InvoiceForm({
  accounts,
  incomeCategories,
}: {
  accounts: Option[];
  incomeCategories: Option[];
}) {
  const [state, setState] = useState({
    client: "",
    amount: "",
    status: "UNPAID",
    dueDate: "",
    accountId: accounts[0]?.id ?? "",
    categoryId: incomeCategories[0]?.id ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(state.amount);
    if (!state.client || !amt || amt <= 0) {
      alert("Client dan nominal wajib diisi, nominal > 0");
      return;
    }
    if (state.status === "PAID" && (!state.accountId || !state.categoryId)) {
      alert("Invoice PAID butuh akun dan kategori income");
      return;
    }
    setLoading(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: state.client,
        amount: amt,
        status: state.status,
        dueDate: state.dueDate || null,
        accountId: state.accountId,
        categoryId: state.categoryId,
      }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <Label className="text-xs text-slate-500">Client</Label>
      <Input value={state.client} onChange={(e) => setState({ ...state, client: e.target.value })} required />
      <Label className="text-xs text-slate-500">Amount (Rp)</Label>
      <Input
        type="number"
        min="0"
        value={state.amount}
        onChange={(e) => setState({ ...state, amount: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-slate-500">Status</Label>
          <select
            className={cn("h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm")}
            value={state.status}
            onChange={(e) => setState({ ...state, status: e.target.value })}
          >
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-slate-500">Due date</Label>
          <Input type="date" value={state.dueDate} onChange={(e) => setState({ ...state, dueDate: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-slate-500">Account (for PAID)</Label>
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
        </div>
        <div>
          <Label className="text-xs text-slate-500">Income category (for PAID)</Label>
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            value={state.categoryId}
            onChange={(e) => setState({ ...state, categoryId: e.target.value })}
          >
            {incomeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save invoice"}
      </Button>
    </form>
  );
}
