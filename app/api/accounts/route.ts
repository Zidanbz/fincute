import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await prisma.walletAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { name, type, balance } = body;
  if (!name || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const account = await prisma.walletAccount.create({
    data: { name, type, balance: balance ?? 0, userId: user.id },
  });
  return NextResponse.json(account, { status: 201 });
}
