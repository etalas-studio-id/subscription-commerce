# Changelog

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
