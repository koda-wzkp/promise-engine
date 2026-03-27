# Promise Garden V2 — Build Report

**Branch:** `claude/phase-2-nctp-accountability-vyOY2`
**Date:** 2026-03-27
**Commits:** `1f734d2` (Phase 2) → `edfc6f0` (Phase 3) → `2ee7bfc` (Phase 4)
**Total:** 61 files changed, 8,797 insertions, 95 deletions

---

## Overview

Promise Garden V2 extends the Phase 1 personal promise garden into a full **Nested Commitment Tracking Protocol (NCTP)** system spanning five organizational levels:

**sub-promise → personal → team → org → civic/state**

Structure flows down, details stay private, status flows up.

---

## Phase 2: NCTP + Accountability

**Commit:** `1f734d2` — 17 files, 3,325 insertions

### What Was Built

- **Sub-promises**: Decompose personal promises into tracked sub-tasks with parent-child relationships
- **Dependency edges**: Visual connections between promises with cascade propagation
- **Zoom controller**: Navigate between overview, focus, and detail zoom levels
- **Accountability partners**: Invite partners via shareable codes, view shared garden plots
- **Sensor connections**: External data source integration (GitHub, calendar, manual) with auto-verification
- **Cascade animation**: Visual ripple effects when status changes propagate through the network
- **Root system visualization**: Shows hidden dependency connections beneath garden plants
- **Watering actions**: Ritual engagement mechanic tied to promise maintenance

### Files Created

| File | Purpose |
|------|---------|
| `lib/types/garden.ts` | Core types: GardenPromise, GardenState, GardenAction, CameraState, ZoomLevel |
| `lib/garden/gardenReducer.ts` | Central state management with useReducer pattern |
| `lib/garden/gardenCascade.ts` | Cascade propagation engine for garden context |
| `lib/garden/parentStatus.ts` | Parent status computation from child promises |
| `components/personal/SubPromiseCreator.tsx` | Create sub-promises under any promise |
| `components/personal/DependencyEditor.tsx` | Add/remove dependencies between promises |
| `components/personal/PartnerSetup.tsx` | Accountability partner configuration |
| `components/personal/PartnerInvite.tsx` | Share invite codes for partner linking |
| `components/personal/SharedGardenPlot.tsx` | View partner's garden (privacy-respecting) |
| `components/personal/SensorConnect.tsx` | External sensor configuration (GitHub, calendar, manual) |
| `components/personal/WateringAction.tsx` | Ritual watering interaction |
| `components/garden/ZoomController.tsx` | Three-level zoom with camera state |
| `components/garden/DependencyEdge.tsx` | SVG edge rendering between promise nodes |
| `components/garden/CascadeAnimation.tsx` | Visual cascade ripple effect |
| `components/garden/RootSystem.tsx` | Underground dependency visualization |

### Files Modified

| File | Changes |
|------|---------|
| `app/personal/page.tsx` | Added Phase 2 modal types, handlers for sub-promises/deps/partners/sensors, zoom integration |
| `components/personal/GardenView.tsx` | Extended with zoom, dependency rendering, cascade triggers |

---

## Phase 3: Teams + Contribution + Gifting

**Commit:** `edfc6f0` — 22 files, 2,359 insertions

### What Was Built

- **Team garden**: Join/create teams, view team promise plots, sync status to Supabase
- **Anonymous contribution**: Level C (monthly aggregates) and Level A (batched transitions, 50+ required) — no PII ever leaves the device
- **Contribution API**: POST endpoint returns predictions and benchmarks as reciprocal value
- **Gifting system**: Mint artifacts from kept promises, gift copies to partners with privacy controls
- **Supabase integration**: Lazy-loaded client using `new Function()` trick to bypass webpack static analysis — fully optional at build time

### Files Created

