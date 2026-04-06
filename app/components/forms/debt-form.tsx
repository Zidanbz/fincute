"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DebtForm() {
  const [state, setState] = useState({
    name: "",
    totalAmount: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const total = Number(state.totalAmount);
    if (!state.name || !total || total <= 0) {
      alert("Nama dan total harus diisi, total > 0");
      return;
    }
    setLoading(true);
    await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: state.name,
        totalAmount: total,
        dueDate: state.dueDate || null,
      }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <Label className="text-xs text-slate-500">Name</Label>
      <Input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} required />
      <Label className="text-xs text-slate-500">Total (Rp)</Label>
      <Input
        type="number"
        min="0"
        value={state.totalAmount}
        onChange={(e) => setState({ ...state, totalAmount: e.target.value })}
        required
      />
      <Label className="text-xs text-slate-500">Due date (optional)</Label>
      <Input type="date" value={state.dueDate} onChange={(e) => setState({ ...state, dueDate: e.target.value })} />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save debt"}
      </Button>
    </form>
  );
}
