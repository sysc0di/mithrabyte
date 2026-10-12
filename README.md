# Mithrabyte

Next.js 16 (App Router) corporate site for Mithrabyte, with a PostgreSQL-backed,
fully functional admin CMS (Phase 0).

## Stack

- **Framework:** Next.js 16, App Router, React Server Components, `next-intl` (tr/en)
- **Data:** PostgreSQL via [Prisma 7](https://www.prisma.io) with the `prisma-client`
  generator (outputs to `src/generated/prisma`) and the `@prisma/adapter-pg` driver adapter
- **Auth:** Argon2id (`@node-rs/argon2`), random 64-char session tokens (SHA-256 stored),
  DB-backed rate limiting, per-route permission checks, audit logs
- **Validation:** Zod contracts (shared between runtime and tests)
- **Tests:** Vitest (37 tests) against a separate `mithrabyte_test` database
- **Lint:** ESLint flat config (`eslint.config.mjs`), zero errors

## Getting started

### 1. Requirements

- Node.js 22+
- Docker (for the local PostgreSQL instance) or your own PostgreSQL

### 2. Environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `ADMIN_INIT_EMAIL`, `ADMIN_INIT_PASSWORD`, etc. See
`.env.example` for all options. Never commit `.env`.

### 3. Database

```bash
# Start PostgreSQL (docker-compose.yml):
docker compose up -d

# Install deps and generate the Prisma client (auto-runs via postinstall):
npm install

# Apply migrations:
npm run db:deploy

# Seed the initial administrator + core site settings (idempotent):
npm run db:seed
```

> The generated client lives in `src/generated/` (gitignored) and is rebuilt on
> `npm install` / `prisma generate`, so it must not be committed.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve production build
```

## Admin panel

- URL: `/admin` (login at `/admin/login`)
- The seed admin signs in with `ADMIN_INIT_EMAIL` / `ADMIN_INIT_PASSWORD` and is
  prompted to change the password on first login.
- Core sections: Dashboard, Products, Categories, Service Packages, Pages,
  Site Settings, Inbox, Analytics, Audit Log, Admins, Sessions, Account.

### Creating administrator accounts from the CLI

Besides the in-panel **Admins** screen (OWNER only), you can create accounts
straight from the shell:

```bash
# Password via env var (recommended — keeps it out of shell history):
ADMIN_CREATE_PASSWORD='a-strong-password' \
  npm run admin:create -- -e staff@mithrabyte.com -n "Staff"

# Or pass it explicitly:
npm run admin:create -- -e owner@mithrabyte.com -n "Owner" \
  --role OWNER --force-password-change --password "a-strong-password"

npm run admin:create -- --help
```

Options: `--email/-e`, `--name/-n`, `--password/-p`, `--role/-r ADMIN|OWNER`
(default `ADMIN`), `--force-password-change`. If no password is supplied it falls
back to `ADMIN_CREATE_PASSWORD`, then to an interactive prompt. The command
refuses to overwrite an existing account.

### Auth & security notes

- Argon2id password hashing (OWASP parameters; `ARGON2_LOOSE_COST=1` reduces cost in
  non-production only).
- Sessions: 32-byte random token, only its SHA-256 stored in `admin_sessions`; cookies
  are HttpOnly / Secure(in prod) / SameSite=Lax; each login rotates the session.
- Password changes **revoke all active sessions** (including the current one).
- Mutable admin routes are CSRF-protected by Origin / Sec-Fetch-Site checks.
- Rate limiting is DB-backed: `login_attempts` (5 fails / 15 min) and `request_logs`
  for contact + analytics ingestion.
- YouTube-analytics-style `RequestLog`/`login_attempts` tables feed the throttling.
- Last-Owner protection: the final `OWNER` cannot be demoted, deleted, or have their
  own role changed by name-guessing.

### Environment guards

If `ADMIN_INIT_EMAIL` is unset and no admin exists, the auth service refuses to create
accounts until it is configured (hostile-default bootstrap).

## Testing

```bash
npm test
```

Tests require a running PostgreSQL with a `mithrabyte_test` database (see
`tests/setup.js` and `.env.test`). Test files run sequentially because they share
the database.

```bash
npm run lint       # ESLint
```

## Public site

Phase 0 keeps the existing marketing pages (home, about, services, packages,
contact) driven by next-intl. Phase 1 will render them from the database tables
(`Product`, `Category`, `ServicePackage`, `Page`, `PageSection`, `SiteSetting`).

Public write endpoints:
- `POST /api/contact` — contact form (rate limited, stored in `inquiry`)
- `POST /api/analytics` — privacy-aware event ingestion (rate limited)

## Useful scripts

| Command              | Purpose                                |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Dev server (Turbopack)                 |
| `npm run build`      | Production build                       |
| `npm run lint`       | ESLint (flat config)                   |
| `npm test`           | Vitest suite                           |
| `npm run db:generate`| Regenerate Prisma client               |
| `npm run db:migrate` | `prisma migrate dev`                   |
| `npm run db:deploy`  | `prisma migrate deploy` (idempotent)   |
| `npm run db:seed`    | Seed admin + settings (idempotent)     |
| `npm run admin:create` | Create an administrator account      |
| `npm run db:studio`  | Prisma Studio                          |
| `npm run db:reset`   | Reset DB + reapply migrations/seed     |

## Deploy

- Apply migration: `npm run db:deploy`
- Provide `DATABASE_URL` (+ `PRISMA_DATABASE_URL` if your host requires a
  separate URL for Prisma migrations) and the `ADMIN_INIT_*` variables.
- Build with `npm run build`. Security headers (CSP, HSTS, frame/XSS protections)
  are applied in `next.config.mjs`; HSTS is enabled only in production.