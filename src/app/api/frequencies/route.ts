import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.frequencySetting.findMany({
    orderBy: { intervalCount: "asc" },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;
  
  const updated = await prisma.frequencySetting.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
