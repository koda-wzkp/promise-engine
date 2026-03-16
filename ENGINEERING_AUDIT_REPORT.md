# Engineering Audit Report — Promise Engine

**Date:** 2026-03-16
**Auditor:** Claude Code (Opus 4.6)
**Scope:** Full repository — backend, frontend, promise-pipeline, promise-garden, studio

---

## Architecture Overview

The repository contains **five distinct sub-projects** in a monorepo structure:

| Sub-project | Stack | Pages | Components | Purpose |
|---|---|---|---|---|
| `backend/` | Python/Flask/SQLAlchemy/PostgreSQL | — | — | API server, Promise Engine kernel |
| `frontend/` | React 18 (CRA), JavaScript | 8 | 2 | Legacy frontend (dashboard demos) |
| `promise-pipeline/` | Next.js 14, TypeScript, Tailwind | 14 | 37 | Main website + simulation engine |
| `promise-garden/` | Next.js 14, TypeScript, Tailwind, Capacitor | 10 | 13 | Personal promise tracker (mobile-ready) |
| `studio/` | Sanity v5 | — | — | CMS for blog content |

**Total source files:** ~150 TypeScript/JavaScript + ~30 Python files
**Type definition files:** 9 (5 in pipeline, 4 in garden)

### Dependency Graph Between Modules

```
backend/           ← standalone API (Flask + PostgreSQL)
frontend/          ← standalone CRA app (proxies to backend)
promise-pipeline/  ← standalone Next.js app (Sanity CMS, no backend dependency for core features)
promise-garden/    ← standalone Next.js app (Supabase backend, no shared code with pipeline)
studio/            ← standalone Sanity Studio
```

**Critical observation:** There is **zero shared code** between promise-pipeline and promise-garden despite overlapping domain types (Promise, PromiseStatus, simulation logic). The cascade simulator and scoring logic are duplicated across both. The backend's Promise Engine kernel is not consumed by either frontend — the pipeline uses client-side-only data, and the garden uses Supabase directly.

### Dead Code Assessment

- `frontend/` appears to be the **legacy app**, partially superseded by `promise-pipeline/`. Both have dashboard pages for HB2021, AI, Infrastructure, and Supply Chain demos.
- `promise-pipeline/lib/rendering/` (canopy.ts, noise.ts, strata.ts, watershed.ts) — procedural rendering code, likely used by ProceduralGraph but should be verified.
- `promise-pipeline/sanity/` + `studio/` — two separate Sanity configurations exist. The `studio/` directory has its own `package.json` with Sanity v5, while `promise-pipeline/sanity/` uses Sanity v3 via `next-sanity`. These may conflict.
- `analysis/percolation.py` at the repo root — standalone Python script, not imported by anything.
- `content/*.md` — editorial markdown files, presumably imported via Sanity.

---

## Type Safety Score

### TypeScript Configuration

Both `promise-pipeline` and `promise-garden` have **`strict: true`** in tsconfig.json. This is good.

### `any` Type Usage

**Total `any` occurrences: 30 across 14 files**

