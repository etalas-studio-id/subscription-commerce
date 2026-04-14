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
  const { id, basePrice, comparePrice, oneTimePrice, dailyPrice, weeklyPrice, monthlyPrice, yearlyPrice, active, stock, lowStockThreshold } = body;

  const updated = await prisma.priceConfig.update({
    where: { id },
    data: {
      basePrice: parseInt(basePrice),
      comparePrice: comparePrice ? parseInt(comparePrice) : null,
      oneTimePrice: oneTimePrice ? parseInt(oneTimePrice) : null,
      dailyPrice: dailyPrice ? parseInt(dailyPrice) : null,
      weeklyPrice: weeklyPrice ? parseInt(weeklyPrice) : null,
      monthlyPrice: monthlyPrice ? parseInt(monthlyPrice) : null,
      yearlyPrice: yearlyPrice ? parseInt(yearlyPrice) : null,
      active,
      product: {
        update: {
          active,
          stock: stock !== undefined ? (stock === null ? null : parseInt(stock)) : undefined,
          lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined,
        }
      }
    },
    include: { product: true },
  });
  return NextResponse.json(updated);
}
