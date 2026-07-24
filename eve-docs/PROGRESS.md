# Progress

## Status: Phases 1-3 of the ShopWise AI assistant implemented and verified. Not committed/branched yet.

Phases (per the roadmap agreed with the user):

1. Wire eve into the Next.js app.
2. `search_products` tool.
3. Chat widget UI (bottom-left, on every page).

Phases 4 (cross-device resume for logged-in users) and 5 (rate limiting) are planned but not started — see "Next up".

## What's done

### Phase 1 — eve wiring

- `next.config.ts`: wrapped with `withEve()` so `agent/` mounts under `/eve/v1/*` on the same Next.js origin (no CORS needed).
- `.env.example`: added `GROQ_API_KEY`.
- `agent/channels/eve.ts`: replaced the scaffolded `placeholderAuth()` with `none()` (kept `vercelOidc()`/`localDev()` ahead of it) — the widget is open to guests and signed-in users alike, per the user's call. Rate limiting (Phase 5) is the intended abuse guard, not route auth.
- `.gitignore` / `eslint.config.mjs`: added `.eve/` and `.output/` — eve's compiled/dev build artifacts (like `.next/`), never authored source. Without the eslint ignore, `npm run lint` was linting ~14k problems in generated/minified vendor code.

### Phase 2 — `search_products` tool (`agent/tools/search_products.ts`)

- Zod input: `{ query?, category?, minPrice?, maxPrice? }` (prices in USD — converted to integer cents before calling the existing `getProducts()` in `src/lib/products.ts`, and back to dollars in the returned data, since the model shouldn't reason in cents).
- Wraps `getProducts()` directly — no new query logic, no invented API.
- **Fixed along the way**: `src/models/Product.ts` imported `{ Schema, model, models }` as named exports from `mongoose` (a CommonJS package). That pattern works under Next.js's bundler but eve's own module runtime couldn't see those named exports (`eve info` failed discovery with "Named export 'models' not found"). Changed to `import mongoose from "mongoose"; const { Schema, model, models } = mongoose;` — equivalent under Next, and now resolves under both. Only `Product.ts` needed this (it's the only model the tool touches); the other 4 models still use the old style and are untouched.
- **Model swap**: `agent/agent.ts` was scaffolded with `groq("llama-3.3-70b-versatile")`. Empirically it failed to produce a valid tool call roughly 80% of the time ("Failed to call a function" / malformed follow-up calls) — reproducible over ~6 attempts. Swapped to `groq("openai/gpt-oss-20b")` (also Groq-hosted, purpose-built for tool use) — 100% reliable across every retest afterward, including self-correcting a bad `category` casing on its own. Flagging this since it's a real behavior change from what was scaffolded, not just wiring.
- Verified end-to-end against the real seeded MongoDB (Atlas) — correct structured results, correct empty-result handling, correct final model replies citing real titles/prices.

### Phase 3 — Chat widget (`src/components/chat/ChatWidget.tsx`)

- Bottom-left floating button + panel, mounted in `src/app/layout.tsx` (renders on every route, including auth pages, matching "visible on all pages").
- `useEveAgent()` from `eve/react`, default optimistic projection, composer disabled while `submitted`/`streaming`, "Thinking…" placeholder, smooth auto-scroll to the latest message on open and on new content.
- Session persistence: only the lightweight cursor (`sessionId`/`continuationToken`/`streamIndex`) + rendered event log in `localStorage` (key `woozi-shopwise-chat`) — per eve's own documented pattern. No new MongoDB collection for this (see the "Conversations/Messages" note below).
- Verified live in a real headless-browser run (Playwright, installed temporarily for this — not a project dependency, removed after): button renders bottom-left, opens/closes, optimistic user bubble, real streamed reply with correct product data rendered in the DOM, conversation persists across a full page reload, and the widget is present on other pages (`/support` checked).

## Architecture decision carried over from the review

Per your answers before implementation: **no `Conversations`/`Messages` MongoDB collections** — eve's own durable session already stores and replays full message history; duplicating that in Mongo would be dead-weight state to keep in sync. Phase 4 (not yet built) will add a *thin* `ChatSession` pointer (`{ user, sessionId, continuationToken, updatedAt }`) so a logged-in user's chat can resume across devices — no message mirroring.

## Known caveats to flag

- **Dev-mode-only quirk**: editing an `agent/` file (e.g. `agent.ts`, a tool) makes eve's dev server recompile a new "generation" of the bundle. Immediately after that, the shared `global.mongooseCache` pattern in `src/lib/db.ts` can briefly hand a query a connection that isn't actually live in the new generation, producing a `products.find() buffering timed out after 10000ms` error. A clean dev server restart (`Ctrl+C`, `npm run dev` again) after editing `agent/` files clears it. This did not reproduce in `eve build`'s single static bundle — it's specific to `eve dev`'s hot-reload cycle. Did not attempt a source fix (would mean touching `src/lib/db.ts`, shared by the whole app) — flagging instead in case you want it addressed.
- **Groq free/on-demand tier rate limit**: `openai/gpt-oss-20b` hit an 8,000 TPM cap during my rapid manual testing. Real (if rare) concern once more than one person uses the widget concurrently — another reason Phase 5 (rate limiting) matters.
- **Cosmetic, dev-only**: Next.js's dev-mode indicator badge (bottom-left) visually overlaps the widget's button in local dev. Doesn't exist in production. Not changed, since it's a dev-tooling default, not app code — mention if you'd like `devIndicators.position` moved.
- A pre-existing third-party embed script (`zendesk-clone-04pw.onrender.com`, already in `layout.tsx` from before this session) also renders its own floating chat bubble, at bottom-right. Two chat bubbles are now on every page. Not touched (out of scope), just flagging the visual overlap.
- Model replies use markdown table syntax (`| Title | Price | ... |`) but the widget renders plain text, so tables show as raw pipe-delimited text rather than a formatted table. Cosmetic; would need a markdown renderer to fix — not done, to avoid adding a new dependency without asking first.

## Next up

- Nothing committed to a branch yet — these changes are sitting on the working tree on the `fresh` branch. Per your branching convention, this should become its own feature branch before PR review.
- Phase 4: thin `ChatSession` pointer collection for cross-device resume (logged-in users only).
- Phase 5: rate limiting on the chat endpoint (reuse the existing Redis instance already used for OTP).
