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

  const [curr, prev, categories] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId: user.id, date: currentRange },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId: user.id, date: prevRange },
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

  const currExpense = Number(curr.find((c) => c.type === "EXPENSE")?._sum.amount ?? 0);
  const prevExpense = Number(prev.find((c) => c.type === "EXPENSE")?._sum.amount ?? 0);
  const expenseChange =
    prevExpense === 0 ? null : Math.round(((currExpense - prevExpense) / prevExpense) * 100);

  return NextResponse.json({
    expenseChangePercent: expenseChange,
    biggestExpenseCategoryId: categories[0]?.categoryId ?? null,
  });
}

