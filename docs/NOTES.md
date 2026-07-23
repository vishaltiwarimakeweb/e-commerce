<!-- To keep track of what mistakes did the AI coding assistant made throughout the project and what prompts I provided everytime -->

# First Prompt :

- Read CLAUDE.md and docs/PRE_BUILD_PLAN.md before doing anything else. We are building this application incrementally. Do not generate the entire application.1. Read and understand the project requirements.2. Review the architecture described in docs/PRE_BUILD_PLAN.md. 3. Point out any inconsistencies, missing requirements, or architectural concerns. 4. Suggest improvements, but do not implement anything yet. 5. Once the architecture is finalized, propose a development roadmap divided into small phases, where each phase is independently testable and deployable.

# Base Prompt :

- Before making any changes:

0. Check docs/PROGRESS.md.
1. Read CLAUDE.md.
2. Read docs/PRE_BUILD_PLAN.md.
3. Follow those documents throughout this session unless I explicitly tell you otherwise.

Acknowledge once you've finished reading them, check PROGRESS.md and continue building. Implement 3 phases at a time.

# Build session: Phases 0-5 (Auth, Catalog, Product page, Profile, Cart, Orders)

Mistakes caught and fixed during implementation:

- **Mongoose 9.x renamed `FilterQuery` to `QueryFilter`.** `src/lib/products.ts` initially imported `FilterQuery` from `mongoose` (the name used in older Mongoose versions/most tutorials) and failed to type-check. Fixed by importing `QueryFilter` instead — this version of Mongoose no longer exports the old name.
- **`User.addresses` needed to be typed as `Types.DocumentArray<Address>`, not a plain `Address[]`.** Phase 0 declared it as a plain array interface, which compiled fine until Phase 3 tried to call `.id()`/`.pull()` on it for address CRUD — those are DocumentArray-only methods. Fixed the model's type once other code started depending on the richer behavior.
- **A Navbar sign-out button was added in Phase 0, then removed.** CLAUDE.md's Profile feature explicitly says "Sign Out button exists on the profile page only" — caught this on a re-read of the doc before committing and removed it from the Navbar (the Profile page with the real sign-out button didn't exist until Phase 3, so there was a stretch with no sign-out UI at all — expected for an incremental build).
- **Mid-session, the user made direct git/filesystem changes outside the assistant's actions**: added a git remote, pushed `feature/authentication`/`feature/product-catalog`/`feature/product-page`, and committed ("Initial Commit" on `feature/product-page`) a relocation of the docs folder from `src/docs/` to root-level `docs/`, plus pre-existing uncommitted `AGENTS.md`/`CLAUDE.md` edits that had been sitting dirty since before the session started. The assistant diffed the moved files against what it had written to confirm no content was lost, then cleaned up the now-stale `src/docs/*` git index entries in a follow-up commit. `docs/` (root) is the canonical location going forward.

No functional bugs reached the user — everything above was caught by `tsc`/`eslint` or a doc re-read before commit, and every phase was additionally exercised against the real database (not just read over) before being committed.