| Category | Count | Files |
|---|---|---|
| Annotation pipeline API routes | 15 | `app/api/annotate/save/route.ts`, `app/api/annotate/extract/route.ts` |
| Sanity/CMS integration | 3 | `sanity/lib/image.ts`, `sanity/schemas/post.ts`, `scripts/import-content.ts` |
| Blog pages | 3 | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` |
| Recharts formatter callbacks | 2 | `TrajectoryTab.tsx`, `ReliabilityScore.tsx` |
| Other (data/types) | 7 | Various |

**Zero `@ts-ignore` or `@ts-nocheck` directives.** This is excellent.

**Type assertions (`as X`): 62 occurrences across 32 files.** Most are legitimate (e.g., `as PromiseFactory`, `as const`). The Supabase queries file (`promise-garden/lib/supabase/queries.ts`) has 16 assertions — the highest concentration — which suggests the Supabase client types don't align cleanly with the domain types.

### Where Types Are Lying

1. **`promise-pipeline/app/api/annotate/save/route.ts`** — 9 `any` types in a single file. The annotation save logic is essentially untyped. This is the weakest type safety in the codebase.
2. **`promise-garden/lib/supabase/queries.ts`** — Heavy assertion usage suggests the Supabase row types don't match the app's domain types. Runtime mismatches are possible.
3. **Recharts `formatter` callbacks** typed as `any` — minor issue, Recharts typing is notoriously weak.

### Function Return Types

Most functions in the core simulation and analysis modules have **explicit return types**. Components rely on **inferred return types** (standard React practice). The backend Python code uses **type annotations inconsistently** — engine.py and models.py are well-annotated, but API routes use untyped `data` dicts from `request.get_json()`.

**Type Safety Score: 7.5/10** — Strict mode enabled, zero ts-ignore, but annotation pipeline and Supabase integration are type-weak zones.

---

## Data Integrity

### Data File Assessment

| File | Lines | Conforms to Types | Dependencies Valid |
|---|---|---|---|
| `hb2021.ts` | 655 | Yes | Yes — `depends_on` references verified |
| `jcpoa.ts` | 576 | Yes | Yes |
| `jcpoa-timeline.ts` | 175 | Yes | N/A (timeline entries) |
| `ai-demo.ts` | 114 | Yes | Yes |
| `infra-demo.ts` | 112 | Yes | Yes |
| `supply-chain-demo.ts` | 122 | Yes | Yes |

**Verification fields:** Consistently populated across all data files. Every promise has a `verification` object with a `method` field. HB2021 data includes cryptographic `commitment` hashes on 8+ promises — the richest verification data.

**Orphan promises:** All demo datasets have connected dependency graphs. No orphan nodes detected in HB2021 (the largest/most complex dataset).

**Data quality:** High. The datasets are hand-curated, well-structured, and consistent with the type definitions. The HB2021 data is the gold standard — domain-accurate, properly sourced, with verification commitments.

**Bundle size concern:** `hb2021.ts` (655 lines) and `jcpoa.ts` (576 lines) are shipped to the client. Not a problem at current scale, but these will need API-fetching if the promise count grows to hundreds.

---

## Component Quality

### Size Distribution

**God components (>200 lines):**

| Component | Lines | Issue |
|---|---|---|
| `frontend/pages/HB2021Dashboard.jsx` | 568 | Monolithic — data, layout, state all in one |
| `frontend/pages/LandingPage.jsx` | 494 | Monolithic |
| `frontend/pages/AIDemoDashboard.jsx` | 490 | Monolithic |
| `frontend/pages/SupplyChainDemoDashboard.jsx` | 479 | Monolithic |
| `frontend/pages/InfraDemoDashboard.jsx` | 455 | Monolithic |
| `promise-garden/components/creation/PromiseForm.tsx` | 490 | Complex form, but should be split |
| `promise-pipeline/components/network/PromiseGraph.tsx` | 435 | Canvas rendering + state |
| `promise-garden/components/garden/GardenView.tsx` | 419 | Canvas + UI overlay |
| `promise-pipeline/components/dashboard/SummaryTab.tsx` | 379 | Dense but acceptable |
| `promise-pipeline/components/network/ProceduralGraph.tsx` | 301 | Procedural rendering |
| `promise-pipeline/components/simulation/CascadeResults.tsx` | 300 | Data-dense display |

The **legacy frontend** (`frontend/`) has the worst component architecture — every page is a monolith. The **promise-pipeline** components are better factored, mostly under 200 lines. The **promise-garden** has a few oversized components.

### Props Typing

- **promise-pipeline/**: All components have typed props via TypeScript interfaces. Good.
- **promise-garden/**: All components have typed props. Good.
- **frontend/**: JavaScript — no prop types at all. No PropTypes either. Bad.

### Error Boundaries

**None.** Zero `ErrorBoundary` components anywhere in the codebase. Zero `error.tsx` files for Next.js route-level error handling. Zero `loading.tsx` files for suspense boundaries.

This is a significant gap. Any runtime error in rendering will crash the entire app to a white screen.

### Loading States

No centralized loading pattern. Some components handle loading inline with conditional rendering, but there's no consistent `<Skeleton>` or `<Loading>` component.

### Accessibility

**ARIA usage:** 89 occurrences of `aria-` or `role=` across 27 component files. The promise-garden's `AccessibleGardenDOM.tsx` component is specifically dedicated to accessibility — providing DOM-based descriptions of the canvas-rendered garden. This is thoughtful.

**Gaps:**
- No skip link in any layout
- No focus indicators beyond browser defaults
- Canvas-rendered content (ProceduralGraph, GardenCanvas) needs better keyboard alternatives
- No `<main>` landmark in the legacy frontend
- Color contrast: Status colors (e.g., `verified: #1a5f4a` on white) pass WCAG AA. The garden earth tones (`#8B7355`) may fail on some backgrounds.

---

## API Route Quality

### Backend (Flask)

