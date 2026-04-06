"use client";

import { Button } from "@/components/ui/button";

type BaseConfig = { endpoint?: string; editLabel?: string };

type EditConfig = BaseConfig &
  (
    | { kind: "budget"; payload: { id: string; limit: number } }
    | { kind: "savings"; payload: { id: string; targetAmount: number } }
    | { kind: "debt"; payload: { id: string; remainingAmount: number } }
    | { kind: "invoice"; payload: { id: string; status: string } }
    | {
        kind: "transaction";
        payload: {
          id: string;
          amount: number;
          note?: string | null;
          type: "INCOME" | "EXPENSE";
          debtId?: string | null;
          savingsGoalId?: string | null;
        };
      }
  );

export function ItemActions(config: EditConfig, onDone?: () => void) {
  const { kind, payload } = config;
  const baseEndpoint = config.endpoint ?? `/${kind}`;
  const resourceUrl = `${baseEndpoint}/${payload.id}`;
  const editLabel = config.editLabel ?? "Edit";

  const promptNumber = (message: string, defaultValue: string) => {
    const raw = prompt(message, defaultValue);
    if (raw === null) return null;
    const numeric = Number(String(raw).replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      alert("Masukkan angka yang valid (> 0)");
      return null;
    }
    return numeric;
  };

  async function handleDelete() {
    if (!confirm("Hapus item ini?")) return;
    const res = await fetch(resourceUrl, { method: "DELETE" });
    if (!res.ok) {
      alert("Gagal hapus");
      return;
    }
    onDone?.();
    window.location.reload();
  }

  async function handleEdit() {
    let body: any = {};
    if (kind === "budget") {
      const val = promptNumber("Limit baru (Rp)", String((payload as any).limit ?? ""));
      if (val === null) return;
      body.limit = val;
    } else if (kind === "savings") {
      const val = promptNumber("Target baru (Rp)", String((payload as any).targetAmount ?? ""));
      if (val === null) return;
      body.targetAmount = val;
    } else if (kind === "debt") {
      const val = promptNumber(
        "Sisa hutang baru (Rp)",
        String((payload as any).remainingAmount ?? "")
      );
      if (val === null) return;
      body.remainingAmount = val;
    } else if (kind === "invoice") {
      const val = prompt("Status (PAID/UNPAID)", String((payload as any).status ?? "UNPAID"));
      if (!val) return;
      body.status = val.toUpperCase();
    } else if (kind === "transaction") {
      const txPayload = payload as any;
      const val = promptNumber("Nominal baru (Rp)", String(txPayload.amount ?? ""));
      if (val === null) return;
      const noteInput = prompt("Catatan (opsional)", txPayload.note ?? "");
      if (noteInput === null) return;
      body.amount = val;
      body.note = noteInput;
    }
    const res = await fetch(resourceUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert("Gagal edit");
      return;
    }
    onDone?.();
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handleEdit}>
        {editLabel}
      </Button>
      <Button size="sm" variant="ghost" className="text-rose-600" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
