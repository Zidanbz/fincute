import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    include: { category: true },
  });
  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { categoryId, month, year, limit } = body;
  if (!categoryId || !month || !year || !limit) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const budget = await prisma.budget.upsert({
    where: { categoryId_month_year: { categoryId, month, year } },
    update: { limit },
    create: { categoryId, month, year, limit, userId: user.id },
  });
  return NextResponse.json(budget, { status: 201 });
}

