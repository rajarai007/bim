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
  courses/[category]/[slug]/syllabus/route.ts  streams the course's syllabus PDF from the API as a download
components/
  ui/                    Button, Badge, chips, form fields, SectionHeading, Divider
  layout/                Header, Footer, Container, Section, PageBanner, Breadcrumb
  icons/                 Logo + exact Figma vectors (chevrons, social marks, WhatsApp stand-in)
  motion/                MotionProvider (reveal/spotlight/parallax/tilt/magnetic/depth), Cursor,
                         AmbientLight, HeroScene → BlueprintScene (Canvas 2D wireframe model),
                         DraftingMarks, PageTransition, SplitWords
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

## Motion & spatial system

Everything is dependency-free (CSS + one `MotionProvider` + a Canvas 2D hero scene) and
opt-in through data attributes so components stay Server Components — see the "Motion
system" and "Spatial system" comments in `app/globals.css`:

- `data-reveal` / `data-reveal-stagger` / `data-reveal-delay` — scroll reveals
- `data-spotlight`, `data-tilt`, `data-magnetic`, `data-depth`, `data-parallax` — pointer light,
  3D tilt, magnetic CTAs, pointer-parallax layers, scroll parallax (fine pointers only)
- `.glass` / `.glass-strong` / `.glass-edge`, `.sheet`, `.hud`, `.dim-line` + `.draw-in`,
  `.viewer-frame`, `data-scroll="rise|recede"` (scroll-driven, progressive enhancement)
- Route transitions use React `<ViewTransition>` via `components/motion/page-transition.tsx`
  in every `page.tsx`; course cards morph into the course page hero (`courseMorphName`).

All of it is gated behind `prefers-reduced-motion`, `(hover: hover) and (pointer: fine)` and
`scripting: enabled`; the hero canvas pauses off-screen and on hidden tabs.

## Backend integration

All content is read through `features/<domain>/service.ts`, which call the REST API with
`cache: "no-store"` so every request reflects the latest admin edits (the whole site is
`force-dynamic`). Contact details, social links and page SEO meta come from the API's
`/settings` and `/pages` endpoints; `lib/config.ts` only keeps static fallbacks.
Enquiry forms submit through the `submitEnquiry` server action (`features/enquiry/actions.ts`),
which forwards to `POST /api/v1/enquiries` and maps API validation errors back onto the fields.
Pages resolve their data before streaming (no `loading.tsx`): unknown slugs return a real 404
status and the scroll-reveal motion system never touches nodes before React hydrates them.
