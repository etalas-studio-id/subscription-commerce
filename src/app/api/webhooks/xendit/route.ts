import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendPaymentFailed } from "@/lib/mock-email";
import { XenditWebhookSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // Verify webhook signature using x-callback-token header
    const callbackToken = request.headers.get("x-callback-token");
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (!expectedToken || callbackToken !== expectedToken) {
      console.warn("🚨 Webhook signature verification failed");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate webhook payload (lenient, just log warnings)
    const validation = XenditWebhookSchema.safeParse(body);
    if (!validation.success) {
      console.warn("⚠️  Webhook validation warning:", validation.error.errors);
    }

    const eventType = body.event || body.type;

    console.log("\n🔔 ─── XENDIT WEBHOOK ────────────────────────────");
    console.log(`  Event: ${eventType}`);
    console.log(`  Payload: ${JSON.stringify(body, null, 2)}`);
    console.log("──────────────────────────────────────────────────\n");

    // Handle invoice webhook (one-time payments)
    if (body.external_id && body.status) {
      const externalId = body.external_id as string;
      const status = body.status as string;

      // Find payment by external ID
      const payment = await prisma.payment.findFirst({
        where: { externalId },
        include: { order: true },
      });

      if (payment) {
        const newStatus =
          status === "PAID" || status === "SETTLED" ? "SUCCESS" :
          status === "EXPIRED" ? "FAILED" : "PENDING";

        // Use transaction for atomicity
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: newStatus },
          }),
          ...(newStatus === "SUCCESS"
            ? [prisma.order.update({
                where: { id: payment.orderId },
                data: { orderStatus: "PAID" },
              })]
            : []),
          ...(newStatus === "FAILED"
            ? [prisma.order.update({
                where: { id: payment.orderId },
                data: { orderStatus: "CANCELLED" },
              })]
            : []),
        ]);
      }
    }

    // Handle recurring plan events
    switch (eventType) {
      case "recurring.plan.activated": {
        const planId = body.data?.id || body.id;
        const sub = await prisma.subscription.findFirst({
          where: { xenditPlanId: planId },
        });
        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "ACTIVE" },
          });
          await prisma.order.update({
            where: { id: sub.orderId },
            data: { orderStatus: "PAID" },
          });
        }
        break;
      }

      case "recurring.cycle.succeeded": {
        const planId = body.data?.plan_id || body.plan_id;
        const externalId = body.data?.reference_id || body.reference_id || `${planId}-${body.data?.id || body.id}`;
        const sub = await prisma.subscription.findFirst({
          where: { xenditPlanId: planId },
        });
        if (sub) {
          // Use upsert for idempotency - if this webhook is retried, update the existing payment
          await prisma.payment.upsert({
            where: { externalId },
            create: {
              orderId: sub.orderId,
              xenditPaymentId: body.data?.id || body.id,
              externalId,
              amount: sub.amount,
              status: "SUCCESS",
              paymentMethod: "RECURRING",
            },
            update: {
              status: "SUCCESS",
            },
          });
        }
        break;
      }

      case "recurring.cycle.failed":
      case "recurring.cycle.retrying": {
        const planId = body.data?.plan_id || body.plan_id;
        const externalId = body.data?.reference_id || body.reference_id || `${planId}-${body.data?.id || body.id}`;
        const sub = await prisma.subscription.findFirst({
          where: { xenditPlanId: planId },
          include: { customer: true },
        });
        if (sub) {
          // Use upsert for idempotency
          await prisma.payment.upsert({
            where: { externalId },
            create: {
              orderId: sub.orderId,
              xenditPaymentId: body.data?.id || body.id,
              externalId,
              amount: sub.amount,
              status: eventType === "recurring.cycle.failed" ? "FAILED" : "PENDING",
              paymentMethod: "RECURRING",
            },
            update: {
              status: eventType === "recurring.cycle.failed" ? "FAILED" : "PENDING",
            },
          });

          if (eventType === "recurring.cycle.failed") {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: "FAILED" },
            });

            // Send failure notification
            if (sub.customer) {
              await sendPaymentFailed({
                email: sub.customer.email,
                name: sub.customer.name,
                orderId: sub.orderId,
                amount: sub.amount,
              });
            }
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
