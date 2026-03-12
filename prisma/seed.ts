import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Products ──────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: "prod_veggie_small",
        name: "Veggie Box Small",
        description: "5 packs of seasonal vegetables, perfect for 1-2 people. Curated from local organic farms.",
        image: "/images/veggie-small.jpg",
        tags: "vegetables,small,organic,1-2 people",
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_veggie_medium",
        name: "Veggie Box Medium",
        description: "10 packs of seasonal vegetables with premium greens. Ideal for a family of 3-4.",
        image: "/images/veggie-medium.jpg",
        tags: "vegetables,medium,organic,3-4 people,popular",
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        id: "prod_veggie_family",
        name: "Veggie Box Family",
        description: "20 packs of premium seasonal vegetables, fruits mix & specialty greens. Feeds a family of 5+.",
        image: "/images/veggie-family.jpg",
        tags: "vegetables,family,organic,5+ people,best value",
        active: true,
      },
    }),
  ]);

  // ─── Price Configs ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.priceConfig.create({
      data: {
        productId: "prod_veggie_small",
        basePrice: 99000,
        comparePrice: 129000,
        active: true,
      },
    }),
    prisma.priceConfig.create({
      data: {
        productId: "prod_veggie_medium",
        basePrice: 179000,
        comparePrice: 229000,
        active: true,
      },
    }),
    prisma.priceConfig.create({
      data: {
        productId: "prod_veggie_family",
        basePrice: 299000,
        comparePrice: 379000,
        active: true,
      },
    }),
  ]);

  // ─── Frequency Settings ────────────────────────────────────────────────────
  await Promise.all([
    prisma.frequencySetting.create({
      data: {
        frequency: "DAILY",
        label: "Daily",
        description: "Fresh delivery every day",
        interval: "DAY",
        intervalCount: 1,
        enabled: false,
      },
    }),
    prisma.frequencySetting.create({
      data: {
        frequency: "WEEKLY",
        label: "Weekly",
        description: "Fresh delivery every week — most popular",
        interval: "WEEK",
        intervalCount: 1,
        enabled: true,
      },
    }),
    prisma.frequencySetting.create({
      data: {
        frequency: "MONTHLY",
        label: "Monthly",
        description: "Fresh delivery once a month",
        interval: "MONTH",
        intervalCount: 1,
        enabled: true,
      },
    }),
    prisma.frequencySetting.create({
      data: {
        frequency: "YEARLY",
        label: "Yearly",
        description: "Annual subscription — best savings",
        interval: "MONTH",
        intervalCount: 12,
        enabled: false,
      },
    }),
  ]);

  // ─── Customers ─────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        id: "cust_1",
        name: "Sarah Wijaya",
        email: "sarah@example.com",
        phone: "+6281234567890",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_2",
        name: "Budi Santoso",
        email: "budi@example.com",
        phone: "+6281234567891",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_3",
        name: "Rina Putri",
        email: "rina@example.com",
        phone: "+6281234567892",
      },
    }),
    prisma.customer.create({
      data: {
        id: "cust_4",
        name: "Andi Prasetyo",
        email: "andi@example.com",
        phone: "+6281234567893",
      },
    }),
  ]);

  // ─── Addresses ─────────────────────────────────────────────────────────────
  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        id: "addr_1",
        customerId: "cust_1",
        address: "Jl. Sudirman No. 123",
        city: "Jakarta Selatan",
        postalCode: "12190",
        deliveryNotes: "Leave at front gate",
      },
    }),
    prisma.address.create({
      data: {
        id: "addr_2",
        customerId: "cust_2",
        address: "Jl. Gatot Subroto No. 456",
        city: "Jakarta Pusat",
        postalCode: "10270",
        deliveryNotes: "",
      },
    }),
    prisma.address.create({
      data: {
        id: "addr_3",
        customerId: "cust_3",
        address: "Jl. Kemang Raya No. 78",
        city: "Jakarta Selatan",
        postalCode: "12730",
        deliveryNotes: "Ring doorbell twice",
      },
    }),
    prisma.address.create({
      data: {
        id: "addr_4",
        customerId: "cust_4",
        address: "Jl. Melawai No. 22",
        city: "Jakarta Selatan",
        postalCode: "12160",
        deliveryNotes: "Call before delivery",
      },
    }),
  ]);

  // ─── Orders ────────────────────────────────────────────────────────────────
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        id: "order_1",
        customerId: "cust_1",
        productId: "prod_veggie_small",
        addressId: "addr_1",
        orderType: "ONE_TIME",
        amount: 99000,
        orderStatus: "COMPLETED",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_2",
        customerId: "cust_1",
        productId: "prod_veggie_medium",
        addressId: "addr_1",
        orderType: "SUBSCRIPTION",
        frequency: "WEEKLY",
        amount: 179000,
        orderStatus: "PAID",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_3",
        customerId: "cust_2",
        productId: "prod_veggie_family",
        addressId: "addr_2",
        orderType: "ONE_TIME",
        amount: 299000,
        orderStatus: "PAID",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_4",
        customerId: "cust_2",
        productId: "prod_veggie_small",
        addressId: "addr_2",
        orderType: "SUBSCRIPTION",
        frequency: "MONTHLY",
        amount: 99000,
        orderStatus: "PAID",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_5",
        customerId: "cust_3",
        productId: "prod_veggie_medium",
        addressId: "addr_3",
        orderType: "ONE_TIME",
        amount: 179000,
        orderStatus: "NEW",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_6",
        customerId: "cust_3",
        productId: "prod_veggie_family",
        addressId: "addr_3",
        orderType: "SUBSCRIPTION",
        frequency: "WEEKLY",
        amount: 299000,
        orderStatus: "CANCELLED",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_7",
        customerId: "cust_4",
        productId: "prod_veggie_medium",
        addressId: "addr_4",
        orderType: "ONE_TIME",
        amount: 179000,
        orderStatus: "PROCESSING",
      },
    }),
    prisma.order.create({
      data: {
        id: "order_8",
        customerId: "cust_4",
        productId: "prod_veggie_small",
        addressId: "addr_4",
        orderType: "SUBSCRIPTION",
        frequency: "WEEKLY",
        amount: 99000,
        orderStatus: "PAID",
      },
    }),
  ]);

  // ─── Subscriptions ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.subscription.create({
      data: {
        id: "sub_1",
        orderId: "order_2",
        customerId: "cust_1",
        status: "ACTIVE",
        frequency: "WEEKLY",
        amount: 179000,
        xenditPlanId: "plan_mock_001",
        xenditReferenceId: "subscription-order_2",
        nextChargeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.subscription.create({
      data: {
        id: "sub_2",
        orderId: "order_4",
        customerId: "cust_2",
        status: "ACTIVE",
        frequency: "MONTHLY",
        amount: 99000,
        xenditPlanId: "plan_mock_002",
        xenditReferenceId: "subscription-order_4",
        nextChargeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.subscription.create({
      data: {
        id: "sub_3",
        orderId: "order_6",
        customerId: "cust_3",
        status: "CANCELLED",
        frequency: "WEEKLY",
        amount: 299000,
        xenditPlanId: "plan_mock_003",
        xenditReferenceId: "subscription-order_6",
      },
    }),
    prisma.subscription.create({
      data: {
        id: "sub_4",
        orderId: "order_8",
        customerId: "cust_4",
        status: "ACTIVE",
        frequency: "WEEKLY",
        amount: 99000,
        xenditPlanId: "plan_mock_004",
        xenditReferenceId: "subscription-order_8",
        nextChargeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.subscription.create({
      data: {
        id: "sub_5",
        orderId: "order_5",
        customerId: "cust_3",
        status: "FAILED",
        frequency: "WEEKLY",
        amount: 179000,
        xenditPlanId: "plan_mock_005",
        xenditReferenceId: "subscription-order_5",
      },
    }),
  ]);

  // ─── Payments ──────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.payment.create({
      data: {
        orderId: "order_1",
        xenditPaymentId: "inv_mock_001",
        externalId: "order-order_1",
        amount: 99000,
        status: "SUCCESS",
        paymentMethod: "BANK_TRANSFER",
      },
    }),
    prisma.payment.create({
      data: {
        orderId: "order_2",
        xenditPaymentId: "inv_mock_002",
        externalId: "order-order_2",
        amount: 179000,
        status: "SUCCESS",
        paymentMethod: "CREDIT_CARD",
      },
    }),
    prisma.payment.create({
      data: {
        orderId: "order_3",
        xenditPaymentId: "inv_mock_003",
        externalId: "order-order_3",
        amount: 299000,
        status: "SUCCESS",
        paymentMethod: "E_WALLET",
      },
    }),
    prisma.payment.create({
      data: {
        orderId: "order_4",
        xenditPaymentId: "inv_mock_004",
        externalId: "order-order_4",
        amount: 99000,
        status: "SUCCESS",
        paymentMethod: "CREDIT_CARD",
      },
    }),
    prisma.payment.create({
      data: {
        orderId: "order_5",
        xenditPaymentId: "inv_mock_005",
        externalId: "order-order_5",
        amount: 179000,
        status: "FAILED",
        paymentMethod: "CREDIT_CARD",
      },
    }),
    prisma.payment.create({
      data: {
        orderId: "order_7",
        xenditPaymentId: "inv_mock_007",
        externalId: "order-order_7",
        amount: 179000,
        status: "PENDING",
        paymentMethod: "VIRTUAL_ACCOUNT",
      },
    }),
  ]);

  // ─── Email Logs ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.emailLog.create({
      data: {
        recipient: "sarah@example.com",
        subject: "The Good Harvest — Order Confirmation #ORDER1",
        type: "ORDER_CONFIRMATION",
        payload: JSON.stringify({ orderId: "order_1", product: "Veggie Box Small", amount: 99000 }),
      },
    }),
    prisma.emailLog.create({
      data: {
        recipient: "sarah@example.com",
        subject: "The Good Harvest — Subscription Activated",
        type: "SUBSCRIPTION_CREATED",
        payload: JSON.stringify({ subscriptionId: "sub_1", product: "Veggie Box Medium", frequency: "WEEKLY" }),
      },
    }),
    prisma.emailLog.create({
      data: {
        recipient: "budi@example.com",
        subject: "The Good Harvest — Order Confirmation #ORDER3",
        type: "ORDER_CONFIRMATION",
        payload: JSON.stringify({ orderId: "order_3", product: "Veggie Box Family", amount: 299000 }),
      },
    }),
    prisma.emailLog.create({
      data: {
        recipient: "rina@example.com",
        subject: "The Good Harvest — Payment Update Required",
        type: "PAYMENT_FAILED",
        payload: JSON.stringify({ orderId: "order_5", amount: 179000, message: "Payment method declined" }),
      },
    }),
    prisma.emailLog.create({
      data: {
        recipient: "rina@example.com",
        subject: "The Good Harvest — Payment Reminder",
        type: "PAYMENT_REMINDER",
        payload: JSON.stringify({ orderId: "order_5", amount: 179000, retryCount: 1 }),
      },
    }),
    prisma.emailLog.create({
      data: {
        recipient: "andi@example.com",
        subject: "The Good Harvest — Subscription Activated",
        type: "SUBSCRIPTION_CREATED",
        payload: JSON.stringify({ subscriptionId: "sub_4", product: "Veggie Box Small", frequency: "WEEKLY" }),
      },
    }),
  ]);

  console.log("✅ Seed complete!");
  console.log(`   ${products.length} products`);
  console.log(`   4 frequency settings`);
  console.log(`   ${customers.length} customers`);
  console.log(`   ${addresses.length} addresses`);
  console.log(`   ${orders.length} orders`);
  console.log(`   5 subscriptions`);
  console.log(`   6 payments`);
  console.log(`   6 email logs`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