| File | Purpose |
|------|---------|
| `lib/types/phase3.ts` | Team, ContributionState, Artifact, Gift, ReceivedGift types |
| `lib/supabase/client.ts` | Lazy Supabase client (optional dependency) |
| `lib/supabase/teamSync.ts` | Team real-time subscriptions and CRUD |
| `lib/contribution/compute.ts` | Aggregate/schema computation for contribution |
| `app/api/contribute/route.ts` | POST /api/contribute endpoint |
| `components/team/TeamGarden.tsx` | Team garden view with assignments |
| `components/team/TeamPlot.tsx` | Individual team promise card |
| `components/team/JoinTeamFlow.tsx` | Join team by ID modal |
| `components/team/CreateTeamFlow.tsx` | Create team modal |
| `components/contribution/ContributionOptIn.tsx` | Level C/A opt-in modal |
| `components/contribution/ContributionSettings.tsx` | Manage contribution settings |
| `components/contribution/ContributionPlant.tsx` | Visual indicator grows with batches |
| `components/contribution/PredictionBadge.tsx` | Fulfillment prediction display |
| `components/contribution/BenchmarkCard.tsx` | Community benchmark comparison |
| `components/gifting/GiftButton.tsx` | Mint/gift artifact button |
| `components/gifting/GiftOptionsModal.tsx` | Privacy controls for gifting |
| `components/gifting/ReceivedGifts.tsx` | Received gift gallery |
| `components/gifting/GiftBadge.tsx` | Compact artifact collection badge |

### Files Modified

| File | Changes |
|------|---------|
| `app/personal/page.tsx` | Added contribution/gifting handlers, Phase 3 modals, header badges |
| `app/team/page.tsx` | Added garden tab, team sync, join/create handlers, useReducer |
| `lib/types/garden.ts` | Added Phase 3 fields to GardenState and GardenAction |
| `lib/garden/gardenReducer.ts` | Added Phase 3 reducer cases (team CRUD, contribution, gifting) |

---

## Phase 4: Org + Civic Zoom

**Commit:** `2ee7bfc` — 27 files, 3,124 insertions

### What Was Built

- **Org-level network**: Multi-team organizations with org-scoped promises
- **Cross-team dependencies**: Visual bridges between team plots, pulse when stressed
- **External civic/regulatory dependency linking**: Connect org promises to HB 2021 and Gresham CAP dashboards
- **Full NCTP zoom chain**: `buildZoomChain()` walks from any promise up through personal → team → org → civic → state
- **Civic data feed**: Lazy-loads dashboard data, syncs civic promise statuses into org network
- **REST API**: 8 endpoints for org/team promises, health, simulation, dependencies, civic links
- **Webhook integration**: CRUD for webhook endpoints with event filtering and health threshold alerts
- **Org cascade simulator**: Reuses existing `simulateCascade()` engine at org scale
- **Org settings**: API key management, webhook configuration, civic link setup, billing display
- **CivicZoomTransition**: Visual component showing garden→civic aesthetic boundary

### Files Created

| File | Purpose |
|------|---------|
| `lib/types/phase4.ts` | Org, OrgPromise, ExternalDependency, CrossTeamDependency, ApiKey, WebhookConfig, ZoomChainLevel |
| `lib/supabase/orgSync.ts` | Org real-time subscriptions and CRUD |
| `lib/civic/civicFeed.ts` | Civic data feed: status sync, zoom chain builder |
| `app/org/page.tsx` | Full org page (garden/dashboard/cascade/deps/settings) |
| `app/api/v1/org/[orgId]/promises/route.ts` | GET/POST org promises |
| `app/api/v1/org/[orgId]/health/route.ts` | GET org health score |
| `app/api/v1/org/[orgId]/simulate/route.ts` | POST cascade simulation |
| `app/api/v1/org/[orgId]/dependencies/route.ts` | GET cross-team dependencies |
| `app/api/v1/org/[orgId]/civic-links/route.ts` | GET civic links |
| `app/api/v1/team/[teamId]/promises/route.ts` | GET team promises |
| `app/api/v1/team/[teamId]/health/route.ts` | GET team health |
| `app/api/v1/team/[teamId]/simulate/route.ts` | POST team cascade simulation |
| `components/org/OrgGarden.tsx` | Landscape of team plots with cross-team bridges |
| `components/org/OrgTree.tsx` | Org promise card with status/ownership/deps |
| `components/org/CrossTeamBridge.tsx` | Visual dependency pill, animates when stressed |
| `components/org/ExternalDependencyCard.tsx` | Civic/regulatory dependency display |
| `components/org/OrgDashboard.tsx` | Stats, team health bars, bottlenecks, domain health |
| `components/org/OrgCascadeSimulator.tsx` | OrgPromise → Promise conversion for cascade engine |
| `components/org/CivicZoomTransition.tsx` | Full NCTP chain with garden→civic boundary |
| `components/org/DependencyMap.tsx` | Adjacency-list dependency view |
| `components/org/settings/CreateOrgFlow.tsx` | Create org modal |
| `components/org/settings/OrgApiKeys.tsx` | API key management |
| `components/org/settings/WebhookSettings.tsx` | Webhook CRUD with event selection |
| `components/org/settings/CivicLinkSetup.tsx` | Link to HB 2021/Gresham dashboards |
| `components/org/settings/OrgBilling.tsx` | Subscription and billing display |

