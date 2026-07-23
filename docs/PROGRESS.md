# Progress

## Status: Phases 0-2 implemented, committed, not yet pushed (no git remote configured)

Branches (stacked, each independently reviewable):

- `feature/authentication` off `main` — Phase 0
- `feature/product-catalog` off `feature/authentication` — Phase 1
- `feature/product-page` off `feature/product-catalog` — Phase 2 (current HEAD)

`main` only has the finalized `docs/PRE_BUILD_PLAN.md` (schemas, phases, architecture clarifications) on top of the original `create-next-app` scaffold — no app code has landed on `main` yet, it's all sitting on the three feature branches above, awaiting PR review/merge.

**No git remote is configured on this repo** — branches are committed locally only. Before anything can be pushed/PR'd, run `git remote add origin <url>` with the actual GitHub repo.

## What's done

### Phase 0 — Authentication (`feature/authentication`)

- Mongoose connection singleton (`src/lib/db.ts`), `User`/`Product`/`Review` models per the schemas in `PRE_BUILD_PLAN.md`.
- Custom JWT session via `jose` (Edge + Node compatible) — `src/lib/jwt.ts`, `src/lib/auth.ts`. Cookie config exactly as specified in the plan doc.
- `bcryptjs` password hashing (`src/lib/password.ts`).
- Email/password register, login, logout, `/me` routes under `src/app/api/auth/`.
- Hand-rolled OAuth2 authorization-code flow for Google and GitHub (`src/lib/oauth/`), with a short-lived state cookie for CSRF protection. Identity matched by email — an OAuth login authenticates as an existing account with that email if one exists, otherwise creates one.
- Root layout resolves the session server-side and renders `ThemeProvider` (next-themes, manual dark/light toggle) + `ToastContainer` (react-toastify) + `AuthProvider` (client context) + `Navbar` (page links only show once signed in, per the spec; **no sign-out button in the Navbar** — that's reserved for the Profile page in Phase 3, which doesn't exist yet).
- Register/sign-in pages with credential forms and OAuth buttons.
- Verified end-to-end against the real MongoDB in `.env.local`: register, duplicate-email rejection (409), wrong-password rejection (401), login, `/me`, logout.

### Phase 1 — Product catalog (`feature/product-catalog`)

- `src/lib/products.ts` — shared `getProducts()` query (text search, category/price/tag filters, sort, offset pagination ~16/page) used by both the Dashboard SSR page and `GET /api/products`.
- Dashboard (`src/app/page.tsx`, replaces the starter content) — catalog grid driven entirely by the URL query string (`?q=&category=&minPrice=&maxPrice=&sort=&page=`), so results are bookmarkable and server-rendered.
- `scripts/seed.ts` (`npm run seed`) — 25 dummy products across 5 categories, placeholder images via picsum.photos (no real Cloudinary needed to have a populated catalog).
- Verified: search, category filter, sort, malformed/out-of-range pagination all behave correctly against real seeded data.

### Phase 2 — Product page (`feature/product-page`)

- `GET /api/products/[id]` (404s cleanly on a bad/missing id) and `/api/products/[id]/reviews` (GET list, POST create-or-update).
- One review per user per product enforced via a unique index + `findOneAndUpdate` upsert — resubmitting updates the same document instead of duplicating.
- `Product.ratingAverage`/`ratingCount` recomputed after every review write (`src/lib/reviews.ts`).
- Cloudinary signed-upload flow: `POST /api/uploads/signature` (auth required) returns a signature; the browser uploads the file straight to Cloudinary from there — file bytes never pass through our server.
- Product page: image gallery, star rating, tags, description, an `AddToCartButton` that only handles the auth gate for now (redirects signed-out users to sign-in; real cart logic is Phase 4), review form with up to 5 photo attachments.
- Verified end-to-end: submit a review, rating average/count update correctly, resubmitting the same user's review updates in place, unauthenticated POST returns 401.

## Known gaps / things to flag to the user

- **No git remote configured** — nothing has been pushed yet.
- A leftover smoke-test user (`smoketest+phase0@example.com`) and one review exist in the real dev database from manual testing during this session — harmless, but worth knowing it's there. `npm run seed` resets the Product collection but not Users/Reviews.
- `AGENTS.md` and `CLAUDE.md` show as modified in `git status` from _before_ this session started — not touched by this work, left alone per the mandatory "don't change CLAUDE.md" rule.

## Next up

- Phase 3: User profile + profile editing (including the addresses subdocument and the Sign Out button, which per the spec belongs only on this page).
- Phase 4: Cart management (the `AddToCartButton` placeholder gets wired up here).
- Phase 5: Order management.
- Phase 6: Admin panel (product CRUD).
- Phase 7: Customer support / FAQ static page.
- Forgot-password OTP (Redis) is explicitly deferred, not yet scheduled to a phase number.
