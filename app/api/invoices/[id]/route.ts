import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();
  const nextStatus = String(body.status ?? "").toUpperCase();
  if (nextStatus !== "PAID" && nextStatus !== "UNPAID") {
    return NextResponse.json({ error: "Status must be PAID/UNPAID" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentStatus = invoice.status;
  if (currentStatus === nextStatus) {
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: currentStatus },
    });
    return NextResponse.json(updated);
  }

  const tx = await prisma.transaction.findUnique({ where: { invoiceId: invoice.id } });
  const ops: any[] = [];

  if (nextStatus === "PAID") {
    const { accountId, categoryId } = body;
    if (!accountId || !categoryId) {
      return NextResponse.json({ error: "accountId & categoryId required when marking PAID" }, { status: 400 });
    }
    ops.push(
      prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          accountId,
          categoryId,
          type: "INCOME",
          amount: Number(invoice.amount),
          date: new Date(),
          invoiceId: invoice.id,
          note: `Invoice ${invoice.client}`,
        },
      }),
      prisma.walletAccount.update({
        where: { id: accountId },
        data: { balance: { increment: Number(invoice.amount) } },
      })
    );
  }

  if (nextStatus === "UNPAID" && tx) {
    ops.push(
      prisma.invoice.update({ where: { id: invoice.id }, data: { status: "UNPAID" } }),
      prisma.transaction.delete({ where: { id: tx.id } }),
      prisma.walletAccount.update({
        where: { id: tx.accountId },
        data: { balance: { decrement: Number(tx.amount) } },
      })
    );
  }

  if (ops.length === 0) {
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: nextStatus },
    });
    return NextResponse.json(updated);
  }

  const [updatedInvoice] = await prisma.$transaction(ops);
  return NextResponse.json(updatedInvoice);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tx = await prisma.transaction.findUnique({ where: { invoiceId: invoice.id } });

  const ops: any[] = [prisma.invoice.delete({ where: { id: invoice.id } })];

  if (tx) {
    ops.push(
      prisma.transaction.delete({ where: { id: tx.id } }),
      prisma.walletAccount.update({
        where: { id: tx.accountId },
        data: { balance: { decrement: Number(tx.amount) } },
      })
    );
  }

  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
