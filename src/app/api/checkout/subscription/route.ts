import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { createSubscriptionPlan } from "@/lib/xendit";
import { sendSubscriptionCreated } from "@/lib/mock-email";
import { SubscriptionCheckoutSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";

const XENDIT_CUSTOMER_ID_RE = /^(cust-)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function POST(request: Request) {
  let order: any = null;

  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = SubscriptionCheckoutSchema.safeParse(body);
    if (!validation.success) {
      console.error("Subscription checkout validation failed:", JSON.stringify(validation.error.errors, null, 2));
      return NextResponse.json(
        { error: validation.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { productId, frequency, customer, createAccount, password } = validation.data;

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

    const freq = frequency || "WEEKLY";
    const frequencyMap: Record<string, "dailyPrice" | "weeklyPrice" | "monthlyPrice" | "yearlyPrice"> = {
      DAILY: "dailyPrice",
      WEEKLY: "weeklyPrice",
      MONTHLY: "monthlyPrice",
      YEARLY: "yearlyPrice",
    };
    const priceField = frequencyMap[freq];
    const frequencyPrice = priceField ? (product.priceConfig as any)[priceField] : null;
    const amount = (frequencyPrice ?? product.priceConfig.basePrice) as number;

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
        orderType: "SUBSCRIPTION",
        frequency: freq,
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

    // Create subscription plan via Xendit
    const plan = await createSubscriptionPlan({
      orderId: order.id,
      amount,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      frequency: frequency || "WEEKLY",
      description: `${product.name} - ${frequency || "Weekly"} Subscription`,
      xenditCustomerId: dbCustomer.xenditCustomerId && XENDIT_CUSTOMER_ID_RE.test(dbCustomer.xenditCustomerId) ? dbCustomer.xenditCustomerId : undefined,
    });

    // Wrap all post-Xendit DB writes in a transaction
    await prisma.$transaction([
      // Update customer with Xendit customer ID
      ...(plan.xenditCustomerId
        ? [
            prisma.customer.update({
              where: { id: dbCustomer.id },
              data: { xenditCustomerId: plan.xenditCustomerId },
            }),
          ]
        : []),
      // Create subscription record
      prisma.subscription.create({
        data: {
          orderId: order.id,
          customerId: dbCustomer.id,
          xenditPlanId: plan.planId,
          xenditReferenceId: plan.referenceId,
          status: plan.status === "REQUIRES_ACTION" ? "REQUIRES_ACTION" : "DRAFT",
          frequency: frequency || "WEEKLY",
          amount,
          actionUrl: plan.actionUrl,
        },
      }),
      // Create initial payment record
      prisma.payment.create({
        data: {
          orderId: order.id,
          xenditPaymentId: plan.planId,
          externalId: plan.referenceId,
          amount,
          status: plan.status === "REQUIRES_ACTION" ? "REQUIRES_ACTION" : "PENDING",
          paymentMethod: "credit_card",
          paymentUrl: plan.actionUrl,
        },
      }),
      // Update order to NEW status
      prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: "NEW" },
      }),
    ]);

    // Send email notification (after all DB writes succeed)
    try {
      await sendSubscriptionCreated({
        email: customer.email,
        name: customer.name,
        subscriptionId: plan.planId,
        productName: product.name,
        amount,
        frequency: frequency || "WEEKLY",
      });
    } catch (emailError) {
      console.error("Failed to send subscription email:", emailError);
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

    // If status is REQUIRES_ACTION, redirect to authorization page
    if (plan.actionUrl) {
      return NextResponse.json({
        orderId: order.id,
        redirectUrl: plan.actionUrl,
        status: plan.status,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      status: plan.status,
    });
  } catch (error) {
    console.error("Subscription checkout error:", error);

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
      { error: "Subscription checkout failed" },
      { status: 500 }
    );
  }
}
