# K-Regime Codebase Inventory

**Generated:** 2026-03-27
**Purpose:** Map all k-regime references before boundary update
**Scope:** Complete read-only audit of personal garden promise system

---

## Summary

- **Total files with regime references:** 17 (core + UI)
- **Files that define regime logic:** 3
- **Files that consume regime data:** 8
- **Files that display regime info to users:** 6
- **Current k boundaries (personal garden):** composting < 0.4, ecological 0.4–0.7, physics ≥ 0.7
- **Current k boundaries (dashboard):** composting < 0.40, transitional 0.40–0.70, computing ≥ 0.70
- **Current expectedK values:** composting = 0.37, ecological = 0.67, physics = 1.1

---

## Core Definitions

### `classifyKRegime()` — `lib/types/personal.ts:64-79`

```typescript
export function classifyKRegime(
  method: import("./promise").VerificationMethod
): KRegime {
  switch (method) {
    case "sensor":
    case "audit":
    case "benchmark":
      return "physics";
    case "self-report":
    case "filing":
      return "ecological";
    case "none":
    default:
      return "composting";
  }
}
```

**Logic:** Maps verification method to k-regime.
- **physics:** sensor, audit, benchmark (strong verification)
- **ecological:** self-report, filing (moderate verification)
- **composting:** none, default (no verification)

---

### `expectedKValue()` — `lib/types/personal.ts:81-87`

```typescript
export function expectedKValue(regime: KRegime): number {
  switch (regime) {
    case "physics":    return 1.1;
    case "ecological": return 0.67;
    case "composting": return 0.37;
  }
}
```

**Current values:** physics = 1.1, ecological = 0.67, composting = 0.37

---

### `KRegime` type — `lib/types/personal.ts:62`

```typescript
export type KRegime = "composting" | "ecological" | "physics";
```

**Used in:**
- `GardenPromise` interface (field: `kRegime: KRegime`)
- `Artifact` interface (field: `generatedFrom.kRegime: KRegime`)
- `GardenStatsV2` interface (field: `kDistribution: Record<KRegime, number>`)

---

## All References (by File)

### `lib/types/personal.ts`
- Line 62: `KRegime` type definition
- Lines 64–79: `classifyKRegime()` — maps verification method to regime
- Lines 81–87: `expectedKValue()` — returns k value for regime
- Lines 110, 132, 160–164: Field usage in `Artifact` and `GardenPromise` interfaces
- Lines 230–234: Distribution tracking in `GardenStatsV2` interface

**Role:** Defines the regime classification system for personal garden promises. Source of truth for all k-regime logic.

---

### `lib/garden/gardenState.ts`
- Lines 12–14: Imports `classifyKRegime` and `expectedKValue`
- Lines 104–105: Calls both functions when converting v1 to GardenPromise
- Line 114: Sets `kRegime` from classification
- Line 115: Sets `expectedK` from value function
- Lines 159–164: Accumulates `kDistribution` statistics
- Lines 457–458: **Hardcoded** `expectedK: 1.1` when partner watering (forces physics regime)
- Lines 473–474: **Hardcoded** `expectedK: 1.1` when sensor connected (forces physics regime)

**Role:** State management for garden promises. Uses regime classification to initialize new promises, computes regime distribution for stats, forces physics regime when external verification is added.

**Critical:** Lines 457–458 and 473–474 hardcode `expectedK: 1.1` — any change to physics expectedK must update here.

---

### `lib/garden/adaptiveCheckin.ts`
- Line 11: Accesses `promise.expectedK`
- Lines 15–26: Adaptive frequency computation based on k thresholds:
  - `k < 0.5` → composting regime, push toward minimum frequency
  - `k > 1.5` → physics regime, back off to maximum frequency
  - `0.5 ≤ k ≤ 1.5` → ecological regime, target 4 days

**Role:** Computes optimal check-in frequency based on k-regime. Uses expectedK to determine how aggressively to monitor a promise.

**Note:** This file uses its own thresholds (0.5, 1.5) — not the canonical boundaries from personal.ts (0.4, 0.7). These are soft frequency boundaries, not classification boundaries.

