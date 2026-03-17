# TODOS — Panen Baik

Items from the CEO plan review (2026-03-16). Ordered by priority.

---

## P0 — Must fix before first real transaction

### 1. Xendit webhook signature verification
**What:** Add `x-callback-token` header check at the top of `/api/webhooks/xendit/route.ts`.
**Why:** Without it, any attacker can POST a fake "PAID" event and mark orders as paid for free. One-line exploit, zero barrier.
**How to apply:** `if (req.headers.get('x-callback-token') !== process.env.XENDIT_WEBHOOK_TOKEN) return 401`
**Effort:** XS | **Depends on:** `XENDIT_WEBHOOK_TOKEN` env var set in Xendit dashboard + production `.env`

### 2. Admin authentication — custom middleware + httpOnly cookie
**What:** Replace hardcoded credentials in `src/app/admin/login/page.tsx` with env vars. Add `middleware.ts` that checks for a signed JWT in an httpOnly cookie on all `/admin/*` routes. Add `/api/admin/login` endpoint that sets the cookie on successful auth.
**Why:** Admin credentials (`test@gmail.com` / `test123`) are hardcoded in client-side source and visible in the browser JS bundle. Admin routes have zero server-side protection — direct GET to `/admin/orders` returns all customer data to anyone.
**How to apply:** `ADMIN_USERNAME` + `ADMIN_PASSWORD` → env vars. `middleware.ts` → `matcher: ['/admin/:path*']`. Use `jose` or `jsonwebtoken` for JWT signing.
**Effort:** S | **Depends on:** nothing

### 3. Checkout transaction safety — order-first pattern
**What:** Change checkout to create an order with status `INITIATING` before calling Xendit. Wrap all post-Xendit DB writes in `prisma.$transaction()`. If Xendit fails, update order to `CANCELLED`. Applies to both `/api/checkout/subscription` and `/api/checkout/one-time`.
**Why:** Currently: customer is charged by Xendit → DB write for subscription/payment record fails → money taken, no DB record. This is a financial data integrity critical gap.
**How to apply:** Create order (INITIATING) → call Xendit → `prisma.$transaction([createSubscription, createPayment, updateOrder(NEW)])`
**Effort:** S | **Depends on:** #5 (Zod validation makes this safer)

### 4. Webhook idempotency
**What:** Add `@@unique([externalId])` to the `Payment` model. Replace `prisma.payment.create` in webhook handler with `prisma.payment.upsert` keyed on `externalId`.
**Why:** Xendit retries failed webhooks. Each retry currently creates a duplicate Payment row. This corrupts payment history and can double-credit orders.
**How to apply:** Prisma migration + update webhook handler to use upsert.
**Effort:** XS | **Depends on:** nothing

---

## P1 — Fix before scaling to real customers

### 5. Input validation (Zod schemas on all API routes)
**What:** Add Zod schemas to all POST routes: `/api/checkout/subscription`, `/api/checkout/one-time`, `/api/webhooks/xendit`. Return 400 with a clear error message on invalid input.
**Why:** Currently a malformed request body causes `request.json()` to throw → uncaught TypeError → generic 500 instead of 400. Phone number is only validated client-side.
**Effort:** S | **Depends on:** nothing

### 6. Customer email uniqueness + upsert
**What:** Add `@@unique([email])` to the `Customer` model in `schema.prisma`. Replace `findFirst` + `create` pattern with `upsert` on email.
**Why:** Two concurrent checkouts with the same email create two customer records. No DB constraint prevents this.
**Effort:** XS (but requires migration) | **Depends on:** check for existing duplicate emails before migration

### 7. Real transactional email — Resend + React Email
**What:** Replace `src/lib/mock-email.ts` with Resend SDK. Keep the same exported function signatures so call sites don't change. Build React Email templates for: order confirmation, subscription created, payment failed.
**Why:** Customers currently receive zero confirmation after checkout. `mock-email.ts` only logs to console.
**Effort:** S | **Depends on:** `RESEND_API_KEY` env var, sender domain verified in Resend

### 8. Sentry error tracking
**What:** Install `@sentry/nextjs`. Add to `next.config.ts`. Configure DSN via env var.
**Why:** Production errors are currently invisible. Checkout failures, webhook errors, and payment processing issues go undetected until a customer complains.
**Effort:** S | **Priority:** P1 | **Depends on:** nothing

### 9. Fix landing page products — load from DB
**What:** The landing page (`src/app/page.tsx`) has Veggie Box Small/Medium/Family hardcoded as React constants. The admin pricing panel manages DB products but the landing page ignores it. Load products from `/api/products` in the landing page.
**Why:** Admin pricing changes don't reflect on the landing page. Pricing/name inconsistency confuses customers.
**Effort:** S | **Depends on:** nothing

