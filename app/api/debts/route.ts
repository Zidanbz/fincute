import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const debts = await prisma.debt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(debts);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { name, totalAmount, dueDate } = body;
  if (!name || !totalAmount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const debt = await prisma.debt.create({
    data: {
      name,
      totalAmount,
      remainingAmount: totalAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user.id,
    },
  });
  return NextResponse.json(debt, { status: 201 });
}

