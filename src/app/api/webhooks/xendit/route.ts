import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendPaymentFailed } from "@/lib/mock-email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        });

        if (newStatus === "SUCCESS") {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { orderStatus: "PAID" },
          });
        }

        if (newStatus === "FAILED") {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { orderStatus: "CANCELLED" },
          });
        }
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
        const sub = await prisma.subscription.findFirst({
          where: { xenditPlanId: planId },
        });
        if (sub) {
          await prisma.payment.create({
            data: {
              orderId: sub.orderId,
              xenditPaymentId: body.data?.id || body.id,
              amount: sub.amount,
              status: "SUCCESS",
              paymentMethod: "RECURRING",
            },
          });
        }
        break;
      }

      case "recurring.cycle.failed":
      case "recurring.cycle.retrying": {
        const planId = body.data?.plan_id || body.plan_id;
        const sub = await prisma.subscription.findFirst({
          where: { xenditPlanId: planId },
          include: { customer: true },
        });
        if (sub) {
          await prisma.payment.create({
            data: {
              orderId: sub.orderId,
              xenditPaymentId: body.data?.id || body.id,
              amount: sub.amount,
              status: "FAILED",
              paymentMethod: "RECURRING",
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
