/**
 * Mock Email Service
 * 
 * Logs email payloads to the EmailLog table and console.
 * In production, replace with actual email provider (e.g., SendGrid).
 */

import { prisma } from "./db";

export interface EmailPayload {
  recipient: string;
  subject: string;
  type: "ORDER_CONFIRMATION" | "SUBSCRIPTION_CREATED" | "PAYMENT_FAILED" | "PAYMENT_REMINDER";
  body: Record<string, unknown>;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  // Log to console
  console.log("\n📧 ─── MOCK EMAIL ───────────────────────────────");
  console.log(`  To:      ${payload.recipient}`);
  console.log(`  Subject: ${payload.subject}`);
  console.log(`  Type:    ${payload.type}`);
  console.log(`  Body:    ${JSON.stringify(payload.body, null, 2)}`);
  console.log("──────────────────────────────────────────────────\n");

  // Save to EmailLog table
  await prisma.emailLog.create({
    data: {
      recipient: payload.recipient,
      subject: payload.subject,
      type: payload.type,
      payload: JSON.stringify(payload.body),
    },
  });
}

export async function sendOrderConfirmation(params: {
  email: string;
  name: string;
  orderId: string;
  productName: string;
  amount: number;
  orderType: string;
}) {
  await sendEmail({
    recipient: params.email,
    subject: `The Good Harvest — Order Confirmation #${params.orderId.slice(-6).toUpperCase()}`,
    type: "ORDER_CONFIRMATION",
    body: {
      customerName: params.name,
      orderId: params.orderId,
      product: params.productName,
      amount: params.amount,
      orderType: params.orderType,
      message: `Thank you for your order, ${params.name}! Your ${params.productName} is being prepared.`,
    },
  });
}

export async function sendSubscriptionCreated(params: {
  email: string;
  name: string;
  subscriptionId: string;
  productName: string;
  amount: number;
  frequency: string;
}) {
  await sendEmail({
    recipient: params.email,
    subject: `The Good Harvest — Subscription Activated`,
    type: "SUBSCRIPTION_CREATED",
    body: {
      customerName: params.name,
      subscriptionId: params.subscriptionId,
      product: params.productName,
      amount: params.amount,
      frequency: params.frequency,
      message: `Welcome to The Good Harvest ${params.frequency.toLowerCase()} subscription! Your ${params.productName} will be delivered on a ${params.frequency.toLowerCase()} basis.`,
    },
  });
}

export async function sendPaymentFailed(params: {
  email: string;
  name: string;
  orderId: string;
  amount: number;
}) {
  await sendEmail({
    recipient: params.email,
    subject: `The Good Harvest — Payment Update Required`,
    type: "PAYMENT_FAILED",
    body: {
      customerName: params.name,
      orderId: params.orderId,
      amount: params.amount,
      message: `Hi ${params.name}, we were unable to process your payment of Rp ${params.amount.toLocaleString()}. Please update your payment method to continue your subscription.`,
    },
  });
}
