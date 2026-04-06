import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { account: true, category: true },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { accountId, categoryId, type, amount, date, note, debtId, savingsGoalId } = body;
  if (!accountId || !categoryId || !type || !amount || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  if (category.type !== type) {
    return NextResponse.json(
      { error: "Category type must match transaction type" },
      { status: 400 }
    );
  }

  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId,
      categoryId,
      type,
      amount,
      date: new Date(date),
      note,
      debtId,
      savingsGoalId,
    },
  });

  // update account balance
  const delta = type === "INCOME" ? amount : -amount;
  await prisma.walletAccount.update({
    where: { id: accountId },
    data: { balance: { increment: delta } },
  });

  // integrate with debt (payment reduces remainingAmount)
  if (debtId && type === "EXPENSE") {
    await prisma.debt.update({
      where: { id: debtId, userId: user.id },
      data: { remainingAmount: { decrement: amount } },
    });
  }

  // integrate with savings goal (expense to savings increases currentAmount)
  if (savingsGoalId) {
    await prisma.savingsGoal.update({
      where: { id: savingsGoalId, userId: user.id },
      data: {
        currentAmount:
          type === "EXPENSE"
            ? { increment: amount }
            : { decrement: amount },
      },
    });
  }

  return NextResponse.json(tx, { status: 201 });
}
