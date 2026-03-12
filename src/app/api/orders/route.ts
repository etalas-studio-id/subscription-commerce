import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      product: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      subscription: true,
    },
  });
  return NextResponse.json(orders);
}