---

### `lib/garden/artifactGeneration.ts`
- Lines 3–7: `GROWTH_PATTERNS` lookup table keyed by `KRegime`:
  - composting: `["spreading", "mycelial", "diffuse"]`
  - ecological: `["branching", "vine", "spiral"]`
  - physics: `["crystalline", "geometric", "fractal"]`
- Line 46: Selects growth pattern based on `promise.kRegime`
- Lines 88–92: Labels for artifact descriptions: "Composting", "Ecological", "Physics"
- Line 94: Includes regime name in human-readable artifact description

**Role:** Uses k-regime to generate visual and descriptive properties for fossilized artifacts (completed promises).

---

### `components/personal/CheckInCard.tsx`
- Lines 18–28: `K_LABELS` and `K_COLORS` lookup tables:
  - composting: `"#d97706"` (amber)
  - ecological: `"#059669"` (emerald)
  - physics: `"#2563eb"` (blue)
- Lines 106–111: Renders regime badge with color and label

**Role:** Displays regime badge in check-in modal.

**UI-facing:** "Composting regime", "Ecological regime", "Physics regime"

---

### `components/personal/FrequencySettings.tsx`
- Line 41: Help text: "The system computes an optimal frequency based on your promise's k-regime."
- Lines 93–95: Displays regime name and k value: `Based on {promise.kRegime} regime (k = ...)`

**Role:** Shows adaptive frequency UI. User sees what regime the promise is in and how it affects check-in frequency.

---

### `components/personal/GardenStats.tsx`
- Lines 9–13: `K_CONFIG` lookup table:
  - composting: `{ label: "Composting", color: "#d97706", desc: "No verification — organic decay" }`
  - ecological: `{ label: "Ecological", color: "#059669", desc: "Self-report or filing" }`
  - physics: `{ label: "Physics", color: "#2563eb", desc: "Sensor or audit verified" }`
- Lines 54–66: Renders regime distribution bar chart
- Lines 69–71: User-facing callout: "Physics regime promises fulfill at 12.2% after 5 years. Composting regime: 0.1%. Adding verification changes everything."

**Role:** Summary statistics dashboard. Shows how many promises are in each regime with color-coded bars.

---

### `components/personal/OnboardingFlow.tsx`
- Lines 4, 38–39: Imports and calls `classifyKRegime` and `expectedKValue`
- Line 38: Classification of verification method into regime
- Line 39: Computation of expectedK from regime
- Lines 59–61: Sets `kRegime` and `expectedK` on newly created promises

**Role:** Onboarding flow that creates initial garden promises using regime classification.

---

### `components/personal/CollectionArtifact.tsx`
- Line 5: Imports `artifactDescription` which formats regime info
- Line 43: Calls description function that includes regime label

**Role:** Displays fossilized artifacts in collection. Artifact description includes regime name.

---

### `lib/simulation/bayesian.ts`
- Line 182: Regime classification: `k >= 0.70 ? "computing" : k < 0.40 ? "composting" : "transitional"`
- Lines 247–250: `classifyRegime()` — classifies regime based on k boundaries
- Lines 275–276: Peak verification window note at k=0.37
- Lines 309, 312–313: Recoverability peak at k=0.37 (PREVENT_COMPOSTING urgency type)
- Line 290: PREVENT_COMPOSTING urgency triggered when `belief.k < 0.45`
- Lines 311: Recoverability window: 0.20–0.45, peak at 0.37
- Line 370: Urgency reason: `"Composting risk (k=...)"`
- Lines 377–378: Urgency reason formatting for composting regime

**Role:** Dashboard simulation and urgency calculation. Uses k thresholds 0.4 and 0.7 to classify regime for dashboard promises.

---

### `components/promise/RegimeBadge.tsx`
- Lines 10–38: `REGIME_STYLES` lookup for `DynamicalRegime`:
  - computing: emerald, "Outcomes are physics-like and predictable. Hazard rate is constant."
  - composting: amber, "Ecological regime — barriers grow over time. Hazard rate decreases..."
  - transitional: blue, "Fragile regime — between composting and computing..."
