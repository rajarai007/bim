# BIM Career Academy

Full-stack platform built from the Figma file **Bim** (`cPit0RIu9HRAeUyqi9HxnD`):

| App | Path | Purpose | Dev URL |
|---|---|---|---|
| Backend API | `Backend` | Express 5 + TypeScript + PostgreSQL REST API used by both apps | `http://localhost:4000` |
| Client | `Frontend/Client` | Public / student-facing website (dark theme) | `http://localhost:3000` |
| Admin | `Frontend/Admin` | Admin console (light theme, JWT session cookie) | `http://localhost:3001` |

## Run everything locally

```bash
# 1. API + database
cd Backend && cp .env.example .env     # set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install && npm run db:migrate && npm run db:seed && npm run dev

# 2. Client website
cd Frontend/Client && cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install && npm run dev -- -p 3000

# 3. Admin console
cd Frontend/Admin && cp .env.example .env.local    # NEXT_PUBLIC_API_URL + ADMIN_SESSION_SECRET (= backend JWT_SECRET)
npm install && npm run dev -- -p 3001
```

Sign in to the admin console with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded.

## How the pieces fit

- Both Next.js apps act as backends-for-frontend: server components and server actions call the API;
  the browser never talks to the API or holds a token.
- The admin session is a backend-issued JWT stored in an `httpOnly` cookie, verified locally by
  `proxy.ts` (shared secret) and re-verified by the API on every request.
- Catalogue images are served by the API (`/images/*` seeds, `/uploads/*` admin uploads); both apps
  allow that origin in `next.config.ts`.
- Every public page renders fresh data on request, so admin edits are live immediately.

See each folder's `README.md` for details.
