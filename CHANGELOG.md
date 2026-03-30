# Changelog

## [0.1.0.1] - 2026-03-30

### Fixed
- **Admin login build error** — moved top-level env var check inside request handler so production builds succeed without admin credentials set at build time
- **Support email** — updated `hello@panenbaik.id` → `hello@berkala.co` in EN and ID translations

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