- Lines 40–44: `REGIME_LABELS` for display
- Line 53: Title attribute shows k value and explanation

**Role:** Displays colored regime badge with explanation tooltip on dashboard promise cards.

---

### `components/promise/ProbabilityBar.tsx`
- Lines 19–23: Regime classification helper:
  - `k >= 0.70` → computing
  - `k < 0.40` → composting
  - else → transitional
- Line 48: Title attribute includes regime label and k value

**Role:** Displays fulfillment probability bar with regime classification in tooltip.

---

### `lib/simulation/bayesianCascade.ts`
- Lines 182–184: Regime classification for probability shifts:
  - `k >= 0.70` → computing
  - `k < 0.40` → composting
  - else → transitional

**Role:** What-if cascade simulation. Classifies regimes for reporting probability shifts.

---

### `lib/simulation/lindblad.ts`
- Lines 89–93: Regime classification based on k thresholds:
  - `k > 1.5` → pressure (bonus regime for physics-like behavior)
  - `k > 0.7` → computing
  - `k < 0.4` → composting
  - else → transitional
- Lines 95–107: Regime classification based on verification method

**Role:** Lindblad master equation projection. Classifies regime for state evolution simulation.

---

### `lib/types/bayesian.ts`
- Lines 4–7: Documented k boundaries:
  - `k < 0.4` → composting
  - `k ≈ 0.5` → transitional
  - `k > 0.7` → computing
- Lines 28–32: `NetworkBelief` regime distribution fields
- Line 53: `DynamicalRegime` type definition (`"computing" | "composting" | "transitional"`)

**Role:** Type definitions for dashboard Bayesian system. Documents the regime classification boundaries.

---

## User-Facing Strings

### Personal Garden Regime Names
| Location | Text | Context |
|----------|------|---------|
| CheckInCard.tsx:19 | "Composting" | K_LABELS regime label |
| CheckInCard.tsx:20 | "Ecological" | K_LABELS regime label |
| CheckInCard.tsx:21 | "Physics" | K_LABELS regime label |
| GardenStats.tsx:10 | "Composting" | K_CONFIG regime label |
| GardenStats.tsx:11 | "Ecological" | K_CONFIG regime label |
| GardenStats.tsx:12 | "Physics" | K_CONFIG regime label |
| artifactGeneration.ts:88 | "Composting" | Artifact description label |
| artifactGeneration.ts:89 | "Ecological" | Artifact description label |
| artifactGeneration.ts:90 | "Physics" | Artifact description label |

### Personal Garden Descriptions
| Location | Text |
|----------|------|
| GardenStats.tsx:10 | "No verification — organic decay" |
| GardenStats.tsx:11 | "Self-report or filing" |
| GardenStats.tsx:12 | "Sensor or audit verified" |
| GardenStats.tsx:69–71 | "Physics regime promises fulfill at 12.2% after 5 years. Composting regime: 0.1%. Adding verification changes everything." |
| FrequencySettings.tsx:41 | "The system computes an optimal frequency based on your promise's k-regime." |

### Dashboard Regime Names & Descriptions
| Location | Text |
|----------|------|
| RegimeBadge.tsx:41 | "Computing" |
| RegimeBadge.tsx:42 | "Composting" |
| RegimeBadge.tsx:43 | "Transitional" |
| RegimeBadge.tsx:22 | "Outcomes are physics-like and predictable. Hazard rate is constant." |
| RegimeBadge.tsx:29 | "Ecological regime — barriers grow over time. Hazard rate decreases. Conditions stagnate without verification." |
| RegimeBadge.tsx:36 | "Fragile regime — between composting and computing. Verification could push this toward predictability." |

---

## Cascade/Simulation Usage

**Verification Urgency (`bayesian.ts`):**
- `PREVENT_COMPOSTING` urgency triggered when `belief.k < 0.45`
- Recoverability window: 0.20–0.45, peak at k=0.37
- Urgency reason text: `"Composting risk (k=...)"`

**Regime Classification for Cascade (`bayesianCascade.ts`, lines 182–184):**
- k >= 0.70 → "computing"
- k < 0.40 → "composting"
- else → "transitional"

