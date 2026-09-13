# BIM Career Academy — Backend API

REST API (Express 5 + TypeScript + PostgreSQL) that powers both Next.js apps:

- **Client website** (`Frontend/Client`) — public catalogue, settings, SEO meta, enquiry submission
- **Admin console** (`Frontend/Admin`) — JWT-protected management of every screen in the console

## Stack

- Node.js 20+, Express 5, TypeScript (strict), `pg` (no ORM), zod validation
- PostgreSQL 14+ (developed and tested against Neon / PostgreSQL 18)
- JWT (HS256) access tokens + bcrypt password hashing, helmet, CORS, rate limiting, pino logs
- Vitest + supertest integration tests against a dedicated test database

## Setup

```bash
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, ADMIN_EMAIL / ADMIN_PASSWORD
npm install
npm run db:migrate        # creates the schema (idempotent)
npm run db:seed           # seeds admin user, catalogue, settings, pages (idempotent)
npm run dev               # http://localhost:4000
```

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` / `npm start` | Compile to `dist/` and run the compiled server |
| `npm run typecheck` / `npm run lint` | TypeScript + ESLint |
| `npm test` | Full integration suite (creates/migrates/seeds `TEST_DATABASE_URL` automatically) |
| `npm run db:migrate` | Apply pending SQL migrations from `src/database/migrations` |
| `npm run db:seed` | Seed initial data (never overwrites existing rows) |
| `npm run db:reset` | Drop all tables, migrate and seed again (refuses to run in production) |
| `npm run db:migrate:prod` / `db:seed:prod` | Same, from the compiled `dist/` build |

## Environment variables

See [`.env.example`](.env.example). The important ones:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`sslmode=require` supported) |
| `TEST_DATABASE_URL` | Database used by `npm test` (defaults to `<DATABASE_URL>_test`) |
| `JWT_SECRET` | Signs admin sessions — must equal the admin app's `ADMIN_SESSION_SECRET` |
| `JWT_EXPIRES_IN` / `JWT_REMEMBER_EXPIRES_IN` | Token lifetime (default `12h`, "remember me" `30d`) |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial super-admin created by the seeder |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API directly |
| `UPLOAD_DIR` / `MAX_UPLOAD_MB` | Where admin uploads are stored (served at `/uploads`) |
| `SEED_DEMO_DATA` | Seed demo enquiries (defaults to true outside production) |
| `RATE_LIMIT_ENABLED` | Disable rate limiting (tests set this to `false`) |
| `ADMIN_URL` | Origin of the admin console, used to build password-reset links |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | Outgoing email; leave `SMTP_HOST` empty locally to log emails instead |
| `PASSWORD_RESET_TTL_MINUTES` | Lifetime of a reset link (default 60) |

## Project structure

```
src/
  app.ts               Express app (middleware, static media, routes)
  server.ts            Bootstrap + graceful shutdown
  config/              env (validated with zod), logger, pg pool
  routes/              auth, public, admin route tables
  controllers/         HTTP layer only
  validators/          zod schemas for every body / query / param
  services/            business logic + response serialisers
  repositories/        all SQL (parameterised)
  models/              entity types
  middleware/          auth (JWT), validate, rate-limit, error handler
  database/            migrator, SQL migrations, seeders
  utils/               ApiError, response envelope, formatting, SQL builder
assets/images/         seeded catalogue images (served at /images)
uploads/               admin uploads (git-ignored, served at /uploads)
tests/                 vitest + supertest integration tests
```

## Response envelope

```jsonc
// success
{ "success": true, "data": { ... }, "message": "optional" }
// error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "slug", "message": "Must be unique" }] }
// paginated lists
{ "success": true, "data": { "items": [...], "pagination": { "page": 1, "pageSize": 10, "total": 30, "totalPages": 3 } } }
```

## Routes

### Public (`/api/v1`, no auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/settings` | Public academy settings (contact, social, GA id) |
| GET | `/pages` | SEO meta for the website pages |
| GET | `/categories`, `/categories/:slug` | Active course categories |
| GET | `/courses?category=&featured=` | Active courses (cards) |
| GET | `/courses/:slug` | Course detail + related programs |
| GET | `/trainers?home=` | Active trainers |
| GET | `/testimonials` | Published testimonials |
| GET | `/projects?home=` | Published projects |
| GET | `/faq-categories`, `/faqs?home=` | Published FAQs |
| POST | `/enquiries` | Submit an enquiry (rate-limited) |

### Auth

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | `{ email, password, remember }` → `{ token, expiresAt, user }` (rate-limited) |
| POST | `/auth/forgot-password` | `{ email }` → always 200; emails a single-use reset link (60 min) when the account exists |
| POST | `/auth/reset-password` | `{ token, password }` → sets the new password, invalidates every open link |
| GET | `/auth/me` | Current admin profile (Bearer token) |
| PATCH | `/auth/me` | Update `name`, `email`, `avatarUrl` → returns the user + a re-issued token |
| PATCH | `/auth/password` | `{ currentPassword, newPassword }` |

Reset emails go through SMTP when `SMTP_HOST` is set; otherwise the message (with the link) is
written to the server log so the flow can be exercised locally.

### Admin (`/api/v1/admin`, `Authorization: Bearer <jwt>`)

| Resource | Routes |
|---|---|
| Dashboard | `GET /dashboard` |
| Courses | `GET /courses?page&pageSize&q&category&status`, `POST /courses`, `GET/PUT/DELETE /courses/:id`, `PATCH /courses/:id/featured` |
| Categories, Trainers, Testimonials, Projects, FAQs | `GET /<resource>?q`, `POST /<resource>`, `GET/PUT/DELETE /<resource>/:id` |
| Enquiries | `GET /enquiries?page&pageSize&q&status&course&days`, `GET /enquiries/stats`, `GET /enquiries/export` (CSV), `GET/DELETE /enquiries/:id`, `PATCH /enquiries/:id/status`, `POST /enquiries/:id/notes` |
| Settings | `GET /settings`, `PATCH /settings` (partial), `GET /pages`, `PATCH /pages/:id` |
| Media | `GET /media`, `POST /media` (multipart `file`), `DELETE /media/:id` |

`GET /health` reports API + database status.
