/**
 * Xendit Service Layer
 * 
 * Handles all Xendit API interactions for:
 * 1. One-time payment invoices
 * 2. Recurring subscription plans
 * 3. Customer creation
 * 
 * Uses direct REST API calls with Basic Auth.
 * Supports mock mode via USE_MOCK_XENDIT=true environment variable.
 */

const XENDIT_BASE_URL = "https://api.xendit.co";
const USE_MOCK = process.env.USE_MOCK_XENDIT === "true";

function getAuthHeader(): string {
  const apiKey = process.env.XENDIT_API_KEY || "";
  return Buffer.from(`${apiKey}:`).toString("base64");
}

async function makeXenditRequest(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (USE_MOCK) {
    return getMockResponse(endpoint, method, body);
  }

  const response = await fetch(`${XENDIT_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getAuthHeader()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Xendit API error (${response.status}): ${error}`);
  }

  return response.json();
}

// ─── Mock Responses ────────────────────────────────────────────────────────────

function getMockResponse(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>
): Record<string, unknown> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (endpoint === "/v2/invoices" && method === "POST") {
    return {
      id: `inv_mock_${Date.now()}`,
      external_id: body?.external_id,
      status: "PENDING",
      amount: body?.amount,
      invoice_url: `${baseUrl}/payment/redirect?mock=true&type=one-time&orderId=${body?.external_id}`,
      expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  if (endpoint === "/customers" && method === "POST") {
    return {
      id: `cust_mock_${Date.now()}`,
      reference_id: body?.reference_id,
      email: body?.email,
      type: "INDIVIDUAL",
    };
  }

  if (endpoint === "/recurring/plans" && method === "POST") {
    return {
      id: `plan_mock_${Date.now()}`,
      reference_id: body?.reference_id,
      customer_id: body?.customer_id,
      status: "REQUIRES_ACTION",
      amount: body?.amount,
      currency: "IDR",
      actions: [
        {
          action: "AUTH",
          url: `${baseUrl}/payment/redirect?mock=true&type=subscription&planId=plan_mock_${Date.now()}`,
          url_type: "WEB",
        },
      ],
    };
  }

  if (endpoint.startsWith("/v2/invoices/") && method === "GET") {
    return {
      id: endpoint.split("/").pop(),
      status: "PAID",
      amount: 149000,
    };
  }

  if (endpoint.startsWith("/recurring/plans/") && method === "GET") {
    return {
      id: endpoint.split("/").pop(),
      status: "ACTIVE",
      amount: 149000,
    };
  }

  return { status: "UNKNOWN" };
}

// ─── One-Time Payment ──────────────────────────────────────────────────────────

export interface CreateInvoiceParams {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  description: string;
}

export async function createPaymentInvoice(params: CreateInvoiceParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const invoice = await makeXenditRequest("/v2/invoices", "POST", {
    external_id: `order-${params.orderId}`,
    amount: params.amount,
    payer_email: params.customerEmail,
    description: params.description,
    customer: {
      given_names: params.customerName,
      email: params.customerEmail,
      mobile_number: params.customerPhone,
    },
    customer_notification_preference: {
      invoice_created: ["email"],
      invoice_reminder: ["email"],
      invoice_paid: ["email"],
    },
    success_redirect_url: `${baseUrl}/payment/success`,
    failure_redirect_url: `${baseUrl}/payment/failed`,
  });

  return {
    paymentId: invoice.id as string,
    paymentUrl: invoice.invoice_url as string,
    externalId: `order-${params.orderId}`,
    status: invoice.status as string,
  };
}

// ─── Subscription Flow ─────────────────────────────────────────────────────────

export interface CreateSubscriptionParams {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  frequency: string; // DAILY, WEEKLY, MONTHLY, YEARLY
  description: string;
  xenditCustomerId?: string;
}

function getIntervalFromFrequency(frequency: string): { interval: string; intervalCount: number } {
  switch (frequency) {
    case "DAILY":
      return { interval: "DAY", intervalCount: 1 };
    case "WEEKLY":
      return { interval: "WEEK", intervalCount: 1 };
    case "MONTHLY":
      return { interval: "MONTH", intervalCount: 1 };
    case "YEARLY":
      return { interval: "MONTH", intervalCount: 12 };
    default:
      return { interval: "MONTH", intervalCount: 1 };
  }
}

function getSafeAnchorDate(): string {
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (nextWeek.getDate() >= 29) {
    const nextMonth = new Date(nextWeek);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(7);
    return nextMonth.toISOString();
  }
  return nextWeek.toISOString();
}

export async function createXenditCustomer(params: {
  orderId: string;
  email: string;
  phone: string;
  name: string;
}) {
  const customer = await makeXenditRequest("/customers", "POST", {
    reference_id: `customer-${params.orderId}-${Date.now()}`,
    email: params.email,
    mobile_number: params.phone,
    type: "INDIVIDUAL",
    individual_detail: { given_names: params.name },
  });

  return {
    customerId: customer.id as string,
    referenceId: customer.reference_id as string,
  };
}

export async function createSubscriptionPlan(params: CreateSubscriptionParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { interval, intervalCount } = getIntervalFromFrequency(params.frequency);

  // Create Xendit customer first if needed
  let xenditCustomerId = params.xenditCustomerId;
  if (!xenditCustomerId) {
    const customer = await createXenditCustomer({
      orderId: params.orderId,
      email: params.customerEmail,
      phone: params.customerPhone,
      name: params.customerName,
    });
    xenditCustomerId = customer.customerId;
  }

  const subscription = await makeXenditRequest("/recurring/plans", "POST", {
    reference_id: `subscription-${params.orderId}`,
    customer_id: xenditCustomerId,
    recurring_action: "PAYMENT",
    currency: "IDR",
    amount: params.amount,
    payment_methods: [],
    schedule: {
      reference_id: `schedule-${params.orderId}`,
      interval,
      interval_count: intervalCount,
      anchor_date: getSafeAnchorDate(),
      retry_interval: "DAY",
      retry_interval_count: 3,
      total_retry: 2,
      failed_attempt_notifications: [1, 2],
    },
    immediate_action_type: "FULL_AMOUNT",
    failed_cycle_action: "STOP",
    payment_link_for_failed_attempt: true,
    description: params.description,
    success_return_url: `${baseUrl}/payment/success`,
    failure_return_url: `${baseUrl}/payment/failed`,
    metadata: {
      order_id: params.orderId,
      customer_name: params.customerName,
    },
  });

  // Extract the AUTH action URL for redirect
  const actions = subscription.actions as Array<{ action: string; url: string }> | undefined;
  const authAction = actions?.find((a) => a.action === "AUTH");

  return {
    planId: subscription.id as string,
    referenceId: `subscription-${params.orderId}`,
    status: subscription.status as string,
    actionUrl: authAction?.url || null,
    xenditCustomerId,
  };
}

// ─── Status Check ──────────────────────────────────────────────────────────────

export async function checkInvoiceStatus(invoiceId: string) {
  return makeXenditRequest(`/v2/invoices/${invoiceId}`, "GET");
}

export async function checkSubscriptionStatus(planId: string) {
  return makeXenditRequest(`/recurring/plans/${planId}`, "GET");
}