**Lindblad Regime (`lindblad.ts`, lines 89–93):**
- Adds "pressure" regime for k > 1.5
- Uses 0.4 and 0.7 as primary boundaries

---

## Plant Generation Usage

**Artifact Generation (`artifactGeneration.ts`):**
- Composting → growth patterns: spreading, mycelial, diffuse
- Ecological → growth patterns: branching, vine, spiral
- Physics → growth patterns: crystalline, geometric, fractal

Growth pattern selection is keyed directly on `promise.kRegime` string value.

---

## Hardcoded k Values

| File | Line | Value | Context |
|------|------|-------|---------|
| lib/types/personal.ts | 83 | 1.1 | physics expectedK return value |
| lib/types/personal.ts | 84 | 0.67 | ecological expectedK return value |
| lib/types/personal.ts | 85 | 0.37 | composting expectedK return value |
| lib/garden/gardenState.ts | 458 | 1.1 | expectedK when partner watering (hardcoded) |
| lib/garden/gardenState.ts | 474 | 1.1 | expectedK when sensor connected (hardcoded) |
| lib/garden/adaptiveCheckin.ts | 15 | 0.5 | soft composting detection threshold |
| lib/garden/adaptiveCheckin.ts | 18 | 1.5 | soft physics detection threshold |
| lib/simulation/bayesian.ts | 31 | 0.37 | VERIFICATION_K_MAP["self-report"] |
| lib/simulation/bayesian.ts | 35 | 0.85 | VERIFICATION_K_MAP["sensor"] |
| lib/simulation/bayesian.ts | 103 | 0.90 | STATUS_K_FLOOR["violated"] |
| lib/simulation/bayesian.ts | 248 | 0.70 | classifyRegime boundary (computing) |
| lib/simulation/bayesian.ts | 290 | 0.45 | verificationUrgency PREVENT_COMPOSTING trigger |
| lib/simulation/bayesian.ts | 311 | 0.20 | recoverability window lower bound |
| lib/simulation/bayesian.ts | 311 | 0.45 | recoverability window upper bound |
| lib/simulation/bayesian.ts | 312 | 0.37 | recoverability peak (verification window center) |
| lib/simulation/bayesianCascade.ts | 182 | 0.70 | regime classification boundary |
| lib/simulation/bayesianCascade.ts | 183 | 0.40 | regime classification boundary |
| lib/simulation/lindblad.ts | 89 | 1.5 | pressure regime threshold |
| lib/simulation/lindblad.ts | 90 | 0.7 | computing regime threshold |
| lib/simulation/lindblad.ts | 91 | 0.4 | composting regime threshold |
| components/promise/ProbabilityBar.tsx | 20 | 0.70 | computing regime threshold |
| components/promise/ProbabilityBar.tsx | 21 | 0.40 | composting regime threshold |

---

## Change Impact Assessment

### Changing boundaries from (0.4, 0.7) to (0.5, 1.3)

The spec boundary update changes:
- composting/ecological boundary: 0.4 → 0.5
- ecological/physics boundary: 0.7 → 1.3

**What breaks (requires update):**
1. `bayesian.ts` line 248: `classifyRegime()` boundaries 0.40 and 0.70
2. `bayesianCascade.ts` lines 182–184: boundaries 0.40 and 0.70
3. `lindblad.ts` lines 90–91: boundaries 0.4 and 0.7
4. `ProbabilityBar.tsx` lines 20–21: boundaries 0.40 and 0.70
5. `bayesian.ts` line 290: PREVENT_COMPOSTING trigger `k < 0.45` — reconsider with new boundary at 0.5
6. `bayesian.ts` lines 311–312: recoverability window 0.20–0.45/peak 0.37 — needs repositioning around new composting midpoint
7. `lib/types/bayesian.ts` lines 4–7: documentation of boundaries

**Note:** The personal garden's `classifyKRegime()` (personal.ts) maps by verification *method*, not by k value — so it is NOT directly affected by boundary changes. Only the dashboard system (bayesian.ts, bayesianCascade.ts, lindblad.ts, ProbabilityBar.tsx) classifies by k value.