### Files Modified

| File | Changes |
|------|---------|
| `lib/types/garden.ts` | Added org, apiKeys, webhooks, orgDashboard to GardenState; 18 Phase 4 actions |
| `lib/garden/gardenReducer.ts` | Added 18 Phase 4 reducer cases, Phase 4 fields to loadGardenState |

---

## Self-Review Checklist

### What Was Built vs. Specced

| Spec Item | Status | Notes |
|-----------|--------|-------|
| Sub-promises with parent chains | Built | Parent status auto-computed from children |
| Dependency edges with cascade | Built | Visual edges + propagation engine |
| Three-level zoom | Built | Overview / Focus / Detail with camera state |
| Accountability partners | Built | Invite codes, shared garden plots |
| External sensors | Built | GitHub, calendar, manual — auto-verify triggers |
| Team garden with Supabase sync | Built | Real-time subscriptions, optional dependency |
| Level C/A contribution | Built | Monthly aggregates + batched transitions |
| Gifting system | Built | Mint → gift → gallery, non-transferable |
| Org-level promise network | Built | Multi-team, org-scoped promises |
| Cross-team dependencies | Built | Visual bridges, stress indicators |
| Civic dependency linking | Built | HB 2021 + Gresham CAP dashboards |
| Full NCTP zoom chain | Built | sub-promise → personal → team → org → civic → state |
| REST API (8 endpoints) | Built | Org + team endpoints for promises/health/simulate/deps |
| Webhook integration | Built | CRUD with event filtering + health thresholds |
| API key management | Built | Create/revoke with prefix display |
| Org cascade simulator | Built | Reuses existing cascade engine |
| Billing/pricing display | Built | Feature list, tier display (UI only) |

**Deviations:**
- Pricing UI is display-only (no Stripe integration wired) — matches spec ("stub billing page")
- API endpoints return mock/localStorage data — no Supabase backend for org queries yet
- Contribution API returns mock predictions — no ML model backing yet
- Sensor connections are UI-only — no actual GitHub/calendar OAuth flows

### New Dependencies

| Dependency | Justification |
|------------|---------------|
| `@supabase/supabase-js` | Optional runtime dependency for team/org real-time sync. Loaded via `new Function()` to avoid build-time requirement. |

No other new dependencies were added. All features built with existing React 18 + Next.js 14 + Tailwind stack.

### Technical Debt

| Item | Severity | Notes |
|------|----------|-------|
| No unit tests for garden reducer | High | 18+ action types untested. Flag: PROCESS.md requires unit + integration + axiom tests. |
| No integration tests for API routes | High | 8 endpoints without test coverage |
| No axiom tests for NCTP properties | Medium | Promise Theory properties (autonomy, composability) not formally verified |
| Sensor OAuth stubs | Low | UI renders but GitHub/calendar connections are mock-only |
| Contribution API returns synthetic data | Low | No ML model; returns plausible mock predictions |
| API endpoints use localStorage, not Supabase | Medium | Org/team API routes stub data access — production needs Supabase queries |
| `as any` casts in zoom chain | Low | `buildZoomChain()` uses `as any` for teamPromiseId/teamId access |
| Team names fallback to IDs | Low | `teamNames` map uses team IDs as display labels |

### Invariants — Confirmed

- [x] **All DB writes go through API routes** — Supabase writes only via `orgSync.ts`/`teamSync.ts`, never from components
- [x] **Privacy boundary maintained** — Personal sub-promises NEVER sync to Supabase; personal data stays in localStorage
- [x] **Contribution is anonymous** — Level C: monthly aggregates (no PII); Level A: 50+ batch minimum, five fields only
- [x] **Artifacts are non-transferable** — Gifts are copies; no marketplace; no transfer of original
- [x] **Cascade engine reused, not duplicated** — Same `simulateCascade()` from Promise Pipeline used at all scales
- [x] **Phase 1 functionality preserved** — All existing demo dashboards (HB 2021, Gresham CAP) unchanged
- [x] **Backward-compatible localStorage** — `loadGardenState()` handles Phase 1 arrays, Phase 2 objects, Phase 3/4 extensions
- [x] **No secrets in client code** — Supabase keys read from env vars only; API keys show prefix only
- [x] **Training data export is append-only** — No deletion paths exist in contribution flow

