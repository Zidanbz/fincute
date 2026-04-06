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
  const remainingAmount = Number(body.remainingAmount);
  if (remainingAmount < 0 || !Number.isFinite(remainingAmount)) {
    return NextResponse.json({ error: "Remaining must be >= 0" }, { status: 400 });
  }

  const debt = await prisma.debt.findFirst({
    where: { id, userId: user.id },
  });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (remainingAmount > Number(debt.totalAmount)) {
    return NextResponse.json({ error: "Remaining cannot exceed total" }, { status: 400 });
  }

  const updated = await prisma.debt.update({
    where: { id, userId: user.id },
    data: { remainingAmount },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.debt.delete({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}
