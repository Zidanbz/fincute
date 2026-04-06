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
import { startOfMonth, endOfMonth } from "date-fns";
import { formatIDR } from "@/lib/utils";
import { BudgetForm } from "@/app/components/forms/budget-form";
import { ItemActions } from "@/app/components/item-actions";

export const runtime = "nodejs";

export default async function BudgetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: { category: true },
  });
  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
  });
  const spends = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      date: { gte: startOfMonth(now), lte: endOfMonth(now) },
    },
    _sum: { amount: true },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Budget planner</CardTitle>
          <CardDescription>This month&apos;s limits per category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.map((b) => {
            const spent = Number(spends.find((s) => s.categoryId === b.categoryId)?._sum.amount ?? 0);
            const pct = Math.min(100, Math.round((spent / Number(b.limit)) * 100));
            return (
              <div key={b.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{b.category.name}</p>
                    <p className="text-xs text-slate-500">
                      Used {formatIDR(spent)} / {formatIDR(Number(b.limit))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{pct}%</p>
                    <ItemActions
                      kind="budget"
                      editLabel="Tambah"
                      endpoint="/budget"
                      payload={{ id: b.id, limit: Number(b.limit) }}
                    />
                  </div>
                </div>
                <Progress value={pct} className="mt-2" />
              </div>
            );
          })}
          {budgets.length === 0 && (
            <p className="text-sm text-slate-600">No budgets yet. Add a category budget to start.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add budget</CardTitle>
          <CardDescription>Set limit per category</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
