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
import { SavingsForm } from "@/app/components/forms/savings-form";
import { ItemActions } from "@/app/components/item-actions";

export const runtime = "nodejs";

export default async function SavingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Savings goals</CardTitle>
          <CardDescription>Track cute milestones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100));
            return (
              <div key={g.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{g.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatIDR(Number(g.currentAmount))} / {formatIDR(Number(g.targetAmount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{pct}%</p>
                    <ItemActions
                      kind="savings"
                      editLabel="Tambah"
                      endpoint="/api/savings"
                      payload={{ id: g.id, targetAmount: Number(g.targetAmount) }}
                    />
                  </div>
                </div>
                <Progress value={pct} className="mt-2" />
              </div>
            );
          })}
          {goals.length === 0 && (
            <p className="text-sm text-slate-600">No goals yet. Set a target to start saving.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add goal</CardTitle>
          <CardDescription>Set a target & deadline</CardDescription>
        </CardHeader>
        <CardContent>
          <SavingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
