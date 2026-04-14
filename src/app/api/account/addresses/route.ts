import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(addresses);
}

const AddAddressSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  deliveryNotes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = AddAddressSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const address = await prisma.address.create({
    data: {
      customerId: session.user.id,
      ...validation.data,
      deliveryNotes: validation.data.deliveryNotes || "",
    },
  });

  return NextResponse.json(address, { status: 201 });
}

const UpdateAddressSchema = z.object({
  id: z.string().min(1),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  deliveryNotes: z.string().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = UpdateAddressSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { id, ...fields } = validation.data;

  const existing = await prisma.address.findFirst({
    where: { id, customerId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: fields,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Address ID required" }, { status: 400 });
  }

  // Atomic ownership-check + delete in a single query
  const deleted = await prisma.address.deleteMany({
    where: { id, customerId: session.user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
