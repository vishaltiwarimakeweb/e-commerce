# Progress

## Status: Phases 0-5 implemented and committed. Not fully pushed — see gaps below.

Branches (stacked, each independently reviewable):

- `feature/authentication` off `main` — Phase 0 — **pushed**
- `feature/product-catalog` off `feature/authentication` — Phase 1 — **pushed**
- `feature/product-page` off `feature/product-catalog` — Phase 2 — **pushed**
- `feature/user-profile` off `feature/product-page` — Phase 3 — not pushed
- `feature/cart` off `feature/user-profile` — Phase 4 — not pushed
- `feature/orders` off `feature/cart` — Phase 5 (current HEAD) — not pushed

`main` only has the finalized `docs/PRE_BUILD_PLAN.md` on top of the original `create-next-app` scaffold — no app code has landed on `main` yet, it's all sitting on the stacked feature branches above, awaiting PR review/merge in order.

**A git remote (`origin`, github.com/vishaltiwarimakeweb/e-commerce) exists and the first three branches were pushed from the IDE.** The assistant's shell environment has no GitHub credentials, so `feature/user-profile`, `feature/cart`, and `feature/orders` (and any new commits on the already-pushed branches) need to be pushed manually — e.g. from VS Code's Source Control panel, or `git push -u origin <branch>` from a terminal that has your credentials.

## What's done

### Phase 0 — Authentication (`feature/authentication`)

- Mongoose connection singleton, `User`/`Product`/`Review` models per the schemas in `PRE_BUILD_PLAN.md`.
- Custom JWT session via `jose` (Edge + Node compatible), `bcryptjs` password hashing.
- Email/password register, login, logout, `/me`; hand-rolled OAuth2 for Google/GitHub (state-cookie CSRF protection, identity matched by email).
- Root layout resolves the session server-side; `Navbar` only shows page links once signed in — no sign-out button there (see Phase 3).

### Phase 1 — Product catalog (`feature/product-catalog`)

- `src/lib/products.ts` — shared `getProducts()` (text search, filters, sort, pagination) used by both the SSR Dashboard and `GET /api/products`.
- Dashboard driven entirely by URL query string — bookmarkable, server-rendered.
- `scripts/seed.ts` (`npm run seed`) — 25 dummy products, 5 categories, placeholder images.

### Phase 2 — Product page (`feature/product-page`)

- `GET /api/products/[id]`, `/api/products/[id]/reviews` (list + create-or-update, one review per user per product via unique index + upsert).
- `Product.ratingAverage`/`ratingCount` recomputed after every review write.
- Cloudinary signed-upload flow for review photos — file bytes never touch our server.

### Phase 3 — User profile (`feature/user-profile`)

- `src/middleware.ts` protects `/profile`, `/cart`, `/orders`, `/checkout` (redirects to `/sign-in?redirect=...`, honored by the sign-in form). Uses `jose` directly so it stays Edge-compatible — cookie constants were split into `src/lib/session-cookie.ts` so middleware doesn't pull in `lib/auth.ts`'s Mongoose dependency.
- `User.addresses` retyped as `Types.DocumentArray<Address>` (was a plain array, which doesn't expose `.id()`/`.pull()`).
- GET/PATCH `/api/profile`, full CRUD on `/api/profile/addresses`. Profile page: editable name/age/phone (email immutable), address manager, and the **only** Sign Out button in the app.

### Phase 4 — Cart (`feature/cart`)

- `Cart` model: `{ user, items: [{ product, quantity }] }` — no price/title snapshot, always read live from `Product` on every request.
- `GET /api/cart`, `POST /api/cart/items` (add/increment, clamped to stock), `PATCH`/`DELETE /api/cart/items/[productId]`.
- `CartProvider` (client context) drives a live item-count badge on the Navbar's Cart link, seeded server-side in the root layout.
- `AddToCartButton` on the product page now actually adds to cart (previously a Phase-2 placeholder toast).

### Phase 5 — Checkout & orders (`feature/orders`)

- `Order` model snapshots items (title/thumbnail/price/quantity) and the shipping address at checkout time — later edits to the catalog or saved addresses never rewrite a past order.
- `placeOrder()`: stock decremented per item via a guarded update (`stock >= quantity`), not a DB transaction (simpler, no replica-set requirement). If a later item's guard fails, earlier decrements in the same order are compensated back before the error is returned. **Verified against a simulated race** (forced a product's stock below the cart's requested quantity via a direct DB write): order correctly rejected, stock and cart both left untouched.
- Checkout only offers Cash on Delivery — "Online" stays a reserved schema field with no gateway wired up (per the Architecture Clarifications in `PRE_BUILD_PLAN.md`).
- Checkout page, My Orders list, order detail page (scoped to the requesting user — a stranger's order id 404s, doesn't leak).

## Verification performed this session

Every phase was checked with `tsc --noEmit` + `eslint` (zero errors) and then exercised against the real MongoDB via the running dev server — not just read over. Notable edge cases confirmed: duplicate email / wrong password / expired-or-missing JWT, OAuth state mismatch, malformed & out-of-range pagination, unauthenticated review POST (401) and same-user resubmission (updates in place, not a duplicate), cart quantity clamped to stock and zero-quantity removal, checkout with empty cart (redirects), checkout with insufficient stock (rejected, nothing mutated), and cross-user order access (404).

## Known gaps / things to flag to the user

- **3 branches need a manual push** (see remote note above) — `feature/user-profile`, `feature/cart`, `feature/orders`.
- A smoke-test user (`smoketest+phase0@example.com`) and a couple of reviews/orders exist in the real dev database from manual verification during this session — harmless, but `npm run seed` only resets `Product`, not `User`/`Review`/`Cart`/`Order`.
- An unexplained top-level `docs/` directory appeared mid-session (now the canonical location — see below) alongside a direct commit from the user ("Initial Commit" on `feature/product-page`) that relocated docs here and committed pre-existing `AGENTS.md`/`CLAUDE.md` edits. Content was verified identical (diffed byte-for-byte against what the assistant wrote) — no data loss, just relocated.
- **`docs/` (this location) is now canonical**, not `src/docs/` — the stale `src/docs/*` entries were removed from git in a follow-up commit on `feature/product-page`.

## Next up

- Phase 6: Admin panel (product CRUD, soft delete via `isActive`).
- Phase 7: Customer support / FAQ static page.
- Forgot-password OTP (Redis) — explicitly deferred, no phase number assigned yet.
- Order cancellation — explicitly out of scope per the Architecture Clarifications; revisit only if requested.
