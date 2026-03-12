---
name: checkout-xendit
description: Instructions for checkout and Xendit integration in Subscription Commerce
---

# Checkout and Xendit Integration

This document serves as the AI skill configuration for handling the Checkout Flow and Xendit Payment Integration in the `Subscription Commerce` project.

## 1. Project Overview
- **Core Technology**: Next.js 15 (App Router), Prisma, TailwindCSS, TypeScript.
- **Database**: SQLite (managed by Prisma).
- **Payment Gateway**: Xendit.

## 2. Core Files & Directories
- **Checkout Frontend**: `src/app/checkout/page.tsx`
  - The main container for the checkout layout.
  - Subcomponents located in `src/components/checkout/`: `CustomerForm.tsx`, `DeliveryAddress.tsx`, and `OrderSummary.tsx`.
  - IMPORTANT: After successfully calling the backend checkout API, always use `window.location.href` to redirect the user to external payment pages (Xendit). 
    - For one-time orders, redirect to `data.paymentUrl`.
    - For subscriptions, redirect to `data.redirectUrl`.
  - DO NOT use `router.push()` for external domains.

- **Checkout API Routes**:
  - `src/app/api/checkout/one-time/route.ts`: Processes single purchases and creates a Xendit Invoice.
  - `src/app/api/checkout/subscription/route.ts`: Processes recurring orders, creates a Xendit Customer, and a Xendit Recurring Plan.

- **Xendit Library**: `src/lib/xendit.ts`
  - All direct communication with Xendit's REST API. Uses basic auth (`XENDIT_API_KEY`).
  - Supports a mock mode controlled by `USE_MOCK_XENDIT` in `.env`.

- **Webhooks**: `src/app/api/webhooks/xendit/route.ts`
  - Listens for `invoice` events (`PAID`, `EXPIRED`, `SETTLED`).
  - Listens for `recurring` plan events (`activated`, `cycle.succeeded`, `cycle.failed`).

## 3. Database Schema Interactions
- **Order Model**: Tracks the overall purchase (`orderType`: `ONE_TIME` or `SUBSCRIPTION`).
- **Payment Model**: Tracks individual transaction attempts related to an order. Includes `xenditPaymentId` and `paymentUrl`.
- **Subscription Model**: Tracks recurring active plans (`xenditPlanId`).

## 4. Xendit Integration Details
### Environment Variables
```env
USE_MOCK_XENDIT="false"
XENDIT_API_KEY="xnd_development_..."
```

### Creating Customers
Before creating a recurring subscription, a Xendit Customer must be created via `/customers` endpoint.

### One-Time Invoices
Endpoint: `POST /v2/invoices`
Backend maps this and returns a `paymentUrl` that the frontend redirects to.

### Subscription Plans
Endpoint: `POST /recurring/plans`
Xendit returns an `actionUrl` (look for `AUTH` action) where the customer links their payment method. The backend maps this and returns it to the frontend as `redirectUrl`.

## 5. Testing Payments
- When testing checkout, ensure the `.env` has `USE_MOCK_XENDIT="false"` and contains a valid development `XENDIT_API_KEY`.
- Run `npm run dev` and navigate to `http://localhost:3000`.
- Walk through the cart -> checkout flow. The application will redirect to the Xendit test environment.
- In Xendit's test environment, you can simulate successful card/bank transfers.
