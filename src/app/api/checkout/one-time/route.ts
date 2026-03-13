import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { createPaymentInvoice } from "@/lib/xendit";
import { sendOrderConfirmation } from "@/lib/mock-email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, customer } = body;

    // Get product and price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { priceConfig: true },
    });

    if (!product || !product.priceConfig) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const amount = product.priceConfig.basePrice;

    // Create or find customer
    let dbCustomer = await prisma.customer.findFirst({
      where: { email: customer.email },
    });

    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        customerId: dbCustomer.id,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        deliveryNotes: customer.deliveryNotes || "",
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: dbCustomer.id,
        productId: product.id,
        addressId: address.id,
        orderType: "ONE_TIME",
        amount,
        orderStatus: "NEW",
      },
    });

    // Create payment invoice via Xendit
    const invoice = await createPaymentInvoice({
      orderId: order.id,
      amount,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      description: `Panen Baik - ${product.name}`,
    });

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        xenditPaymentId: invoice.paymentId,
        externalId: invoice.externalId,
        amount,
        status: "PENDING",
        paymentMethod: "bank_transfer",
        paymentUrl: invoice.paymentUrl,
      },
    });

    // Send confirmation email
    await sendOrderConfirmation({
      email: customer.email,
      name: customer.name,
      orderId: order.id,
      productName: product.name,
      amount,
      orderType: "ONE_TIME",
    });

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: invoice.paymentUrl,
    });
  } catch (error) {
    console.error("One-time checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
