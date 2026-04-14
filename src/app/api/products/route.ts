import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { priceConfig: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, basePrice, comparePrice, tags } = body;

    if (!name || !description || !basePrice) {
      return NextResponse.json(
        { error: "name, description, and basePrice are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          tags: tags ? tags.trim() : "",
          image: "",
          active: true,
        },
      });
      const priceConfig = await tx.priceConfig.create({
        data: {
          productId: product.id,
          basePrice: parseInt(basePrice),
          comparePrice: comparePrice ? parseInt(comparePrice) : null,
          active: true,
        },
      });
      return { ...product, priceConfig };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const orderCount = await prisma.order.count({ where: { productId } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: product has ${orderCount} associated order(s). Deactivate it instead.` },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.priceConfig.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
