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
  const targetAmount = Number(body.targetAmount);
  if (!targetAmount || targetAmount <= 0) {
    return NextResponse.json({ error: "Target must be > 0" }, { status: 400 });
  }

  const goal = await prisma.savingsGoal.update({
    where: { id, userId: user.id },
    data: { targetAmount },
  });

  return NextResponse.json(goal);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.savingsGoal.delete({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}
