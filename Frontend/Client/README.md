# BIM Career Academy — Client

Public / student-facing website for BIM Career Academy, implemented from the
Figma file **Bim** (`cPit0RIu9HRAeUyqi9HxnD`).

## Stack

- Next.js 16 (App Router, Server Components by default) · React 19 · TypeScript (strict)
- Tailwind CSS v4 — design tokens live in `app/globals.css` (`@theme`)
- `next/font` (Outfit + Manrope) · `next/image` · `lucide-react`

## Scripts

```bash
npm run dev     # http://localhost:3000
npm run lint
npm run build
npm start
```

## Configuration

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000 (the backend in ../../Backend)
```

## Structure

```
app/(marketing)/         routes (home, about, contact, courses, trainers, projects, faq, privacy)
components/
  ui/                    Button, Badge, chips, form fields, SectionHeading, Divider
  layout/                Header, Footer, Container, Section, PageBanner, Breadcrumb
  icons/                 Logo + exact Figma vectors (chevrons, social marks, WhatsApp stand-in)
  home/ about/ courses/ trainers/ projects/ faq/ forms/ shared/
data/site.ts             Static marketing copy (feature lists, journey steps, software list)
features/*/service.ts    Data-access layer — fetches the backend API (`lib/api.ts`)
features/enquiry/        Enquiry form contract + server action that posts to the API
types/                   Shared domain types (mirror the API contracts)
lib/                     api client, media URL resolver, config (fallbacks), constants, utils
public/images/           De-duplicated Figma assets
```

## Design tokens

Colours (`canvas`, `surface`, `elevated`, `line`, `primary`, `accent`, `body`, `muted` …),
the pixel type scale (`text-10` … `text-56`), line heights (`leading-native`, `leading-hero`,
`leading-compact`, `leading-body`), radii and the 1440px page container are all declared in
`app/globals.css` and used as Tailwind utilities.

## Backend integration

All content is read through `features/<domain>/service.ts`, which call the REST API with
`cache: "no-store"` so every request reflects the latest admin edits (the whole site is
`force-dynamic`). Contact details, social links and page SEO meta come from the API's
`/settings` and `/pages` endpoints; `lib/config.ts` only keeps static fallbacks.
Enquiry forms submit through the `submitEnquiry` server action (`features/enquiry/actions.ts`),
which forwards to `POST /api/v1/enquiries` and maps API validation errors back onto the fields.
Pages resolve their data before streaming (no `loading.tsx`): unknown slugs return a real 404
status and the scroll-reveal motion system never touches nodes before React hydrates them.
