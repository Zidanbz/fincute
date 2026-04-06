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
import { startOfMonth, endOfMonth } from "date-fns";
import { formatIDR } from "@/lib/utils";
import { ExportReportButton } from "@/app/components/export-report-button";

export const runtime = "nodejs";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const range = { gte: startOfMonth(now), lte: endOfMonth(now) };
  const [incomeAgg, expenseAgg, txCountRaw, accounts] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: session.user.id, type: "INCOME", date: range },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: session.user.id, type: "EXPENSE", date: range },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { userId: session.user.id, date: range } }),
    prisma.walletAccount.findMany({ where: { userId: session.user.id } }),
  ]);

  const incomeVal = Number(incomeAgg._sum.amount ?? 0);
  const expenseVal = Number(expenseAgg._sum.amount ?? 0);
  const profit = incomeVal - expenseVal;
  const txCount = txCountRaw;
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Month-to-date overview</CardDescription>
        </div>
        <ExportReportButton
          summary={{
            totalBalance,
            income: incomeVal,
            expense: expenseVal,
            profit,
            txCount,
            periodLabel: `${now.getFullYear()}-${now.getMonth() + 1}`,
          }}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <ReportRow label="Income" value={incomeVal} />
        <ReportRow label="Expense" value={expenseVal} />
        <ReportRow label="Profit / Loss" value={profit} highlight />
        <ReportRow label="Transactions" value={txCount} prefix="" />
      </CardContent>
    </Card>
  );
}

function ReportRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p
        className={`text-sm font-semibold ${
          highlight ? (value >= 0 ? "text-emerald-600" : "text-rose-600") : "text-slate-900"
        }`}
      >
        {formatIDR(value)}
      </p>
    </div>
  );
}