**Input validation:** Present on all routes. Required fields are checked, agent types are validated, timestamps are parsed with error handling. The `verify_promise` endpoint validates schema_id, promiser, promisee, and input_context.

**Error handling:** Structured JSON errors using `ValidationError` and `BusinessRuleViolation` exception classes, caught by global error handlers in `__init__.py`. However, **every route wraps its body in a broad `except Exception as e`** that returns `str(e)` — this can leak internal error details to clients in production.

**Security concerns:**
1. **No rate limiting** on any endpoint, including `/register` and `/login`. Brute-force attacks are possible.
2. **No password complexity validation.** The register endpoint accepts any password.
3. **No CSRF protection.** JWT mitigates this partially but not completely for browser-based clients.
4. **Training data export (`/export`)** has no authentication requirement — the code doesn't check for auth tokens. If this endpoint is reachable publicly, all training data is exposed.
5. **`start.sh` runs `pip install` at deploy time** — this is a security and reliability risk. Dependencies should be installed during the Docker build, not at startup.
6. **CORS origins default to `*`** if `CORS_ORIGINS` config is not set (`__init__.py:35`).

**Database sessions:** Context managers (`with get_db() as db:`) are used consistently. The `auth.py` register route does a manual `db.commit()` inside `get_db()` (which is read-only context manager) instead of using `transaction()` — this works but breaks the documented pattern.

### Frontend API Routes (Next.js)

**promise-pipeline API routes:**
- `/api/simulate` — cascade simulation
- `/api/hb2021` — HB2021 data endpoint
- `/api/beta` — beta signup
- `/api/annotate/extract` — Claude API integration for promise extraction
- `/api/annotate/save` — save annotations to filesystem

**Issues:**
1. **`/api/annotate/save/route.ts`** writes directly to the filesystem using `fs.writeFileSync`. This works in development but **will fail on serverless (Vercel)** — the filesystem is read-only and ephemeral.
2. **`/api/annotate/extract/route.ts`** calls the Anthropic API. The API key is read from `process.env.ANTHROPIC_API_KEY` server-side, which is correct. No input sanitization on the bill text sent to Claude.
3. **No rate limiting** on any Next.js API route.
4. **No input validation middleware** — each route does its own ad-hoc validation.

**promise-garden API routes:**
- `/api/check-in` and `/api/garden` — proxy to Supabase

---

## Test Coverage

### Backend Tests

**Files:** 5 test files with comprehensive coverage

| Test File | Tests | What's Covered |
|---|---|---|
| `test_core_features.py` | ~40 tests | Export, trust capital, recovery, events, overdue, vouching, versioning |
| `hb2021/test_promise_theory.py` | ~40 tests | Promise Theory axioms (autonomy, voluntary, observable, idempotent, composable, falsifiable) |
| `hb2021/test_api.py` | Unknown | API endpoint tests |
| `hb2021/test_security.py` | Unknown | Security tests |
| `conftest.py` | Fixtures | SQLite in-memory test DB |

**Quality:** Excellent. The Promise Theory tests are genuinely rigorous — they test mathematical properties (monotonicity, idempotency, boundary conditions) not just happy paths. The trust capital tests verify stakes-weighted scoring. The recovery tests check state machine transitions. The versioning tests verify schema immutability semantics.

### Frontend Tests (promise-pipeline)

**Files:** 2 test files

| Test File | Tests | What's Covered |
|---|---|---|
| `formal-foundations.test.ts` | ~25 assertions | Verification hashes, network entropy, betweenness centrality, Little's Law |
| `jcpoa-foundations.test.ts` | Unknown | JCPOA-specific tests |

**Quality:** Good but uses a custom test runner (`assert()` function with manual counters) instead of a proper test framework (Jest/Vitest). No CI integration for frontend tests — the CI pipeline only runs backend pytest and a frontend build check.

### What's NOT Tested

1. **Cascade simulator** — no dedicated test for `simulateCascade()`. The formal-foundations test covers entropy and betweenness but not the BFS propagation logic itself.
2. **React components** — zero component tests. No React Testing Library or similar.
3. **promise-garden** — zero tests.
4. **API route integration tests** — Next.js API routes are untested.
5. **Edge cases in cascade:** empty network, single node, circular dependencies, self-referencing promises.
6. **The legacy frontend** — zero tests (no test infrastructure).

**Test Coverage Estimate:**
- Backend core logic: ~80%
- Frontend simulation/analysis: ~40%
- React components: 0%
- Promise Garden: 0%
- Integration/E2E: 0%