### 10. Xendit customer deduplication fix
**What:** In `createXenditCustomer`, the `reference_id` currently uses `Date.now()` which is always unique. When a customer places a second order, a new Xendit customer is created even if one exists. The fix: use a stable reference like `customer-${email-hash}` or look up existing Xendit customer ID from DB before creating.
**Why:** Unbounded Xendit customer record growth, inconsistent customer history in Xendit dashboard.
**Effort:** XS | **Depends on:** nothing

---

## P2 — Phase 2 (post-launch, first month)

### 11. Customer portal (/account)
**What:** Self-service pages at `/account` where customers can view subscription status, pause, cancel, and update delivery address. Requires separate customer auth (email magic link or phone OTP — not the same as admin auth).
**Why:** Subscription customers who can't self-manage call/message to cancel → ops burden and churn. This is the primary retention lever for subscription commerce.
**Effort:** L | **Depends on:** customer auth system (separate from admin)

### 12. WhatsApp Business notifications
**What:** Integrate WhatsApp Business API (Twilio or Wati) as primary notification channel. Order confirmation, delivery reminder (day before), payment failure + retry link, subscription renewal reminder.
**Why:** In Indonesia, WhatsApp has 90%+ open rates vs low email open rates. This is how Indonesian businesses communicate with customers.
**Effort:** M-L | **Depends on:** #7 (Resend email as fallback), WhatsApp Business account verification (takes days-weeks)

### 13. Admin subscription management actions
**What:** Add pause, cancel, change-frequency buttons to the admin order/subscription view. Currently admin is read-only.
**Why:** Operators need to manually manage subscriptions on behalf of customers until the customer portal exists.
**Effort:** M | **Depends on:** Xendit Recurring Plans API (pause/cancel endpoints)

### 14. Admin order pagination
**What:** Add `take`/`skip` query params to `/api/orders` and paginate the admin orders table.
**Why:** As orders grow, the admin orders page will become unusably slow.
**Effort:** XS | **Depends on:** nothing

---

## P2 — Delight opportunities (Phase 2)

### 15. Success page order status polling
**What:** Add a polling loop on `/payment/success` that hits `/api/orders/{orderId}/status` every 2 seconds. Show "Confirming your payment..." spinner until webhook fires and order is PAID.
**Why:** Success page shows before webhook fires. Customers see success but order is still NEW. Creates confusion and support tickets.
**Effort:** S | **Depends on:** webhook idempotency (#4)

### 16. WhatsApp number field at checkout
**What:** Add optional `whatsappNumber` field to checkout form. Store in Customer model. Use for delivery coordination and WhatsApp notifications when API is integrated.
**Why:** Collecting the data now means it's available when WhatsApp integration (#12) is built. Zero friction to add.
**Effort:** XS | **Depends on:** nothing (just collect and store)

### 17. Next delivery date on success page
**What:** Calculate and display the first delivery date on the success page based on subscription frequency and anchor date logic (already in `xendit.ts`). "Your first Veggie Box Medium will arrive on Friday, March 21."
**Why:** Reduces "when will I get my box?" support questions. Builds customer confidence immediately after purchase.
**Effort:** S | **Depends on:** #3 (order-first pattern so orderId is reliable)

### 18. Admin "Mark as Delivered" button
**What:** Button on each order in admin panel to update status to DELIVERED. Optionally triggers a "Thank you for your delivery!" email.
**Why:** Closes the fulfillment loop for the operator. Gives customers a delivery confirmation touchpoint.
**Effort:** S-M | **Depends on:** #7 (real email) or #12 (WhatsApp)

---

## P3 — Phase 3 (growth phase)

### 19. Referral program
**What:** "Invite a friend, get a free box." Referral code generated per customer. Shown on success page and in confirmation email. Tracked in DB. Applied as discount on next subscription charge.
**Why:** Viral growth engine built into the confirmation flow. Subscription commerce's primary growth lever after retention.
**Effort:** L | **Depends on:** customer portal (#11), real email (#7)

### 20. Delivery scheduling + route optimization
**What:** Customer picks delivery day/slot during checkout. Admin sees a daily delivery manifest grouped by zone/area. Driver gets a printable/digital packing list.
**Why:** Operational efficiency at scale. Also a customer delight feature (predictable delivery window).
**Effort:** XL | **Depends on:** customer portal, admin management actions

### 21. Product catalog CMS
**What:** Replace hardcoded landing page product cards with CMS-editable content. Could be as simple as extending the admin pricing panel or integrating a headless CMS.
**Why:** Marketing team needs to update product descriptions, pricing, and imagery without deploying code.
**Effort:** M-L | **Depends on:** #9 (landing page loads from DB, which is a prerequisite)
