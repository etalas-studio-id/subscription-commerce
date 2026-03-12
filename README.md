# The Good Harvest — Subscription Commerce Prototype

A mobile-first, premium DTC subscription commerce web app for fresh produce delivery. Built as a demoable prototype with real Xendit integration architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma db push

# Seed sample data
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma** + **SQLite** (local prototype DB)
- **Zod** for validation
- **Xendit** for payment integration

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── products/page.tsx             # Product selection
│   ├── checkout/page.tsx             # Checkout form
│   ├── payment/
│   │   ├── redirect/page.tsx         # Xendit redirect intermediate
│   │   ├── success/page.tsx          # Payment success
│   │   └── failed/page.tsx           # Payment failed
│   ├── admin/
│   │   ├── page.tsx                  # Dashboard
│   │   ├── orders/page.tsx           # Order management
│   │   ├── pricing/page.tsx          # Pricing CRUD
│   │   ├── frequencies/page.tsx      # Frequency settings
│   │   └── emails/page.tsx           # Email log viewer
│   └── api/
│       ├── checkout/one-time/        # One-time order API
│       ├── checkout/subscription/    # Subscription API
│       ├── webhooks/xendit/          # Xendit webhook handler
│       └── ...                       # Other API routes
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── xendit.ts                     # Xendit service layer
│   └── mock-email.ts                 # Mock email service
└── components/
    ├── home/                         # Landing page sections
    ├── checkout/                     # Checkout form components
    ├── layout/                       # Global Headers & Footers
    └── ui/                           # shadcn/ui primitives
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite path (default: `file:./dev.db`) | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for redirects (default: `http://localhost:3000`) | Yes |
| `USE_MOCK_XENDIT` | `true` for mock mode, `false` for real API | Yes |
| `XENDIT_API_KEY` | Xendit API key (sandbox or production) | For real mode |
| `XENDIT_WEBHOOK_TOKEN` | Webhook verification token | Optional |

## What's Real vs Mocked

### ✅ Real (fully implemented)
- Complete customer checkout flow (landing → products → checkout → payment result)
- Prisma data model with all relationships
- API routes for all CRUD operations
- Admin dashboard with KPIs
- Order management with filters
- Pricing and frequency management
- Email notification logging

### 🔶 Mock Mode (USE_MOCK_XENDIT=true)
- Xendit API calls return simulated responses
- Payment redirect simulates the hosted payment page
- Webhook events can be triggered manually
- Email notifications log to console + database (no actual emails sent)

### 🔄 Ready for Real Mode (USE_MOCK_XENDIT=false)
When you set `USE_MOCK_XENDIT=false` and provide a real `XENDIT_API_KEY`:
- One-time invoices are created via `/v2/invoices`
- Subscription plans are created via `/recurring/plans`
- Customer profiles are created via `/customers`
- Webhook handler processes real Xendit events
- Auth redirect URL comes from actual Xendit response

## Xendit Integration Flow

### One-Time Payment
1. Customer submits checkout form
2. Backend creates Xendit invoice via `POST /v2/invoices`
3. Customer is redirected to Xendit payment page
4. After payment, customer returns to success/failed page
5. Xendit sends webhook to update payment status

### Subscription Payment
1. Customer submits checkout with subscription frequency
2. Backend creates Xendit customer via `POST /customers`
3. Backend creates recurring plan via `POST /recurring/plans`
4. If status is `REQUIRES_ACTION`, customer is redirected to authorization URL
5. After authorization, customer returns to success/failed page
6. Xendit sends webhook events for plan activation and billing cycles

## Database Commands

```bash
# Push schema changes
npm run db:push

# Seed data
npm run db:seed

# Full reset (delete DB + push + seed)
npm run db:reset
```

## For Production

Replace these for a production deployment:
- SQLite → PostgreSQL (update `datasource` in `schema.prisma`)
- Mock email → Real email provider (SendGrid, Resend, etc.)
- Mock Xendit → Real Xendit sandbox/production keys
- Add webhook signature verification
- Add proper authentication for admin pages
- Add rate limiting and input sanitization
- Hash any stored credentials

## AI Assistance Setup

This prototype includes pre-configured AI skills (instructions) to help standard AI coding assistants natively understand the project architecture and Xendit checkout implementation.

The skill configurations are stored in two locations (they are symlinked):
- **Gemini Agent**: `.gemini/skills/checkout/SKILL.md`
- **Claude Code**: `.claude/commands/checkout/SKILL.md`
