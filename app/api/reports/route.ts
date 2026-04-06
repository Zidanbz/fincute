import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const currentRange = { gte: startOfMonth(now), lte: endOfMonth(now) };
  const prevRange = {
    gte: startOfMonth(subMonths(now, 1)),
    lte: endOfMonth(subMonths(now, 1)),
  };

  const [accounts, currentIncome, currentExpense, prevIncome, prevExpense, topCategory] =
    await Promise.all([
      prisma.walletAccount.findMany({ where: { userId: user.id } }),
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "INCOME", date: currentRange },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "EXPENSE", date: currentRange },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "INCOME", date: prevRange },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "EXPENSE", date: prevRange },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId: user.id, type: "EXPENSE", date: currentRange },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 1,
      }),
    ]);

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance),
    0
  );
  const income = Number(currentIncome._sum.amount ?? 0);
  const expense = Number(currentExpense._sum.amount ?? 0);
  const prevInc = Number(prevIncome._sum.amount ?? 0);
  const prevExp = Number(prevExpense._sum.amount ?? 0);

  return NextResponse.json({
    totalBalance,
    income,
    expense,
    prevIncome: prevInc,
    prevExpense: prevExp,
    topExpenseCategoryId: topCategory[0]?.categoryId ?? null,
  });
}
