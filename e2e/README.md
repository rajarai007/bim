# BIM Career Academy — End-to-end tests

Playwright suite that drives the **client website** and the **admin console** in a real
browser and verifies every action against the API and the database.

| Project       | What it covers |
|---------------|----------------|
| `client`      | every public page (load, SEO head, images, console/network audit), navigation, breadcrumbs, footer, FAQ tabs/accordion, project filters, trainers, contact + course enquiry forms (validation, DB verification, failure/loading states), admin→client content sync, mobile layout, API outage error page |
| `admin-setup` | signs in once through the login form and stores the session cookie |
| `admin`       | auth (redirects, forged/expired cookies, remember-me, logout, forgot/reset password), dashboard, course list/editor (create → draft → publish → edit → delete, validation, featured), categories/trainers/testimonials/projects/FAQs dialogs, enquiries (filters, manage panel, notes, status, CSV export), settings/SEO/content, media library, profile + password, mobile drawer, API outage recovery |

Every test carries an **audit fixture** that fails the test on console errors/warnings,
uncaught exceptions, failed requests or 4xx/5xx responses that were not explicitly expected.

## Running

The suite runs against already-running servers (it does not start them):

```bash
# Backend — rate limiting must be off for the suite (login / enquiry limits are hit otherwise)
cd Backend && RATE_LIMIT_ENABLED=false npm run dev
cd Frontend/Client && npm run dev -- -p 3000
cd Frontend/Admin  && npm run dev -- -p 3001

cd e2e && npm install
npx playwright install chromium   # first time only
npm test                          # or: npm run test:client / npm run test:admin
npm run report                    # opens the HTML report
```

Targets can be overridden, e.g. to test production builds on other ports:

```bash
CLIENT_URL=http://localhost:3100 ADMIN_URL=http://localhost:3101 API_URL=http://localhost:4100 npm test
```

`ADMIN_EMAIL` / `ADMIN_PASSWORD` default to the seeded admin (`admin@bimcareeracademy.com` / `admin123`).

### API outage scenario

`tests/*/outage.spec.ts` stop and restart the backend process listening on `API_URL`
to verify the error pages and the "Try again" recovery. They are skipped unless
`E2E_API_CONTROL=1` is set (they need to control the API process on the same machine).

## Data

Tests create records with an `E2E` / `e2e-` prefix and delete them again; they share one
database, so the suite runs with a single worker. Re-running after an aborted run is safe.
