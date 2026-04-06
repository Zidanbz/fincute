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
import { TransactionList } from "@/app/components/transaction-list";
import { AddTransactionForm } from "@/app/components/add-transaction-form";
import { TransactionFilter } from "@/app/components/transaction-filter";

export const runtime = "nodejs";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [transactions, accounts, categories, savingsGoals, debts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      include: { account: true, category: true },
    }),
    prisma.walletAccount.findMany({ where: { userId: session.user.id } }),
    prisma.category.findMany({ where: { userId: session.user.id } }),
    prisma.savingsGoal.findMany({ where: { userId: session.user.id } }),
    prisma.debt.findMany({ where: { userId: session.user.id } }),
  ]);

  const plainTransactions = transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    account: { ...t.account, balance: Number(t.account.balance) },
  }));
  const plainAccounts = accounts.map((a) => ({ ...a, balance: Number(a.balance) }));
  const plainSavingsGoals = savingsGoals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
  }));
  const plainDebts = debts.map((d) => ({
    id: d.id,
    name: d.name,
    totalAmount: Number(d.totalAmount),
    remainingAmount: Number(d.remainingAmount),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All your incomes and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFilter />
          <TransactionList transactions={plainTransactions} />
        </CardContent>
      </Card>
      <Card>
          <CardHeader>
            <CardTitle>Quick add</CardTitle>
            <CardDescription>Capture a transaction fast</CardDescription>
          </CardHeader>
          <CardContent>
            <AddTransactionForm
              accounts={plainAccounts}
              categories={categories}
              savingsGoals={plainSavingsGoals}
              debts={plainDebts}
            />
          </CardContent>
        </Card>
      </div>
  );
}
