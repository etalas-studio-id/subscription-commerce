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

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: { subscription: true },
      },
    },
  });

  const result = customers.map(({ passwordHash, ...c }) => ({
    ...c,
    isRegistered: !!passwordHash,
  }));

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, email, phone } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
    });

    const { passwordHash: _, ...result } = updated;
    return NextResponse.json({ ...result, isRegistered: !!updated.passwordHash });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    throw err;
  }
}
