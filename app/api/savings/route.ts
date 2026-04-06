import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { name, targetAmount, deadline } = body;
  if (!name || !targetAmount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const goal = await prisma.savingsGoal.create({
    data: {
      name,
      targetAmount,
      deadline: deadline ? new Date(deadline) : null,
      userId: user.id,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}

