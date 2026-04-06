import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { name, type, color } = body;
  if (!name || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const category = await prisma.category.create({
    data: { name, type, color: color ?? "#A5B4FC", userId: user.id },
  });
  return NextResponse.json(category, { status: 201 });
}

