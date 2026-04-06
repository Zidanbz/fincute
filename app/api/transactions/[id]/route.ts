import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return badRequest("Missing id");

  const body = await request.json();
  const amountProvided = body.amount !== undefined;
  const noteProvided = body.note !== undefined;
  const nextAmount = amountProvided ? Number(body.amount) : undefined;
  const nextNote = noteProvided ? String(body.note) : undefined;

  if (amountProvided && (!nextAmount || nextAmount <= 0)) {
    return badRequest("Amount must be > 0");
  }

  const tx = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { debt: true, savingsGoal: true },
  });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const prevAmount = Number(tx.amount);
  const finalAmount = amountProvided ? nextAmount! : prevAmount;

  if (!amountProvided && !noteProvided) {
    return NextResponse.json(tx);
  }

  const delta = finalAmount - prevAmount;
  const balanceDelta = tx.type === "INCOME" ? delta : -delta;

  const txData: Record<string, any> = {};
  if (amountProvided) txData.amount = finalAmount;
  if (noteProvided) txData.note = nextNote ?? null;

  // If only note changes
  if (!amountProvided || delta === 0) {
    const updated = await prisma.transaction.update({
      where: { id: tx.id },
      data: txData,
    });
    return NextResponse.json(updated);
  }

  const operations: any[] = [
    prisma.transaction.update({ where: { id: tx.id }, data: txData }),
    prisma.walletAccount.update({
      where: { id: tx.accountId },
      data: { balance: { increment: balanceDelta } },
    }),
  ];

  if (tx.debt && tx.type === "EXPENSE") {
    const newRemaining = Math.max(
      0,
      Number(tx.debt.remainingAmount) - delta
    );
    operations.push(
      prisma.debt.update({
        where: { id: tx.debt.id },
        data: { remainingAmount: newRemaining },
      })
    );
  }

  if (tx.savingsGoal) {
    const current = Number(tx.savingsGoal.currentAmount);
    const newCurrent = tx.type === "EXPENSE" ? current + delta : current - delta;
    operations.push(
      prisma.savingsGoal.update({
        where: { id: tx.savingsGoal.id },
        data: { currentAmount: Math.max(0, newCurrent) },
      })
    );
  }

  const [updatedTx] = await prisma.$transaction(operations);
  return NextResponse.json(updatedTx);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return badRequest("Missing id");

  const tx = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { debt: true, savingsGoal: true },
  });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const amount = Number(tx.amount);
  const balanceRollback = tx.type === "INCOME" ? -amount : amount;

  const operations: any[] = [
    prisma.transaction.delete({ where: { id: tx.id } }),
    prisma.walletAccount.update({
      where: { id: tx.accountId },
      data: { balance: { increment: balanceRollback } },
    }),
  ];

  if (tx.debt && tx.type === "EXPENSE") {
    const remaining = Number(tx.debt.remainingAmount) + amount;
    const capped = Math.min(remaining, Number(tx.debt.totalAmount));
    operations.push(
      prisma.debt.update({
        where: { id: tx.debt.id },
        data: { remainingAmount: capped },
      })
    );
  }

  if (tx.savingsGoal) {
    const current = Number(tx.savingsGoal.currentAmount);
    const newCurrent = tx.type === "EXPENSE" ? current - amount : current + amount;
    operations.push(
      prisma.savingsGoal.update({
        where: { id: tx.savingsGoal.id },
        data: { currentAmount: Math.max(0, newCurrent) },
      })
    );
  }

  await prisma.$transaction(operations);
  return NextResponse.json({ ok: true });
}
