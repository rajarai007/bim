# BIM Career Academy — Admin

Admin console for BIM Career Academy, implemented from the `admin-*` frames of the
Figma file **Bim** (`cPit0RIu9HRAeUyqi9HxnD`). Independent from the client app —
deploy it on its own host.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4
- `next/font` (Outfit + Manrope) · `next/image` · `lucide-react`
- Auth: the backend issues a JWT on `POST /api/v1/auth/login`; the `login` server action
  stores it in an httpOnly cookie, `proxy.ts` verifies it locally (`ADMIN_SESSION_SECRET`
  must equal the backend `JWT_SECRET`) and every API call re-validates it. A 401 from the
  API clears the cookie via `/logout` and returns to the login screen. Profile edits re-issue the
  token so the top bar updates without signing in again; "Forgot password" emails a single-use
  link handled by `/reset-password`.
- Data: server components read through `features/*/service.ts` (`lib/api.ts#adminFetch`),
  mutations run as server actions in `features/*/actions.ts` and revalidate the screen.

## Run

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, ADMIN_SESSION_SECRET (= backend JWT_SECRET), NEXT_PUBLIC_SITE_URL
npm install
npm run dev -- -p 3001       # http://localhost:3001/login
npm run lint && npm run build
```

Sign in with the admin user seeded by the backend (`ADMIN_EMAIL` / `ADMIN_PASSWORD` in `Backend/.env`).

## Screens

| Route | Figma frame |
|---|---|
| `/login` | admin-login |
| `/forgot-password`, `/reset-password?token=…` | not in Figma — same card shell as the login screen |
| `/profile` | not in Figma — edit name / email / photo, change password (top-bar avatar + sidebar "My Profile") |
| `/` | admin-dashboard |
| `/courses` | admin-course-list |
| `/courses/new`, `/courses/[id]/edit` | admin-course-editor |
| `/enquiries` | admin-lead-management |
| `/settings` | admin-settings |
| `/categories` `/trainers` `/testimonials` `/projects` `/faqs` | not in Figma — same table pattern plus create/edit dialogs |
| `/content` `/media` `/seo` | not in Figma — page list, media library (upload/delete), per-page SEO meta |

## Structure

```
app/(auth)/login         public login screen
app/(admin)/*            guarded screens (sidebar + top bar shell in layout.tsx)
app/logout/route.ts      clears the session cookie (used when the API rejects a session)
app/(admin)/enquiries/export  streams the CSV export from the API with the admin session
components/
  layout/                Sidebar, TopBar (+ mobile drawer), AdminPage, Logo
  ui/                    Button, Card, StatusBadge, fields, Switch, Table, Pagination (URL-driven),
                         SearchInput, Dialog, ImagePicker (uploads to the API), FormStatus
  charts/                Sparkline, TrendChart, DonutChart (data-driven inline SVG)
  dashboard/ courses/ enquiries/ settings/ catalog/ media/ auth/
features/*/service.ts    Server-side reads from the API
features/*/actions.ts    Server actions for every mutation (create/update/delete/upload)
features/auth/           JWT verification, login/logout actions, session helpers
lib/api.ts               API client (envelope unwrapping, 401 → logout)
proxy.ts                 Redirects unauthenticated requests to /login
```

Design tokens (light slate palette, semantic status colours, type scale, radii,
shadows, sidebar/top-bar sizes) live in `app/globals.css` under `@theme`.
