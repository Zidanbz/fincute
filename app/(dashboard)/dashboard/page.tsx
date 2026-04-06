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
import { Button } from "@/components/ui/button";
import { PiggyBank, TrendingUp, Wallet, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { OverviewChart } from "@/app/components/overview-chart";
import { TransactionList } from "@/app/components/transaction-list";
import { InsightBadge } from "@/app/components/insight-badge";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { formatIDR } from "@/lib/utils";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const [accounts, transactions, insights] = await Promise.all([
    prisma.walletAccount.findMany({ where: { userId: session.user.id } }),
    prisma.transaction.findMany({
      where: { userId: session.user.id, date: { gte: subMonths(now, 1) } },
      orderBy: { date: "desc" },
      include: { category: true, account: true },
    }),
    getInsights(session.user.id),
  ]);

  // sanitize Decimal for client components
  const plainAccounts = accounts.map((a) => ({ ...a, balance: Number(a.balance) }));
  const plainTransactions = transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    account: { ...t.account, balance: Number(t.account.balance) },
  }));

  const totalBalance = plainAccounts.reduce((sum, a) => sum + a.balance, 0);
  const income = plainTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expense = plainTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total balance"
          value={formatIDR(totalBalance)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          title="Income (30d)"
          value={formatIDR(income)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="positive"
        />
        <StatCard
          title="Expense (30d)"
          value={formatIDR(expense)}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Income vs Expense</CardTitle>
              <CardDescription>This month</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <OverviewChart transactions={plainTransactions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Insights</CardTitle>
              <CardDescription>Cute nudges to improve</CardDescription>
            </div>
            <PiggyBank className="h-5 w-5 text-cute-purple" />
          </CardHeader>
          <CardContent className="space-y-3">
            <InsightBadge label={insights.expenseChangeLabel} tone="warning" />
            <InsightBadge label={insights.topCategoryLabel} />
            <InsightBadge label={insights.healthLabel} tone="positive" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Last 10 movements</CardDescription>
            </div>
            <Link href="/transactions">
              <Button size="sm">Add transaction</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={plainTransactions.slice(0, 10)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Balances by pocket</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {plainAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{acc.name}</p>
                  <p className="text-xs text-slate-500">{acc.type}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatIDR(acc.balance)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "positive" | "warning";
}) {
  const ring =
    tone === "positive"
      ? "ring-cute-mint"
      : tone === "warning"
      ? "ring-cute-pink"
      : "ring-cute-purple";
  return (
    <Card className={`border-none ring-2 ring-inset ${ring}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

async function getInsights(userId: string) {
  const now = new Date();
  const currentRange = { gte: startOfMonth(now), lte: endOfMonth(now) };
  const prevRange = {
    gte: startOfMonth(subMonths(now, 1)),
    lte: endOfMonth(subMonths(now, 1)),
  };

  const [curr, prev, top] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: currentRange },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: prevRange },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: currentRange },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 1,
    }),
  ]);

  const expenseNow = Number(curr.find((c) => c.type === "EXPENSE")?._sum.amount ?? 0);
  const expensePrev = Number(prev.find((c) => c.type === "EXPENSE")?._sum.amount ?? 0);
  const change =
    expensePrev === 0 ? null : Math.round(((expenseNow - expensePrev) / expensePrev) * 100);

  const topCategoryId = top[0]?.categoryId;
  let topCategoryLabel = "No spending yet — nice!";
  if (topCategoryId) {
    const category = await prisma.category.findUnique({ where: { id: topCategoryId } });
    if (category) topCategoryLabel = `Biggest expense: ${category.name}`;
  }

  const healthScore =
    expenseNow === 0 ? 100 : Math.max(30, Math.min(95, Math.round((expenseNow / 2000) * 100)));

  return {
    expenseChangeLabel:
      change === null
        ? "Tracking your first month — keep going!"
        : `Spending changed ${change}% vs last month`,
    topCategoryLabel,
    healthLabel: `Financial health: ${healthScore}/100`,
  };
}
