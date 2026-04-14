# Changelog

## [0.2.1.2] - 2026-04-14

### Fixed
- **Checkout autofill** — logged-in users now see their name and email pre-filled immediately on the checkout details form. Previously, autofill relied solely on the `/api/account/profile` API call; if that call failed or returned empty, the form stayed blank. Now name and email are filled directly from the NextAuth session JWT (always available when logged in), with the API call still used to fill phone number and saved address.

### Changed
- **Turbopack config** — added `turbopack.root` to `next.config.ts` to prevent workspace root inference errors when the project path contains spaces (Conductor workspace layout).
## [0.2.2.0] - 2026-04-14

### Added
- **Admin product management** — admins can now create new products (name, description, base price, compare price, tags) and delete products directly from the Products admin page
- **Delete guard** — attempting to delete a product with existing orders returns a 409 error with a clear message; products with no orders are hard-deleted cleanly
- **POST/DELETE `/api/products`** — new endpoints for product creation (Prisma transaction: Product + PriceConfig) and deletion (order count check + cascading delete)

### Changed
- **Admin nav "Pricing" → "Products"** — renamed to reflect full product management scope; updated icon from DollarSign to Package
- **ProBall Football branding** — replaced all remaining Berkala/Panen Baik copy, logos, and colors across homepage, admin, login, register, payment pages
- **Homepage translations** — full EN/ID copy rewrite for ProBall Football Academy (hero, trust bar, features, footer)
- **Customer products page** — dynamic bottom padding prevents sticky checkout bar from obscuring the last product card
- **Google OAuth conditional** — provider only loaded when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set, preventing auth errors in environments without Google OAuth configured

### Fixed
- **`"use client"` directive ordering** — fixed in login, register, payment pages where Image import was accidentally prepended before the directive
- **NextAuth `AUTH_SECRET`** — documented requirement; auth no longer throws on missing secret

## [0.2.1.1] - 2026-04-12

### Fixed
- **Admin login redirect** — visiting `/admin/login` while already logged in now immediately redirects to `/admin` instead of staying on the login page. Prevents form flash by initializing redirect state synchronously.
- **Session expiry loop** — expired JWT sessions no longer cause an infinite redirect loop between `/admin` and `/admin/login`. Middleware now signals expiry via `?expired=1` and the login page clears stale localStorage on receipt.

## [0.2.1.0] - 2026-04-09

### Added
- **ProBallFootball design theme** — navy + electric blue color palette replacing emerald/green; matches client branding exactly (`#1A529F` primary, `#3291F4` accent, `#080E1D` deep navy)
- **Dark hero section** — homepage hero now uses deep navy background with white headline and bright blue accent span
- **Onest typeface** — replaced Inter + DM Serif Display with single Onest font family (weights 300/400/500/700)

### Changed
- **Border radius** — reduced from 12px to 8px throughout (matches proball's 8-9px style)
- **CSS variable namespace** — `--color-emerald-*` renamed to `--color-blue-*`; all component references updated
- **Heading style** — `.heading-display` now uses bold weight Onest instead of serif font

## [0.2.0.0] - 2026-04-09

### Added
- **Admin Users page** — `/admin/users` lists all customers with account type (Registered vs Guest), order count, join date, and phone
- **User filter & search** — filter by All / Registered / Guest; search by name or email
- **Edit user** — admin can update name, email, and phone for any customer via an inline modal
- **Users API** — `GET /api/admin/users` returns all customers (passwordHash stripped, `isRegistered` flag added); `PATCH /api/admin/users` updates customer fields with auth guard and email-conflict handling
- **Vitest test framework** — bootstrapped with `@testing-library/react`; 5 tests covering the Users page filter, search, and edit flows
- **Local database setup** — PostgreSQL via Docker (`berkala-postgres` container) for local development

### Changed
- **Admin sidebar** — Users added as a nav item between Frequencies and Email Logs
- **Admin login** — fixed authentication bug where dashboard checked localStorage but login only set the httpOnly cookie; now sets both
- **Admin logout** — clears localStorage on sign out (previously only cleared the session cookie)
- **API auth guard** — `/api/admin/users` endpoints require a valid admin JWT cookie; returns 401 if missing or expired

## [0.1.0.0] - 2026-03-30

### Added
- **User authentication** — Google OAuth and email/password login via NextAuth v5 (JWT sessions)
- **Registration** — `/register` page with name, email, phone, password; guest customers can upgrade to full accounts
- **Login page** — `/login` with Google sign-in and credentials form
- **Account page** — `/account` with profile editing, saved addresses (add/delete), and order history
- **Auth middleware** — `/account/*` routes protected; redirect to `/login?callbackUrl=...` when unauthenticated
- **Checkout autofill** — logged-in users have name, email, phone, and saved address pre-filled at checkout
- **Guest checkout** — unchanged; "Create account with this order" checkbox lets guests register after purchase
- **Session-aware header** — shows user avatar + dropdown (Account, Log Out) when signed in; "Log In" link when not
- **Custom Prisma adapter** — maps NextAuth's User model to the existing `Customer` model
- **Account & Address APIs** — `/api/account/profile` (GET/PUT) and `/api/account/addresses` (GET/POST/DELETE)

### Changed
- **Brand rename** — "Panen Baik" → "Berkala" across all UI, emails, translations, and package name
- **Header cleanup** — Admin link removed from public header; accessible only via `/admin` directly
- **Prisma schema** — `Customer` extended with `passwordHash`, `emailVerified`, `image`, `accounts`; new `Account` and `VerificationToken` models added
- **Address DELETE** — atomic `deleteMany` with ownership check replaces two-step findUnique + delete