---

## Performance Concerns

1. **`calculateNetworkHealth` in cascade.ts** calls `identifyBottlenecks` which iterates all promises. `calculateNetworkEntropy` also iterates all promises. For the current dataset sizes (15-30 promises), this is fine. For 1000+ promises, the cascade simulation could become slow since it also builds a reverse adjacency map on every call.

2. **`calculateBetweenness` in graph.ts** runs all-pairs shortest paths — O(V * (V + E)). At 30 nodes this is instant; at 1000 nodes it will be noticeable.

3. **Promise lookups in cascade.ts** use `promises.find()` (O(n)) in several places (lines 39, 43, 321). These should use the `promiseMap` that's already built on line 92.

4. **Canvas rendering** in ProceduralGraph.tsx and GardenCanvas.tsx re-renders the full canvas on state changes. No dirty-region optimization.

5. **No `useMemo`/`useCallback`** on computed values passed to Recharts components in dashboard tabs. Each re-render recalculates chart data.

6. **No image optimization.** The promise-pipeline uses custom fonts (IBM Plex) loaded via CSS — no `next/font` optimization. No `next/image` usage detected.

---

## Accessibility Gaps

| WCAG Criterion | Status | Notes |
|---|---|---|
| Color contrast (AA) | Partial | Status colors pass, garden earth tones borderline |
| Semantic HTML | Partial | Pipeline uses semantic elements; legacy frontend uses `<div>` soup |
| ARIA attributes | Present | 89 occurrences, concentrated in garden and pipeline |
| Keyboard navigation | Missing | Canvas-based views (graph, garden) are mouse-only |
| Skip link | Missing | No skip-to-content link in any app |
| Focus indicators | Default | Browser defaults only, no custom focus styles |
| Error announcements | Missing | No `aria-live` regions for dynamic content |
| AccessibleGardenDOM | Present | Dedicated a11y component for garden canvas — excellent pattern |

---

## Dead Code & Unused Dependencies

### Potentially Unused Files

1. **`analysis/percolation.py`** — standalone script at repo root, not imported by anything
2. **`frontend/`** — entire legacy CRA app may be superseded by promise-pipeline
3. **`promise-pipeline/lib/rendering/`** — 4 files (canopy, noise, strata, watershed) — check if used by ProceduralGraph
4. **`studio/`** vs `promise-pipeline/sanity/` — dual Sanity configurations

### Potentially Unused npm Dependencies

**promise-pipeline:**
- `styled-components` — listed in deps but Tailwind is the primary styling system. Check if any component uses it.
- `react-is` — unusual direct dependency, typically a transitive dep

**promise-garden:**
- `@capacitor/push-notifications` — configured but no push notification logic visible in the app code

**frontend:**
- No unused deps detected — minimal dependency set

### TODO/FIXME Comments

Only **1 TODO** found in the entire codebase:
```python
# backend/app/promise_engine/core/models.py:150
promise_version=1,  # TODO: Get from schema registry
```

This is remarkably clean.

---

## Prioritized Fix List

### CRITICAL (blocks production quality)

**1. No error boundaries or error.tsx files anywhere**
- **Where:** All three frontend apps
- **Problem:** Any React rendering error crashes the entire app to a white screen
- **Fix:** Add `error.tsx` to each route segment in promise-pipeline and promise-garden. Add a root-level `ErrorBoundary` wrapper component.
- **Effort:** 1 hour

**2. Training data export endpoint has no authentication**
- **Where:** `backend/app/api/promise.py` — `/export` and `/export/stats` routes
- **Problem:** Anyone can export all training data without auth
- **Fix:** Add `@require_auth` decorator or check Authorization header
- **Effort:** 15 minutes

**3. `/api/annotate/save` writes to filesystem — will fail on Vercel**
- **Where:** `promise-pipeline/app/api/annotate/save/route.ts`
- **Problem:** `fs.writeFileSync` on serverless = data loss. Every annotation save is silently lost on redeploy.
- **Fix:** Move storage to Supabase, a database, or an object store
- **Effort:** Half-day

**4. Broad `except Exception` in backend API routes leaks internal errors**
- **Where:** `backend/app/api/promise.py` — every route handler
- **Problem:** `return jsonify({"error": str(e)})` can expose stack traces, DB connection strings, etc. to clients
- **Fix:** Log the full error server-side, return generic error to client. The global 500 handler already does this — remove the per-route try/except blocks and let errors propagate.
- **Effort:** 30 minutes

### HIGH (degrades quality significantly)

