import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: { orderBy: { createdAt: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          product: true,
          subscription: { select: { status: true, nextChargeDate: true } },
          payments: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { amount: true, status: true, paymentMethod: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      image: customer.image,
    },
    addresses: customer.addresses,
    orders: customer.orders.map((o) => ({
      id: o.id,
      productName: o.product.name,
      orderType: o.orderType,
      frequency: o.frequency,
      amount: o.amount,
      status: o.orderStatus,
      createdAt: o.createdAt,
      subscription: o.subscription ?? null,
      payments: o.payments,
    })),
  });
}

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = UpdateProfileSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.update({
    where: { id: session.user.id },
    data: validation.data,
  });

  return NextResponse.json({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  });
}
