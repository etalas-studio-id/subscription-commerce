import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("adminAuth")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { createdAt: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          product: true,
          subscription: { select: { status: true, nextChargeDate: true, frequency: true, amount: true } },
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { address, city, postalCode, deliveryNotes } = await req.json();

  if (!address || !city || !postalCode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const created = await prisma.address.create({
    data: {
      customerId: id,
      address,
      city,
      postalCode,
      deliveryNotes: deliveryNotes || "",
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { addressId, address, city, postalCode, deliveryNotes } = await req.json();

  if (!addressId) {
    return NextResponse.json({ error: "Missing addressId" }, { status: 400 });
  }

  const existing = await prisma.address.findFirst({ where: { id: addressId, customerId: id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: {
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(postalCode !== undefined && { postalCode }),
      ...(deliveryNotes !== undefined && { deliveryNotes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { addressId } = await req.json();

  if (!addressId) {
    return NextResponse.json({ error: "Missing addressId" }, { status: 400 });
  }

  const deleted = await prisma.address.deleteMany({ where: { id: addressId, customerId: id } });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
