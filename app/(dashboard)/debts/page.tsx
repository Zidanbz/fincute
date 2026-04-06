import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatIDR } from "@/lib/utils";
import { DebtForm } from "@/app/components/forms/debt-form";
import { ItemActions } from "@/app/components/item-actions";

export const runtime = "nodejs";

export default async function DebtsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const debts = await prisma.debt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Debt tracker</CardTitle>
          <CardDescription>Chip away and celebrate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {debts.map((d) => {
            const paid = Number(d.totalAmount) - Number(d.remainingAmount);
            const pct = Math.min(100, Math.round((paid / Number(d.totalAmount)) * 100));
            return (
              <div key={d.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatIDR(paid)} dibayar / {formatIDR(Number(d.totalAmount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{pct}%</p>
                    <ItemActions
                      kind="debt"
                      editLabel="Tambah"
                      endpoint="/api/debts"
                      payload={{ id: d.id, remainingAmount: Number(d.remainingAmount) }}
                    />
                  </div>
                </div>
                <Progress value={pct} className="mt-2" />
              </div>
            );
          })}
          {debts.length === 0 && (
            <p className="text-sm text-slate-600">No debts tracked. Add one to stay on top.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add debt</CardTitle>
          <CardDescription>Track remaining payments</CardDescription>
        </CardHeader>
        <CardContent>
          <DebtForm />
        </CardContent>
      </Card>
    </div>
  );
}
