# Woozi E-commerce

A full-stack e-commerce app built with Next.js (App Router), TypeScript, Tailwind CSS, and MongoDB. Custom JWT authentication (email/password + Google/GitHub OAuth), a searchable/filterable product catalog, per-user product reviews with photo uploads, a cart, and checkout.

See [`docs/HOW_IT_WORKS.md`](docs/HOW_IT_WORKS.md) for how each feature works, and [`docs/PRE_BUILD_PLAN.md`](docs/PRE_BUILD_PLAN.md) for the database schemas and the full phased roadmap.

## Tech stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, React Toastify, next-themes (dark/light mode)
- **Backend**: Next.js API Routes, TypeScript, Zod validation
- **Database**: MongoDB + Mongoose
- **Auth**: Custom JWT (`jose`) + `bcryptjs`, hand-rolled OAuth2 for Google/GitHub
- **Media**: Cloudinary (signed direct-from-browser uploads)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   You'll need:
   - A MongoDB connection string (`MONGODB_URI`) — a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works fine, or a local `mongod`.
   - A random string for `JWT_SECRET` (session cookie signing).
   - Google OAuth credentials from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — set the authorized redirect URI to match `GOOGLE_REDIRECT_URI`.
   - GitHub OAuth credentials from [GitHub Developer Settings](https://github.com/settings/developers) — set the callback URL to match `GITHUB_REDIRECT_URI`.
   - Cloudinary credentials from your [Cloudinary dashboard](https://cloudinary.com/console) (used for review and product photo uploads).
   - A Brevo API key from your [Brevo account](https://app.brevo.com/settings/keys/api) (used to send the support contact form's emails), plus a sender address and the inbox you want those emails delivered to.

3. **Seed the product catalog** (optional, but the Dashboard is empty without it)

   ```bash
   npm run seed
   ```

   Inserts 25 dummy products with placeholder images across 5 categories. Safe to re-run — it clears existing products first.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **(Optional) Get access to `/admin`** — register a normal account through the app, then flip `isAdmin` to `true` on that user's document directly in MongoDB. There's no promotion UI by design.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run seed` | Reset and reseed the product catalog with dummy data |

## Project status

All 8 phases from `docs/PRE_BUILD_PLAN.md` are implemented: authentication (email/password + OAuth), the product catalog, the product detail page (reviews with photo uploads), user profile + saved addresses, cart, checkout/orders (Cash on Delivery only for now), an admin panel for product management, and a support/FAQ page. The first admin account has to be set manually (`isAdmin: true`) directly in MongoDB — there's no promotion UI. See [`docs/PROGRESS.md`](docs/PROGRESS.md) for verification notes and what (if anything) comes next.
