"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SavingsForm() {
  const [state, setState] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = Number(state.targetAmount);
    if (!state.name || !target || target <= 0) {
      alert("Nama dan target harus diisi, target > 0");
      return;
    }
    setLoading(true);
    await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: state.name,
        targetAmount: target,
        deadline: state.deadline || null,
      }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <Label className="text-xs text-slate-500">Name</Label>
      <Input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} required />
      <Label className="text-xs text-slate-500">Target (Rp)</Label>
      <Input
        type="number"
        min="0"
        value={state.targetAmount}
        onChange={(e) => setState({ ...state, targetAmount: e.target.value })}
        required
      />
      <Label className="text-xs text-slate-500">Deadline (optional)</Label>
      <Input
        type="date"
        value={state.deadline}
        onChange={(e) => setState({ ...state, deadline: e.target.value })}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save goal"}
      </Button>
    </form>
  );
}
