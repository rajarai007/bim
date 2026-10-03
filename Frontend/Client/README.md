# BIM Career Academy — Client

Public / student-facing website for BIM Career Academy, implemented from the
Figma file **Bim** (`cPit0RIu9HRAeUyqi9HxnD`).

## Stack

- Next.js 16 (App Router, Server Components by default) · React 19 · TypeScript (strict)
- Tailwind CSS v4 — design tokens live in `app/globals.css` (`@theme`)
- `next/font` (Figtree) · `next/image` · `lucide-react`

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
  courses/[category]/[slug]/syllabus/route.ts  syllabus PDF download: the uploaded file from the API, or one generated from the course content (features/courses/syllabus-pdf.ts; lib/pdf.ts writes the PDF, lib/png.ts + lib/brand-logo.ts embed the logo).
                         On the course page the "Download Syllabus" CTA opens components/courses/syllabus-request-dialog.tsx, which stores a `syllabus_download` enquiry (course, name, phone, email) and then starts the download.
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

## Design system ("night studio")

Dark, layered theme declared in `app/globals.css`: tokens in `@theme` (surfaces
`canvas` / `surface` / `elevated`, hairlines `line` / `line-strong`, brand `primary`
orange + `accent` cyan-teal, `violet` for atmosphere only, `heading` / `body` /
`muted` type colours, the pixel type scale `text-10` … `text-72`, radii, shadows,
glass and motion timings) and reusable component classes in `@layer components`:

- Surfaces: `.glass` / `.glass-strong` / `.glass-edge`, `.card-lift` (raised sheet),
  `.card-aurora` (animated gradient border for the featured tier), `.sheet`
  (section band with a lit top edge), `.section-rule`, `.state-panel` (empty / error)
- Controls: `.btn-primary` / `.btn-secondary` / `.btn-outline` / `.btn-outline-filled` /
  `.btn-whatsapp` (used by `components/ui/button.tsx`, which also has a `loading`
  state), `.control` (dark glass inputs with the brand focus ring), `.well` (icon discs)
- Type: `.display` (tight display tracking), `.gradient-text`, `.label`
- Atmosphere: `.ambient` (fixed light layer), `.mesh`, `.orb`, `.floor-grid`
  (perspective floor in the hero; `data-static` variant for the footer), `.nav-shell`
  (floating glass navigation)
- 3D layer: `data-reveal="flip"` / `data-reveal-stagger="flip"` (cards flip up out of
  perspective), `<Section tilt>` (band swings into view, scroll-driven, ≥1024px), `.pop`
  layers that rise out of a tilted `data-tilt` card, `Gyro` / `Cube` ornaments and the
  `.scanline` in `components/motion/drafting-marks.tsx`, `.coin` logo spin. The hero
  model assembles floor by floor on load and explodes vertically as the hero scrolls out
  (`components/motion/blueprint-scene.tsx`).

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

## SEO

- **Head tags**: `lib/seo.ts` → `buildMetadata()` gives every indexable page its title, description,
  self-referencing canonical, robots directive and Open Graph / X card tags. Static pages go through
  `getPageMetadata()` (`features/pages/service.ts`), so the title and description saved in the admin
  console (SEO tab) win over the defaults in each `page.tsx`. Course pages use the meta title /
  description saved on the course; category pages build theirs from the category name and summary.
  The canonical origin is `siteConfig.url` (`lib/config.ts`, override with `NEXT_PUBLIC_SITE_URL`).
- **`/robots.txt` and `/sitemap.xml`**: `app/robots.ts`, `app/sitemap.ts`. The sitemap is generated from
  the live catalogue (static pages, categories that have courses, active courses) and refreshes with the
  page cache.
- **Structured data**: `lib/schema.ts` builds the JSON-LD and `components/seo/json-ld.tsx` renders it:
  the academy (EducationalOrganization + LocalBusiness) on every page via `SiteChrome`, `WebSite` on the
  home page, `BreadcrumbList` from the `Breadcrumb` component, `Course` + `FAQPage` on course pages,
  `FAQPage` on `/faq`, `ItemList` on the course listings and `Person` on `/trainers`. It only states what
  the page shows: no prices, ratings, reviews or coordinates.
- **Course FAQs**: `features/courses/faqs.ts` (batch facts from the course record, plus per-course answers
  keyed by slug). The site-wide FAQs live in the database (admin console → FAQs).
- **Share image**: `public/images/og-default.jpg` (1200×630). **Verification**: set
  `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` at build time.
- **Not indexed**: 404s (automatic), categories without courses, and the syllabus PDF route
  (`X-Robots-Tag: noindex`). The admin console and the API send `noindex` headers of their own.
- `e2e/tests/client/seo.spec.ts` checks all of the above against a running site.

## Backend integration

All content is read through `features/<domain>/service.ts`, which call the REST API with
`cache: "no-store"` so every request reflects the latest admin edits (the whole site is
`force-dynamic`). Contact details, social links and page SEO meta come from the API's
`/settings` and `/pages` endpoints; `lib/config.ts` only keeps static fallbacks.
Enquiry forms submit through the `submitEnquiry` server action (`features/enquiry/actions.ts`),
which forwards to `POST /api/v1/enquiries` and maps API validation errors back onto the fields.
Pages resolve their data before streaming (no `loading.tsx`): unknown slugs return a real 404
status and the scroll-reveal motion system never touches nodes before React hydrates them.