**5. No rate limiting on auth endpoints**
- **Where:** `backend/app/api/auth.py` — `/login`, `/register`
- **Problem:** Brute-force credential attacks are possible
- **Fix:** Add Flask-Limiter with rate limits (e.g., 5 login attempts/minute per IP)
- **Effort:** 1 hour

**6. Zero frontend tests**
- **Where:** All three frontend apps
- **Problem:** No confidence that UI changes don't break existing functionality
- **Fix:** Add Vitest + React Testing Library. Start with cascade simulator tests and critical component tests.
- **Effort:** Half-day for infrastructure + first tests

**7. Cascade simulator not directly tested**
- **Where:** `promise-pipeline/lib/simulation/cascade.ts`
- **Problem:** The core BFS propagation logic has no tests. Edge cases (empty network, single node, circular deps) are untested.
- **Fix:** Add test suite for `simulateCascade()` with known inputs and expected outputs
- **Effort:** 2 hours

**8. No CI for frontend TypeScript or tests**
- **Where:** `.github/workflows/ci.yml`
- **Problem:** CI only checks frontend build (`npm run build`), not TypeScript strict checking or lint. No test step for pipeline tests.
- **Fix:** Add `npx tsc --noEmit`, `npm run lint`, and test commands to CI for promise-pipeline and promise-garden
- **Effort:** 30 minutes

**9. Duplicated simulation logic between promise-pipeline and promise-garden**
- **Where:** `promise-pipeline/lib/simulation/` and `promise-garden/lib/simulation/`
- **Problem:** Cascade and scoring logic exists in both apps. Bug fixes must be applied twice.
- **Fix:** Extract shared library (npm workspace or shared directory with path aliases)
- **Effort:** Half-day

### MEDIUM (should fix but not blocking)

**10. Legacy frontend has monolithic components (400-568 lines each)**
- **Where:** `frontend/src/pages/*.jsx`
- **Problem:** Impossible to test, reason about, or reuse
- **Fix:** If frontend/ is still in production, decompose into smaller components. If superseded by promise-pipeline, deprecate.
- **Effort:** 1 day (if needed)

**11. CORS defaults to wildcard `*`**
- **Where:** `backend/app/__init__.py:35`
- **Problem:** If `CORS_ORIGINS` env var is not set, all origins are allowed
- **Fix:** Default to an empty list or raise an error if not configured
- **Effort:** 15 minutes

**12. `start.sh` runs `pip install` at startup**
- **Where:** `backend/start.sh`
- **Problem:** Installs dependencies at container start instead of build time. Slower startup, potential for different versions.
- **Fix:** Remove `pip install` from start.sh — it's already in the Dockerfile
- **Effort:** 5 minutes

**13. Auth register uses `get_db()` (read-only) but does `db.commit()`**
- **Where:** `backend/app/api/auth.py:31-53`
- **Problem:** `get_db()` is documented as read-only; `transaction()` should be used for writes
- **Fix:** Change `with get_db() as db:` to `with transaction() as db:` and remove manual `db.commit()`
- **Effort:** 15 minutes

**14. No password complexity validation**
- **Where:** `backend/app/api/auth.py:28`
- **Problem:** Accepts any password, including empty-after-whitespace strings
- **Fix:** Add minimum length (8+), check for non-empty after strip
- **Effort:** 15 minutes

**15. Recharts formatter typed as `any`**
- **Where:** `TrajectoryTab.tsx:56`, `ReliabilityScore.tsx:69`
- **Problem:** Minor type safety gap
- **Fix:** Type the formatter parameter as `number`
- **Effort:** 5 minutes

### LOW (nice to have)

**16. No `next/font` optimization**
- **Where:** `promise-pipeline/app/layout.tsx`, `promise-garden/app/layout.tsx`
- **Problem:** IBM Plex fonts likely loaded via external CSS, not optimized
- **Fix:** Use `next/font/google` for automatic font optimization
- **Effort:** 15 minutes

**17. No `next/image` usage**
- **Where:** Both Next.js apps
- **Problem:** Any images are unoptimized
- **Fix:** Replace `<img>` with `<Image>` where applicable
- **Effort:** 30 minutes

**18. Custom test runner in formal-foundations.test.ts**
- **Where:** `promise-pipeline/lib/__tests__/formal-foundations.test.ts`
- **Problem:** Manual `assert()` with counter instead of proper test framework
- **Fix:** Migrate to Vitest with proper `describe/it/expect`
- **Effort:** 1 hour

