"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Option = { id: string; name: string; type?: string };

export function BudgetForm({ categories }: { categories: Option[] }) {
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const today = new Date();
  const [state, setState] = useState({
    categoryId: expenseCategories[0]?.id ?? "",
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    limit: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limit = Number(state.limit);
    if (!state.categoryId || !limit || limit <= 0) {
      alert("Pilih kategori dan isi limit > 0");
      return;
    }
    setLoading(true);
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: state.categoryId,
        month: Number(state.month),
        year: Number(state.year),
        limit,
      }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-slate-500">Category (expense)</Label>
          <select
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            value={state.categoryId}
            onChange={(e) => setState({ ...state, categoryId: e.target.value })}
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs text-slate-500">Limit (Rp)</Label>
          <Input
            type="number"
            min="0"
            value={state.limit}
            onChange={(e) => setState({ ...state, limit: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-slate-500">Month</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={state.month}
            onChange={(e) => setState({ ...state, month: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Year</Label>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={state.year}
            onChange={(e) => setState({ ...state, year: Number(e.target.value) })}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save budget"}
      </Button>
    </form>
  );
}
