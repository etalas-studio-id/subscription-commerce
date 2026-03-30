import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { createPaymentInvoice } from "@/lib/xendit";
import { sendOrderConfirmation } from "@/lib/mock-email";
import { OneTimeCheckoutSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  let order: any = null;

  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = OneTimeCheckoutSchema.safeParse(body);
    if (!validation.success) {
      console.error("One-time checkout validation failed:", JSON.stringify(validation.error.errors, null, 2));
      return NextResponse.json(
        { error: validation.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { productId, customer, createAccount, password } = validation.data;

    // Get product and price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { priceConfig: true },
    });

    if (!product || !product.priceConfig) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock
    if (product.stock !== null && product.stock <= 0) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 });
    }

    const amount = product.priceConfig.oneTimePrice ?? product.priceConfig.basePrice;

    // Create or update customer (upsert on email)
    const dbCustomer = await prisma.customer.upsert({
      where: { email: customer.email },
      create: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      update: {
        name: customer.name,
        phone: customer.phone,
      },
    });

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

    // Create order with INITIATING status (order-first pattern)
    order = await prisma.order.create({
      data: {
        customerId: dbCustomer.id,
        productId: product.id,
        addressId: address.id,
        orderType: "ONE_TIME",
        amount,
        orderStatus: "INITIATING",
      },
    });

    // Decrement stock if not unlimited
    if (product.stock !== null) {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } },
      });
    }

    // Create payment invoice via Xendit
    const invoice = await createPaymentInvoice({
      orderId: order.id,
      amount,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      description: `Berkala - ${product.name}`,
    });

    // Wrap all post-Xendit DB writes in a transaction
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          orderId: order.id,
          xenditPaymentId: invoice.paymentId,
          externalId: invoice.externalId,
          amount,
          status: "PENDING",
          paymentMethod: "bank_transfer",
          paymentUrl: invoice.paymentUrl,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: "NEW" },
      }),
    ]);

    // Send confirmation email (after all DB writes succeed)
    try {
      await sendOrderConfirmation({
        email: customer.email,
        name: customer.name,
        orderId: order.id,
        productName: product.name,
        amount,
        orderType: "ONE_TIME",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the checkout if email fails
    }

    // Best-effort account creation
    if (createAccount && password) {
      try {
        const existing = await prisma.customer.findUnique({ where: { email: customer.email } });
        if (existing && !existing.passwordHash) {
          const passwordHash = await bcrypt.hash(password, 12);
          await prisma.customer.update({
            where: { email: customer.email },
            data: { passwordHash, emailVerified: new Date() },
          });
        }
      } catch (accountError) {
        console.error("Failed to create account during checkout:", accountError);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: invoice.paymentUrl,
    });
  } catch (error) {
    console.error("One-time checkout error:", error);

    // If order was created but Xendit or post-Xendit steps failed, mark it as cancelled
    if (order) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { orderStatus: "CANCELLED" },
        });
      } catch (cancelError) {
        console.error("Failed to cancel order:", cancelError);
      }
    }

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