**19. Promise version hardcoded to 1**
- **Where:** `backend/app/promise_engine/core/models.py:150`
- **Problem:** The only TODO in the codebase — version is always 1
- **Fix:** Look up current version from schema registry
- **Effort:** 30 minutes

**20. Dual Sanity configurations**
- **Where:** `studio/` and `promise-pipeline/sanity/`
- **Problem:** Two separate Sanity setups with different major versions (v5 vs v3)
- **Fix:** Consolidate to one Sanity configuration
- **Effort:** 1 hour

---

## Architecture Recommendations

### 1. What's the best-engineered part of this codebase?

**The Promise Engine kernel (`backend/app/promise_engine/`) and the HB2021 test suite.**

The backend's core architecture is excellent:
- Clean separation: core models → engine → storage → API
- The `PromiseEvent` data model is well-designed — every field serves the training data pipeline
- Trust capital with stakes weighting is implemented correctly
- Recovery workflow properly models state transitions
- Schema versioning handles material vs. cosmetic changes
- The HB2021 Promise Theory tests are genuinely rigorous — they test mathematical invariants, not just happy paths

The `promise-pipeline/lib/simulation/` module is also strong — the cascade BFS is correct, the scoring math is sound, and the entropy/betweenness centrality implementations are well-commented.

**Do not change:** The PromiseEvent schema, the trust capital computation, the schema versioning logic, or the Promise Theory test structure.

### 2. What's the most fragile part?

**The annotation pipeline (`/api/annotate/`) and the frontend/pipeline boundary.**

1. The annotation save route writes to the local filesystem — this fundamentally cannot work in production on Vercel.
2. The annotation extract route sends raw user input to the Anthropic API with 9 `any` types — the least type-safe code in the repo.
3. The coexistence of three separate frontend apps (frontend/, promise-pipeline/, promise-garden/) with zero shared code means every domain concept is implemented three times.
4. The lack of error boundaries means any runtime error in any frontend is a full crash.

### 3. Top 3 fixes before next deploy

1. **Add authentication to `/export` endpoint** — training data is the product's core value; it's currently publicly accessible.
2. **Add `error.tsx` files to all route segments** — prevents white-screen crashes.
3. **Fix annotation save to use a real data store** — filesystem writes silently fail on Vercel.

### 4. Is the project structure ready for planned features?

**Promise Garden:** The structure is ready. The garden renderer architecture (`lib/garden/renderer/`) is well-modularized with separate files for plant shapes, colors, weather, etc. Supabase integration is functional. The Capacitor mobile setup is in place.

**Five-field metrics:** The type system (`lib/types/promise.ts`) already has polarity, origin, and scope fields. The analysis modules are well-structured for adding new metrics.

**Promise factories:** The `PromiseFactory` type and `isPromiseFactory()` type guard are defined but not yet consumed by any component. The data structures are ready; the UI needs to be built.

**Annotation pipeline at scale:** Not ready. The filesystem-based storage will fail immediately. Needs a database-backed storage layer before scaling.

**Shared code:** The biggest structural gap is the lack of a shared library. When promise-garden needs cascade simulation, the code will be copied a third time. Extract `@promise-engine/core` as a shared package before adding more features.

### 5. Dependencies to add, remove, or upgrade

**Add:**
- `vitest` + `@testing-library/react` — frontend test infrastructure (both Next.js apps)
- `flask-limiter` — rate limiting for backend auth endpoints
- `zod` or similar — input validation for Next.js API routes

**Remove/investigate:**
- `styled-components` from promise-pipeline — likely unused if Tailwind is the styling system
- `react-is` from promise-pipeline — verify if directly needed

**Upgrade:**
- Consolidate Sanity versions (studio uses v5, pipeline uses v3)
- Consider upgrading to Next.js 15 for both apps (currently on 14)

**No action needed:**
- React 18 is appropriate (React 19 migration is non-trivial)
- Tailwind 3.x is stable
- The backend dependency versions are current and pinned

---

## Summary

This is a **well-architected codebase with strong domain modeling and rigorous backend testing**, let down by **missing production safety nets** (error boundaries, rate limiting, auth on export) and **structural fragmentation** across three frontend apps with zero shared code.

The Promise Engine kernel is production-quality. The simulation and analysis modules are mathematically sound. The type system is strict. The test suite for Promise Theory axioms is genuinely excellent.

The critical path to production quality is short: add error boundaries, secure the export endpoint, fix the annotation storage, and add rate limiting. These are all achievable in a single focused session.
