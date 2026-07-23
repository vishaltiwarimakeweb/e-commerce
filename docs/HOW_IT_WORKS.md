# How Woozi E-commerce Works

Woozi is a full-stack e-commerce app (Next.js App Router + TypeScript + MongoDB/Mongoose) with a public product catalog, custom JWT authentication, and per-user reviews. This doc explains each implemented feature and how a user interacts with it. See `docs/PRE_BUILD_PLAN.md` for the database schemas and phased roadmap.

## Authentication

Custom JWT auth, not a third-party auth library — everything under `src/lib/jwt.ts`, `src/lib/auth.ts`, and `src/app/api/auth/`.

- **Register/Sign in** (`/register`, `/sign-in`): email + password, or the Google/GitHub buttons.
- On success, the server signs a JWT (`{ sub: userId, isAdmin }`) and sets it as an `httpOnly`, `secure`, `sameSite=lax` cookie named `session`, valid 7 days.
- **OAuth**: clicking "Google" or "GitHub" redirects to `/api/auth/{google,github}`, which sends the browser to the provider with a random `state` value also stored in a short-lived cookie (CSRF protection). The provider redirects back to `/api/auth/{google,github}/callback`, which checks `state` matches, exchanges the code, fetches the provider profile, and finds-or-creates a `User` **by email** — so signing in with Google using an email you already registered with credentials logs you into that same account.
- The root layout (`src/app/layout.tsx`) reads the session cookie server-side on every request and seeds a client `AuthProvider` context, so both server-rendered pages and client components (Navbar, forms, review form) know whether you're signed in without an extra round-trip.
- The `Navbar` only renders its page links (Dashboard/Profile/My Orders/Cart) once signed in — logged-out visitors just see Sign in/Register. There's intentionally no sign-out button in the Navbar; per the product spec, sign-out only lives on the Profile page (Phase 3, not built yet).

## Dark/light mode

`next-themes` manages a `.dark` class on `<html>`, toggled by the sun/moon button next to the nav (`src/components/layout/ThemeToggle.tsx`). Defaults to the OS preference and persists the user's choice.

## Product catalog (Dashboard, `/`)

- The catalog is entirely driven by the URL's query string: `?q=`, `category=`, `minPrice=`/`maxPrice=` (dollars in the UI, stored/queried as integer cents), `tags=`, `sort=`, `page=`. That means every filtered/sorted/paginated view is a real, shareable, server-rendered URL — no client-side fetch/loading spinner needed.
- Typing in the search bar, picking a category chip, setting a price range, or changing sort order all just update the query string (`router.push`) and the page re-renders server-side with fresh data from `src/lib/products.ts`'s `getProducts()`.
- The same query logic backs `GET /api/products` for anything that needs it outside of SSR.
- Populate the catalog with `npm run seed` — inserts 25 dummy products (placeholder photos) across Electronics, Clothing, Home & Kitchen, Books, and Beauty. Safe to re-run; it clears existing products first.

## Product page (`/products/[id]`)

- Image gallery with thumbnail switching, price, star rating + review count, tags, full description.
- **Add to cart**: currently only handles the auth gate — signed-out users clicking it are redirected to `/sign-in`. The actual cart (adding items, quantities, etc.) is Phase 4 and isn't implemented yet; the button shows a "coming soon" toast for signed-in users in the meantime.
- **Reviews**: any signed-in user can leave a 1-5 star rating (required), an optional written review, and up to 5 photos. Submitting again as the same user **updates** that review in place rather than creating a second one (`Review` has a unique index on `{ product, user }`, and the API upserts against it). After every review write, `Product.ratingAverage`/`ratingCount` are recomputed and stored on the product itself, so the catalog and product page never have to aggregate reviews on read.
- **Review photo uploads**: the browser never sends image bytes to our server. It calls `POST /api/uploads/signature` (must be signed in) to get a short-lived signed Cloudinary upload payload, then uploads the file directly to Cloudinary from the browser and only sends the resulting `secure_url` back to us to save on the review.

## Environment variables

See `.env.example` for the full list with placeholder values — Mongo connection, JWT signing secret, Google/GitHub OAuth credentials + redirect URIs, and Cloudinary credentials. `.env.local` holds the real values and is never committed or read by the assistant.
