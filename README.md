# Berkala — Subscription Commerce Platform

A mobile-first, white-label DTC subscription commerce web app. Built with real Xendit payment integration, full user authentication, and a complete admin dashboard.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma db push

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma** + **PostgreSQL** (Neon / Vercel Postgres)
- **NextAuth v5** — Google OAuth + email/password credentials
- **Zod** for validation
- **Xendit** for payment integration
- **Vitest** + **Testing Library** for unit tests

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── products/page.tsx               # Product selection
│   ├── checkout/page.tsx               # Checkout form (autofill for logged-in users)
│   ├── login/page.tsx                  # Login (Google OAuth + credentials)
│   ├── register/page.tsx               # User registration
│   ├── account/page.tsx                # Account — profile, addresses, order history
│   ├── unlock/page.tsx                 # Site password gate
│   ├── payment/
│   │   ├── success/page.tsx
│   │   └── failed/page.tsx
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard (KPIs)
│   │   ├── users/page.tsx              # Customer management
│   │   ├── orders/page.tsx             # Order management
│   │   ├── pricing/page.tsx            # Pricing CRUD
│   │   ├── frequencies/page.tsx        # Frequency settings
│   │   └── emails/page.tsx             # Email log viewer
│   └── api/
│       ├── auth/[...nextauth]/         # NextAuth handler
│       ├── auth/register/              # Email registration
│       ├── account/profile/            # GET/PUT profile
│       ├── account/addresses/          # GET/POST/DELETE addresses
│       ├── checkout/one-time/          # One-time order API
│       ├── checkout/subscription/      # Subscription API
│       ├── admin/users/                # Admin user management API
│       ├── products/                   # Products API
│       ├── unlock/                     # Site password verification
│       └── webhooks/xendit/            # Xendit webhook handler
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── auth-adapter.ts                 # Custom Prisma adapter (Customer model)
│   ├── db.ts                           # Prisma client
│   ├── xendit.ts                       # Xendit service layer
│   └── mock-email.ts                   # Mock email service
└── components/
    ├── home/                           # Landing page sections
    ├── layout/                         # Header, Footer (session-aware)
    ├── providers/                      # AuthProvider (SessionProvider)
    └── ui/                             # shadcn/ui primitives
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | Yes |
| `DATABASE_URL_UNPOOLED` | PostgreSQL direct connection (for migrations) | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for redirects | Yes |
| `AUTH_SECRET` | NextAuth secret (min 32 chars) | Yes |
| `JWT_SECRET` | Secret for admin JWT sessions | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `USE_MOCK_XENDIT` | `true` for mock mode, `false` for real API | Yes |
| `XENDIT_API_KEY` | Xendit API key (sandbox or production) | For real mode |
| `XENDIT_WEBHOOK_TOKEN` | Webhook verification token | Optional |
| `SITE_PASSWORD` | Enables site-wide password gate when set | Optional |

## Features

### Customer-Facing
- Landing page, product listing, checkout flow
- One-time and subscription payment via Xendit
- **User accounts** — Google OAuth and email/password login
- **Registration** — new accounts or upgrade from guest checkout
- **Account page** — edit profile, manage saved addresses, view order history
- **Checkout autofill** — name, email, phone, and address pre-filled for logged-in users
- **Site password gate** — optional lock screen (set `SITE_PASSWORD` env var)

### Admin
- Dashboard with KPIs
- Order management with filters
- **Customer management** — list, search, filter, and edit customers
- Pricing and frequency CRUD
- Email notification log

### Auth
- NextAuth v5 with JWT sessions
- Google OAuth (optional — only active when credentials are set)
- Email/password credentials with bcrypt hashing
- Custom Prisma adapter mapping NextAuth's User to the `Customer` model
- Protected `/account/*` routes via middleware

## Payment Integration (Xendit)

### One-Time Payment
1. Customer submits checkout
2. Backend creates Xendit invoice via `POST /v2/invoices`
3. Customer redirected to Xendit payment page
4. On return, success/failed page shown
5. Xendit webhook updates payment status

### Subscription Payment
1. Customer submits checkout with subscription frequency
2. Backend creates Xendit customer via `POST /customers`
3. Backend creates recurring plan via `POST /recurring/plans`
4. If `REQUIRES_ACTION`, customer redirected to authorization URL
5. Xendit webhooks handle plan activation and billing cycles

### Mock Mode (`USE_MOCK_XENDIT=true`)
- Xendit API calls return simulated responses
- No real API key required
- Email notifications log to console + database (no actual emails sent)

## Database Commands

```bash
# Push schema changes
npm run db:push

# Seed data
npm run db:seed

# Full reset
npm run db:reset
```

## Tests

```bash
npm test
```

Unit tests cover the admin Users page (filter, search, edit flows) using Vitest + Testing Library.

## AI Assistance Setup

Pre-configured AI skills help coding assistants understand the architecture and Xendit checkout implementation:

- **Claude Code**: `.claude/commands/checkout/SKILL.md`
- **Gemini Agent**: `.gemini/skills/checkout/SKILL.md`
