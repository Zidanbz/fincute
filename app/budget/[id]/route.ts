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
  const limit = Number(body.limit);
  if (!limit || limit <= 0) {
    return NextResponse.json({ error: "Limit must be > 0" }, { status: 400 });
  }
  const budget = await prisma.budget.update({
    where: { id, userId: user.id },
    data: { limit },
  });
  return NextResponse.json(budget);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.budget.delete({
    where: { id, userId: user.id },
  });
  return NextResponse.json({ ok: true });
}
