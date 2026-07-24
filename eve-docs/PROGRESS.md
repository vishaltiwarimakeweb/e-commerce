# Progress

## Status: All 5 phases of the ShopWise AI assistant implemented and verified.

Phases (per the roadmap agreed with the user):

1. Wire eve into the Next.js app.
2. `search_products` tool.
3. Chat widget UI (bottom-left, on every page).
4. Cross-device resume for signed-in users.
5. Rate limiting on the chat endpoint.

Committed on `feature/shopwise-chat-assistant` (branched off `fresh`). Commit `96cd570` covers Phases 1-3 (pushed by the assistant — no GitHub credentials in that shell, so it's local-only until you push). Commit `2bc7a27` ("Product Browser Bot") covers Phases 4-5 — that one was committed from your own machine/editor while this session was still running, so it isn't pushed either yet.

## What's done

### Phase 1 — eve wiring

- `next.config.ts`: wrapped with `withEve()` so `agent/` mounts under `/eve/v1/*` on the same Next.js origin (no CORS needed).
- `.env.example`: added `GROQ_API_KEY`.
- `agent/channels/eve.ts`: replaced the scaffolded `placeholderAuth()` with `none()` (kept `vercelOidc()`/`localDev()` ahead of it) — the widget is open to guests and signed-in users alike, per the user's call.
- `.gitignore` / `eslint.config.mjs`: added `.eve/` and `.output/` — eve's compiled/dev build artifacts (like `.next/`), never authored source. Without the eslint ignore, `npm run lint` was linting ~14k problems in generated/minified vendor code.

### Phase 2 — `search_products` tool (`agent/tools/search_products.ts`)

- Zod input: `{ query?, category?, minPrice?, maxPrice? }` (prices in USD — converted to integer cents before calling the existing `getProducts()` in `src/lib/products.ts`, and back to dollars in the returned data, since the model shouldn't reason in cents).
- Wraps `getProducts()` directly — no new query logic, no invented API.
- **Fixed along the way**: `src/models/Product.ts` imported `{ Schema, model, models }` as named exports from `mongoose` (a CommonJS package). That pattern works under Next.js's bundler but eve's own module runtime couldn't see those named exports (`eve info` failed discovery with "Named export 'models' not found"). Changed to `import mongoose from "mongoose"; const { Schema, model, models } = mongoose;` — equivalent under Next, and now resolves under both. Only `Product.ts` needed this (it's the only model the tool touches); the other 4 models still use the old style and are untouched.
- **Model swap**: `agent/agent.ts` was scaffolded with `groq("llama-3.3-70b-versatile")`. Empirically it failed to produce a valid tool call roughly 80% of the time ("Failed to call a function" / malformed follow-up calls). Swapped to `groq("openai/gpt-oss-20b")` (also Groq-hosted, purpose-built for tool use) — reliable across every retest afterward, including self-correcting a bad `category` casing on its own.
- Verified end-to-end against the real seeded MongoDB (Atlas) — correct structured results, correct empty-result handling, correct final model replies citing real titles/prices.

### Phase 3 — Chat widget (`src/components/chat/ChatWidget.tsx`)

- Bottom-left floating button + panel, mounted in `src/app/layout.tsx` (renders on every route, including auth pages, matching "visible on all pages").
- `useEveAgent()` from `eve/react`, default optimistic projection, composer disabled while `submitted`/`streaming`, "Thinking…" placeholder, smooth auto-scroll to the latest message on open and on new content.
- Verified live in a real headless-browser run: button renders bottom-left, opens/closes, optimistic user bubble, real streamed reply with correct product data rendered in the DOM, conversation persists across a full page reload, and the widget is present on other pages.

### Phase 4 — Cross-device resume (signed-in users only)

- `src/models/ChatSession.ts`: one document per user, `{ user (unique), sessionId, continuationToken }` + timestamps — a *pointer only*, no message content (per the architecture decision below).
- `src/lib/chatSession.ts` + `src/app/api/chat-session/route.ts` (`GET`/`PUT`, `requireUser()`-gated, same pattern as `/api/cart`).
- `src/lib/eveReplay.ts`: on a device with no local cache, uses the low-level `eve/client` (`Client.session(pointer).stream({ startIndex: 0 })`) to replay the full history from eve's own durable store, stopping at the first turn boundary (`isCurrentTurnBoundaryEvent`) — otherwise that stream stays open forever waiting for the next message.
- `ChatWidget.tsx` restructured: an outer gate resolves `initialEvents`/`initialSession` (local cache → else, if signed in, the server pointer + replay → else a fresh conversation) before mounting the actual `useEveAgent()` panel (its options are read once at creation, so this has to happen first). Shows a brief "Loading your conversation…" panel while resolving. `onFinish` now also `PUT`s the pointer to the server when signed in.
- localStorage key is now scoped per user (`woozi-shopwise-chat:<userId>`, `:guest` for signed-out) instead of one shared key — otherwise switching accounts on the same browser would leak the previous account's conversation into the new one.
- **Verified in two passes**, because a live end-to-end pass kept hitting Groq's free-tier TPM cap from the volume of manual testing today: (1) the API routes directly (`PUT`/`GET` round-trip real data), and (2) the full client mechanism using an already-completed session as a known-good pointer — manually seeded it for a fresh test account, opened the widget with empty `localStorage`, and confirmed the prior reply rendered (`replayChatSession` returned 53 events including the original `message.completed`, and it rendered correctly in the DOM).

### Phase 5 — Rate limiting

- Added `ioredis` as a real dependency (there was no existing Redis code in the app despite `.env.local` already having `REDIS_*` values from the deferred OTP feature — Phase 5 is the first thing that actually uses them). Added `REDIS_HOST`/`REDIS_PORT`/`REDIS_USERNAME`/`REDIS_PASSWORD` to `.env.example`.
- `src/lib/redis.ts`: cached client across hot-reloads, same pattern as `connectToDatabase()`.
- `src/lib/chatRateLimit.ts`: fixed window, `INCR` + `EXPIRE`, 10 messages / 60s per identifier. **Fails open** on a Redis error (logs it, allows the message) — a cache outage should degrade to "no rate limit," not "no chat."
- `agent/channels/eve.ts`: enforced via `onMessage`, which runs before every message (session create *and* follow-ups) reaches the model — so a throttled caller never costs a Groq call. Identifier is the caller's IP (`x-forwarded-for`), since the channel's route auth is intentionally anonymous (`none()`) and every anonymous caller shares one `principalId`, so that alone can't distinguish callers.
- **Known limitation**: throwing from `onMessage` always surfaces as a generic HTTP 500 `{"error":"onMessage handler failed."}` — eve doesn't pass a thrown message's text through, and there's no way to return a custom 429 from this hook. Verified the limit itself works (11th+ request in a rolling minute is rejected immediately, no model call happens), but the client can't distinguish "rate limited" from any other failure. Given that, `ChatWidget.tsx`'s error state was simplified to one generic, friendly message ("Something went wrong — please wait a moment and try again.") instead of surfacing the raw error text, which would otherwise occasionally show technical strings.

## Architecture decision carried over from the review

Per your answers before implementation: **no `Conversations`/`Messages` MongoDB collections** — eve's own durable session already stores and replays full message history; duplicating that in Mongo would be dead-weight state to keep in sync. Phase 4 added only the thin `ChatSession` pointer described above — no message mirroring.

## Known caveats to flag

- **Dev-mode-only quirk**: editing an `agent/` file (e.g. `agent.ts`, a tool, the channel) makes eve's dev server recompile a new "generation" of the bundle. Immediately after that, the shared `global.mongooseCache` pattern in `src/lib/db.ts` can briefly hand a query a connection that isn't actually live in the new generation, producing a `products.find() buffering timed out after 10000ms` error. A clean dev server restart (`Ctrl+C`, `npm run dev` again) after editing `agent/` files clears it. This did not reproduce in `eve build`'s single static bundle — it's specific to `eve dev`'s hot-reload cycle. Not source-fixed (would mean touching `src/lib/db.ts`, shared by the whole app) — flagging instead in case you want it addressed.
- **Groq free/on-demand tier rate limit**: `openai/gpt-oss-20b` hit its 8,000 TPM cap repeatedly during this session's testing. That's a provider-side limit, separate from (and not fixed by) the app's own per-IP rate limiter in Phase 5 — worth knowing if a demo stalls on "Thinking…" longer than expected.
- **Cosmetic, dev-only**: Next.js's dev-mode indicator badge (bottom-left) visually overlaps the widget's button in local dev. Doesn't exist in production. Not changed, since it's a dev-tooling default, not app code.
- A pre-existing third-party embed script (`zendesk-clone-04pw.onrender.com`, already in `layout.tsx` from before this work) also renders its own floating chat bubble, at bottom-right. Two chat bubbles are now on every page. Not touched (out of scope), just flagging the visual overlap.
- Model replies use markdown table syntax (`| Title | Price | ... |`) but the widget renders plain text, so tables show as raw pipe-delimited text rather than a formatted table. Cosmetic; would need a markdown renderer to fix — not done, to avoid adding a new dependency without asking first.
- Rate limit thresholds (10 msgs/60s per IP) are a reasonable starting default, not a number you specified — tune `MAX_MESSAGES_PER_WINDOW`/`WINDOW_SECONDS` in `src/lib/chatRateLimit.ts` if you want it stricter/looser.

## Next up

Nothing scheduled — the roadmap from the architecture review (5 phases) is complete. Possible future work, not yet requested:

- A friendlier rate-limit message (would need a custom channel or a different enforcement point than `onMessage`, since that hook can't return a custom error body/status).
- Markdown rendering for assistant replies.
- Revisit the two-floating-bubble overlap with the pre-existing support-widget embed.
