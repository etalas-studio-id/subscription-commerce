import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalOrders,
    activeSubscriptions,
    successPayments,
    failedPayments,
    recentOrders,
    recentSubscriptions,
  ] = await Promise.all([
    prisma.order.count({ where: { orderType: "ONE_TIME" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.order.findMany({
      take: 5,
      where: { orderType: "ONE_TIME" },
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        product: true,
      },
    }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        order: { include: { product: true } },
      },
    }),
  ]);

  return NextResponse.json({
    kpis: {
      totalOrders,
      activeSubscriptions,
      totalRevenue: successPayments._sum.amount || 0,
      failedPayments,
    },
    recentOrders,
    recentSubscriptions,
  });
}
