# Progress

## Status: Phases 0-7 implemented and committed — the full roadmap from PRE_BUILD_PLAN.md is done. Not fully pushed — see gaps below.

Branches (stacked, each independently reviewable, in merge order):

1. `feature/authentication` off `main` — Phase 0 — **pushed**
2. `feature/product-catalog` off `feature/authentication` — Phase 1 — **pushed**
3. `feature/product-page` off `feature/product-catalog` — Phase 2 — **pushed**
4. `feature/user-profile` off `feature/product-page` — Phase 3 — not pushed
5. `feature/cart` off `feature/user-profile` — Phase 4 — not pushed
6. `feature/orders` off `feature/cart` — Phase 5 — not pushed
7. `feature/admin-panel` off `feature/orders` — Phase 6 + a script-tag fix (see below) — not pushed
8. `feature/support-page` off `feature/admin-panel` — Phase 7 (current HEAD) — not pushed

`main` only has the finalized `docs/PRE_BUILD_PLAN.md` on top of the original `create-next-app` scaffold — no app code has landed on `main` yet, it's all sitting on the stacked feature branches above, awaiting PR review/merge **in order** (each branch's diff only makes sense relative to the one before it).

**A git remote (`origin`, github.com/vishaltiwarimakeweb/e-commerce) exists and the first three branches were pushed from the IDE.** The assistant's shell environment has no GitHub credentials, so branches 4-8 (and any new commits on the already-pushed branches) need to be pushed manually — e.g. from VS Code's Source Control panel, or `git push -u origin <branch>` from a terminal that has your credentials.

## What's done

### Phase 0 — Authentication (`feature/authentication`)

Custom JWT (`jose`) + `bcryptjs`, email/password + hand-rolled Google/GitHub OAuth, `User`/`Product`/`Review` models, Navbar that only shows page links once signed in.

### Phase 1 — Product catalog (`feature/product-catalog`)

`getProducts()` (search/filter/sort/pagination) shared by the SSR Dashboard and `GET /api/products`, driven entirely by the URL query string. `scripts/seed.ts` for 25 dummy products.

### Phase 2 — Product page (`feature/product-page`)

Product detail, reviews (one per user per product, upserted), denormalized `ratingAverage`/`ratingCount`, Cloudinary signed direct-to-browser uploads for review photos.

### Phase 3 — User profile (`feature/user-profile`)

`src/middleware.ts` (Edge-compatible via `jose`) protected `/profile`, `/cart`, `/orders`, `/checkout`, `/admin`. Profile editing, address CRUD, the only Sign Out button in the app.

**Update (post ShopWise work, see `eve-docs/PROGRESS.md`)**: `src/middleware.ts` was removed — it was redundant with the per-page `getSessionUser()` checks that already existed on every one of those routes, and Next.js middleware always compiles to an Edge Function, which turned out to conflict with deploying the eve chat agent as a co-located Vercel service. Route protection now lives entirely in each page component.

### Phase 4 — Cart (`feature/cart`)

`Cart` model (`{ product, quantity }` only — price/title/stock always read live). Full add/update/remove API, live Navbar item-count badge.

### Phase 5 — Checkout & orders (`feature/orders`)

`Order` model snapshots items + address at checkout time. Stock decremented per item via a guarded update with compensation on failure (not a DB transaction — simpler, no replica-set requirement). Verified against a simulated race. COD only; "Online" stays a reserved unused field.

### Phase 6 — Admin panel (`feature/admin-panel`)

- `requireAdmin()` (403 for signed-in non-admins, distinct from `requireUser()`'s 401).
- `/api/uploads/signature` now takes `{ context: "review" | "product" }` — review uploads stay `requireUser()`, product uploads require `requireAdmin()`.
- Full product CRUD + soft delete/restore (`isActive` toggle) at `/api/admin/products*`; `/admin` page with inline add/edit form and multi-image upload.
- **First admin is a manual `isAdmin: true` DB edit** — no promotion UI, per your call on the bootstrap question. Admin link appears in the Navbar only when `isAdmin`.
- This branch also carries a one-off fix: a `<script>` tag for a support-widget embed (added directly to `layout.tsx` outside the assistant's actions, by you, mid-session) was moved from an invalid position (direct child of `<html>`) into a proper `next/script` call with `strategy="afterInteractive"`, in its own commit separate from the Phase 6 work.

### Phase 7 — Support / FAQ page (`feature/support-page`)

- `lib/brevo.ts` sends transactional email via Brevo's REST API (fetch, no SDK) — **verified end-to-end against your real Brevo account**, a test message was actually delivered to the configured support inbox during testing.
- `/support`: FAQ via native `<details>/<summary>` (no JS needed) + contact form (`POST /api/support/contact`, no DB collection, per spec). Accessible without signing in.
- Added a `Footer` (Support link) to the root layout — without it, `/support` had no discoverable entry point, since the Navbar only renders once signed in.

## Verification performed this session

Every phase was checked with `tsc --noEmit` + `eslint` (zero errors) and then exercised against the real MongoDB (and, for Phase 7, the real Brevo API) via the running dev server. Notable edge cases confirmed across all phases: auth failures (401/403/redirects) at every protected boundary, cross-user data isolation (order detail 404s for a non-owner), stock races on checkout, cart quantity clamping, soft-delete correctly hiding/restoring catalog visibility, and form validation on both client and server.

## Known gaps / things to flag to the user

- **5 branches need a manual push**: `feature/user-profile`, `feature/cart`, `feature/orders`, `feature/admin-panel`, `feature/support-page`.
- Test artifacts left in the real dev database from manual verification: `smoketest+phase0@example.com` (now promoted to `isAdmin: true` for Phase 6 testing — you may want to demote or delete it), `regular-user@example.com` (a plain non-admin test account), a "Test Widget Deluxe" product created via the admin panel test, and a few test orders/reviews. `npm run seed` only resets `Product` — everything else needs manual cleanup if you want a pristine dev DB.
- `docs/` (this location) is canonical, not `src/docs/` — see the "docs/ relocation" note from the Phase 3-5 update for how that happened.

## Next up

Nothing is scheduled — Phases 0-7 (the full roadmap) are done. Two things are explicitly deferred, not assigned a phase number:

- Forgot-password OTP (Redis) — marked "later phase" in the original spec, never scheduled.
- Order cancellation — not part of the original feature list (see Architecture Clarifications in `PRE_BUILD_PLAN.md`).

Anything beyond this (order cancellation, OTP, online payment gateway, admin order management, etc.) needs a new decision from you before it becomes a phase.
