import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { client, amount, status, dueDate, accountId, categoryId } = body;
  if (!client || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      client,
      amount,
      status: status ?? "UNPAID",
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user.id,
    },
  });

  // if paid create income transaction
  if (invoice.status === "PAID" && accountId && categoryId) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId,
        categoryId,
        type: "INCOME",
        amount,
        date: new Date(),
        invoiceId: invoice.id,
        note: `Invoice ${invoice.client}`,
      },
    });
    await prisma.walletAccount.update({
      where: { id: accountId },
      data: { balance: { increment: amount } },
    });
  }

  return NextResponse.json(invoice, { status: 201 });
}
