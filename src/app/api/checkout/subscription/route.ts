import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { createSubscriptionPlan } from "@/lib/xendit";
import { sendSubscriptionCreated } from "@/lib/mock-email";

const XENDIT_CUSTOMER_ID_RE = /^(cust-)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, frequency, customer } = body;

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
        orderType: "SUBSCRIPTION",
        frequency: frequency || "WEEKLY",
        amount,
        orderStatus: "NEW",
      },
    });

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

    // Update customer with Xendit customer ID
    if (plan.xenditCustomerId) {
      await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: { xenditCustomerId: plan.xenditCustomerId },
      });
    }

    // Create subscription record
    await prisma.subscription.create({
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
    });

    // Create initial payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        xenditPaymentId: plan.planId,
        externalId: plan.referenceId,
        amount,
        status: plan.status === "REQUIRES_ACTION" ? "REQUIRES_ACTION" : "PENDING",
        paymentMethod: "credit_card",
        paymentUrl: plan.actionUrl,
      },
    });

    // Send email notification
    await sendSubscriptionCreated({
      email: customer.email,
      name: customer.name,
      subscriptionId: plan.planId,
      productName: product.name,
      amount,
      frequency: frequency || "WEEKLY",
    });

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
    return NextResponse.json(
      { error: "Subscription checkout failed" },
      { status: 500 }
    );
  }
}
