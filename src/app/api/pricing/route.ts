import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const configs = await prisma.priceConfig.findMany({
    include: { product: true },
    orderBy: { basePrice: "asc" },
  });
  return NextResponse.json(configs);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, basePrice, comparePrice, active } = body;

  const updated = await prisma.priceConfig.update({
    where: { id },
    data: {
      basePrice: parseInt(basePrice),
      comparePrice: comparePrice ? parseInt(comparePrice) : null,
      active,
    },
  });
  return NextResponse.json(updated);
}