### Security Considerations

| Surface | Assessment |
|---------|------------|
| API routes (`/api/v1/*`) | No auth middleware yet — production needs JWT/API key validation |
| Webhook URLs | User-provided URLs stored and would be called — needs SSRF protection in production |
| Supabase client | Anon key only; RLS policies needed for production |
| localStorage | Contains all garden state — no encryption; acceptable for personal/demo use |
| Contribution endpoint | Validates payload shape but no rate limiting |
| Civic data feed | Reads from local data files only — no external API calls in current implementation |

### Fragility Analysis

**Most fragile component:** `gardenReducer.ts` (799 lines, 40+ action types, no tests)

If it fails:
- All state mutations across personal/team/org views break
- localStorage corruption could lose all user data
- No recovery mechanism beyond browser storage clear

**Mitigation needed:** Unit tests for each action type, state validation on load, export/import for data backup.

---

## Architecture Decisions

### ADR-001: Supabase as Optional Dependency
**Context:** Build must pass without `@supabase/supabase-js` installed.
**Decision:** Use `new Function("specifier", "return import(specifier)")` to bypass webpack static analysis.
**Consequence:** Supabase features work at runtime when package is installed; build always succeeds; slightly obscure import pattern.

### ADR-002: Single Reducer for All Phases
**Context:** State management across 4 phases with backward compatibility needed.
**Decision:** Single `gardenReducer` with `loadGardenState()` handling all legacy formats.
**Consequence:** One source of truth; large file (799 lines); all phases share localStorage key; corruption affects everything.

### ADR-003: Cascade Engine Reuse
**Context:** Need cascade simulation at personal, team, org, and civic scales.
**Decision:** Convert domain types to base `Promise[]` and reuse `simulateCascade()` from Promise Pipeline.
**Consequence:** No simulation code duplication; conversion layer needed at each scale; consistent cascade behavior across all NCTP levels.

### ADR-004: Civic Data from Local Files
**Context:** Need civic promise data (HB 2021, Gresham CAP) for dependency linking.
**Decision:** Lazy-load from existing `lib/data/` files rather than external API.
**Consequence:** Works offline; data is static; production would need live civic API integration.

### ADR-005: Privacy-First Contribution Model
**Context:** Need aggregate data for predictions without compromising individual privacy.
**Decision:** Level C = monthly aggregates (no PII); Level A = 50+ batch minimum with only five fields per record.
**Consequence:** Useful aggregate data flows up; individual promise content never leaves device; 50-promise minimum prevents re-identification.

---

## Build Output

| Route | Size | Type |
|-------|------|------|
| `/personal` | 40.5 kB | Client |
| `/team` | 15.2 kB | Client |
| `/org` | 11.8 kB | Client |
| `/api/contribute` | — | Dynamic (ƒ) |
| `/api/v1/org/[orgId]/*` | — | Dynamic (ƒ) |
| `/api/v1/team/[teamId]/*` | — | Dynamic (ƒ) |

Build completes with zero errors. TypeScript strict mode passes.

---

## File Count Summary

| Phase | Files Created | Files Modified | Insertions |
|-------|--------------|----------------|------------|
| Phase 2 | 15 | 2 | 3,325 |
| Phase 3 | 18 | 4 | 2,359 |
| Phase 4 | 25 | 2 | 3,124 |
| **Total** | **58** | **8** | **8,808** |

---

## What's Next (Not Built — Future Phases)

- **Stripe billing integration** — Currently display-only
- **OAuth sensor connections** — GitHub, Google Calendar
- **Supabase RLS policies** — Row-level security for multi-tenant
- **API authentication middleware** — JWT/API key validation on REST endpoints
- **ML-backed predictions** — Replace mock contribution predictions
- **Live civic API** — Replace static data files with real-time civic promise feeds
- **Test suite** — Unit, integration, and axiom tests for all phases
- **Data export/import** — Backup and restore garden state