---

### Changing expectedK values

If changing composting=0.37, ecological=0.67, physics=1.1:

**What breaks:**
1. `lib/types/personal.ts` lines 81–87: `expectedKValue()` return values
2. `lib/garden/gardenState.ts` lines 457–458, 473–474: hardcoded `expectedK: 1.1`
3. `lib/simulation/bayesian.ts` line 31: VERIFICATION_K_MAP may need updating
4. `lib/garden/adaptiveCheckin.ts` thresholds 0.5 and 1.5: check if these still bracket the new expectedK values correctly
5. Historical promise data: existing promises retain old expectedK until reclassified

---

### Renaming regimes

Personal garden uses: "composting", "ecological", "physics"
Dashboard uses: "computing", "composting", "transitional"

**Minimum files to update if renaming personal garden regimes:**
1. `lib/types/personal.ts` line 62: `KRegime` type union
2. `lib/types/personal.ts` lines 64–87: function return values
3. `lib/garden/artifactGeneration.ts`: GROWTH_PATTERNS keys + description labels (lines 3–7, 88–92)
4. `components/personal/CheckInCard.tsx`: K_LABELS and K_COLORS keys
5. `components/personal/GardenStats.tsx`: K_CONFIG keys
6. `lib/garden/gardenState.ts`: any regime string comparisons
7. `components/personal/OnboardingFlow.tsx`: any regime string comparisons
8. All stored promise data has `kRegime` serialized — migration needed

---

### Adding a fourth regime

**Personal garden — minimum additions:**
1. `lib/types/personal.ts`: add to `KRegime` type union, add case to `classifyKRegime()` and `expectedKValue()`
2. `lib/garden/artifactGeneration.ts`: add to `GROWTH_PATTERNS`, add description label
3. `components/personal/CheckInCard.tsx`: add to `K_LABELS` and `K_COLORS`
4. `components/personal/GardenStats.tsx`: add to `K_CONFIG`
5. `lib/garden/adaptiveCheckin.ts`: review threshold logic

**Dashboard — minimum additions:**
1. `lib/types/bayesian.ts`: add to `DynamicalRegime` type union
2. `lib/simulation/bayesian.ts`: update `classifyRegime()`
3. `lib/simulation/lindblad.ts`: update `classifyLindbladRegime()`
4. `lib/simulation/bayesianCascade.ts`: update regime classification
5. `components/promise/RegimeBadge.tsx`: add to `REGIME_STYLES` and `REGIME_LABELS`
6. `components/promise/ProbabilityBar.tsx`: update boundary logic

**Total: 11+ files across both systems**

---

## Critical Files Summary

| File | Role | Criticality |
|------|------|-------------|
| `lib/types/personal.ts` | Type definitions + expectedK function | **HIGHEST** — source of truth |
| `lib/garden/gardenState.ts` | State reducer + regime assignment | **HIGHEST** — initializes kRegime/expectedK |
| `lib/simulation/bayesian.ts` | Dashboard urgency + classification | **HIGH** — 6+ k thresholds |
| `lib/garden/adaptiveCheckin.ts` | Frequency computation | **HIGH** — soft k thresholds |
| `lib/simulation/lindblad.ts` | State evolution classification | **HIGH** — k boundaries |
| `lib/simulation/bayesianCascade.ts` | Cascade regime classification | **HIGH** — k boundaries |
| `lib/types/bayesian.ts` | Dashboard type definitions | **MEDIUM** — documentation + types |
| `components/personal/CheckInCard.tsx` | User-facing regime display | **MEDIUM** — UI labels |
| `components/personal/GardenStats.tsx` | User-facing regime stats | **MEDIUM** — UI labels + descriptions |
| `lib/garden/artifactGeneration.ts` | Artifact visual properties | **MEDIUM** — regime → visuals |
| `components/promise/RegimeBadge.tsx` | Dashboard regime display | **MEDIUM** — UI labels |
| `components/promise/ProbabilityBar.tsx` | Dashboard probability display | **MEDIUM** — k boundaries |
