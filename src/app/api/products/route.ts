import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { priceConfig: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(products);
}
