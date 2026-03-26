# Promise Engine for Oregon HB 2021: Clean Energy Accountability

**Status:** Planning
**Vertical:** `hb2021` (Climate/Energy Regulatory Compliance)
**Date:** 2026-03-10

---

## The Promise Theory Case for HB 2021

Oregon HB 2021 is *literally a promise system*. The bill compels utilities to make emissions reduction promises to the public, with regulatory bodies (PUC, DEQ) as verification agents. This is textbook Promise Theory:

| Promise Theory Concept | HB 2021 Mapping |
|---|---|
| **Promiser (Agent)** | PGE, PacifiCorp, Electricity Service Suppliers |
| **Promisee** | Oregon ratepayers, environmental justice communities |
| **Promise** | Reduce GHG emissions 80%/90%/100% by 2030/2035/2040 |
| **Verification** | PUC reviews Clean Energy Plans; DEQ measures emissions |
| **Renegotiation** | 6% rate cap exemption; PUC can grant reliability waivers |
| **Broken Promise** | Pacific Power's CEP fully rejected by PUC (2025) |
| **Kept Promise** | PGE emissions down 27% from baseline (on track) |

The current system relies on PDF filings, docket comments, and manual PUC review. Promise Engine can make this **machine-readable, continuously auditable, and publicly transparent**.

---

## What HB 2021 Requires (The Promises)

### 1. Emissions Reduction Targets
- **2030:** 80% below baseline (0.428 MTCO2e/MWh)
- **2035:** 90% below baseline
- **2040:** 100% below baseline (zero emissions from retail electricity)

### 2. Clean Energy Plans (CEPs)
- Each IOU must submit a CEP concurrent with each Integrated Resource Plan (IRP)
- CEP must include a roadmap of annual actions
- Must include targets for community-based renewable energy (CBRE) projects
- PUC evaluates for public interest and consistency with targets
- DEQ determines required emissions reductions per provider

### 3. Community Benefits & Environmental Justice
- Convene a Community Benefits and Impacts Advisory Group
- Biennial assessment of community benefits and impacts
- Focus on: communities of color, low-income, tribal, rural, coastal
- Local job development, energy cost reduction, increased resiliency

### 4. Labor Standards
- Project labor agreements or prevailing wage for renewables > 10 MW
- Whether or not publicly funded

### 5. Cost Safeguards
- 6% annual revenue requirement rate impact cap
- Utilities can request PUC exemptions for grid reliability or cost exceedance

### 6. New Fossil Fuel Ban
- Permanent ban on new gas-fired power plants and expansion of existing ones

---

## Agents in the System

```
┌─────────────────────────────────────────────────────┐
│                    PROMISERS                         │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Portland    │  │ PacifiCorp   │  │ ESS       │  │
│  │ General     │  │ (Pacific     │  │ Providers │  │
│  │ Electric    │  │  Power)      │  │           │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
└───────────────┬─────────────────────────┬───────────┘
                │     PROMISES            │
                ▼                         ▼
┌─────────────────────────────────────────────────────┐
│                    PROMISEES                         │
│                                                     │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ Oregon   │  │ EJ         │  │ Ratepayers      │  │
│  │ Public   │  │ Communities│  │ (residential,   │  │
│  │          │  │            │  │  commercial)    │  │
│  └──────────┘  └────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ▲
                        │ VERIFICATION
┌─────────────────────────────────────────────────────┐
│                  VERIFIERS                           │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Oregon   │  │ Oregon   │  │ Community Benefits│  │
│  │ PUC      │  │ DEQ      │  │ Advisory Groups   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Promise Schemas

### Schema 1: `hb2021.emissions_target`

**The core promise.** Tracks whether a utility is on pace to meet its legislated emissions reduction targets.

```
Promiser:  utility (PGE, PacifiCorp, ESS)
Promisee:  oregon_public
Cadence:   Annual (per DEQ reporting cycle)
Stakes:    HIGH
Verification: DEQ emissions data vs. baseline

Input Context:
  - utility_id
  - reporting_year
  - baseline_emissions_mtco2e_per_mwh  (0.428)
  - target_year (2030 | 2035 | 2040)
  - required_reduction_pct (80 | 90 | 100)

Output:
  - actual_emissions_mtco2e_per_mwh
  - actual_reduction_pct
  - on_track (boolean)
  - gap_pct (how far off target trajectory)
  - data_source (DEQ filing reference)

Result: KEPT | BROKEN | PENDING | RENEGOTIATED
  - KEPT: On or ahead of linear trajectory to target
  - BROKEN: Behind trajectory by > threshold
  - PENDING: Reporting period not yet closed
  - RENEGOTIATED: PUC granted exemption (6% rate cap or reliability)
```

### Schema 2: `hb2021.clean_energy_plan`

**The roadmap promise.** Did the utility submit a credible, PUC-accepted Clean Energy Plan?

```
Promiser:  utility
Promisee:  oregon_puc
Cadence:   Per IRP cycle (~2 years)
Stakes:    HIGH
Verification: PUC docket review

Input Context:
  - utility_id
  - irp_cycle_year
  - cep_filing_date
  - cep_docket_number

Output:
  - puc_disposition (accepted | accepted_with_conditions | rejected)
  - conditions (list of required modifications)
  - cbre_targets_included (boolean)
  - annual_action_roadmap_included (boolean)
  - ej_assessment_included (boolean)

Result: KEPT | BROKEN | RENEGOTIATED
  - KEPT: CEP accepted by PUC
  - BROKEN: CEP rejected (e.g., Pacific Power 2025)
  - RENEGOTIATED: Accepted with conditions / revisions required
```

### Schema 3: `hb2021.community_benefits`

**The justice promise.** Are environmental justice communities actually benefiting?

```
Promiser:  utility
Promisee:  ej_communities
Cadence:   Biennial (per HB 2021 requirement)
Stakes:    HIGH
Verification: Community Benefits Advisory Group assessment

Input Context:
  - utility_id
  - assessment_period_start
  - assessment_period_end
  - advisory_group_convened (boolean)

Output:
  - ej_investment_total_usd
  - cbre_projects_count
  - cbre_mw_capacity
  - local_jobs_created
  - rate_impact_on_low_income (pct change)
  - resiliency_projects_count
  - advisory_group_recommendations (list)
  - recommendations_adopted_count

Result: KEPT | BROKEN | PENDING
```

### Schema 4: `hb2021.labor_standards`

**The worker promise.** Are renewable energy projects meeting labor requirements?

```
Promiser:  utility (or project developer)
Promisee:  oregon_workforce
Cadence:   Per project (> 10 MW)
Stakes:    MEDIUM
Verification: Reported / project documentation

Input Context:
  - project_id
  - project_name
  - capacity_mw
  - requires_labor_standards (boolean, true if > 10 MW)

Output:
  - project_labor_agreement (boolean)
  - prevailing_wage_paid (boolean)
  - worker_count
  - local_hire_pct

Result: KEPT | BROKEN | BLOCKED
  - BLOCKED: Project < 10 MW (requirement doesn't apply)
```

### Schema 5: `hb2021.rate_impact`

**The affordability promise.** Is compliance staying within the 6% rate cap?

```
Promiser:  utility
Promisee:  ratepayers
Cadence:   Annual
Stakes:    HIGH
Verification: PUC rate case filings

Input Context:
  - utility_id
  - rate_year
  - annual_revenue_requirement_usd

Output:
  - compliance_cost_usd
  - rate_impact_pct
  - exceeds_cap (boolean)
  - exemption_requested (boolean)
  - exemption_granted (boolean)
  - exemption_reason (reliability | cost)

Result: KEPT | BROKEN | RENEGOTIATED
  - KEPT: Rate impact <= 6%
  - BROKEN: Rate impact > 6% without exemption
  - RENEGOTIATED: Exemption granted by PUC
```

### Schema 6: `hb2021.fossil_fuel_ban`

**The prohibition promise.** No new gas plants.

```
Promiser:  utility
Promisee:  oregon_public
Cadence:   Continuous
Stakes:    HIGH
Verification: PUC filings, project permits

Input Context:
  - utility_id
  - review_period_start
  - review_period_end

Output:
  - new_gas_plants_proposed (count)
  - new_gas_plants_permitted (count)
  - existing_gas_expansions_proposed (count)
  - existing_gas_expansions_permitted (count)

Result: KEPT | BROKEN
  - KEPT: Zero new gas plants or expansions
  - BROKEN: Any new gas capacity proposed or permitted
```

---

## Implementation Plan

### Phase A: Schema & Data Model (Week 1-2)

1. **Create `hb2021` vertical directory**
   - `backend/app/promise_engine/verticals/hb2021/__init__.py`
   - `backend/app/promise_engine/verticals/hb2021/schemas.py`
   - `backend/schemas/energy/` — JSON Schema files

2. **Define all 6 promise schemas** as `PromiseSchema` objects following the CODEC pattern

3. **Add new `AgentType` values** (or use existing ones):
   - `AgentType.BUSINESS` → utilities (PGE, PacifiCorp)
   - `AgentType.COMMUNITY` → EJ communities, advisory groups
   - `AgentType.PLATFORM` → Oregon PUC, DEQ (as verifiers)

4. **Seed agents**:
   - `business:pge` — Portland General Electric
   - `business:pacificorp` — PacifiCorp / Pacific Power
   - `platform:oregon_puc` — Oregon Public Utility Commission
   - `platform:oregon_deq` — Oregon Dept of Environmental Quality
   - `community:ej_advisory` — Community Benefits Advisory Groups

### Phase B: Verification Logic (Week 2-3)

1. **Emissions trajectory calculator**
   - Linear interpolation from baseline to target
   - Compare actual emissions to expected trajectory for current year
   - Flag BROKEN if behind by configurable threshold (e.g., 5%)

2. **CEP status tracker**
   - Track filing dates, docket numbers, PUC dispositions
   - Automatically flag BROKEN if CEP rejected

3. **Rate impact calculator**
   - Compare compliance costs against 6% revenue cap
   - Handle exemption requests as RENEGOTIATED

### Phase C: Data Ingestion (Week 3-4)

1. **Baseline data load**
   - HB 2021 baseline: 0.428 MTCO2e/MWh (avg of 2010-2012)
   - PGE current: ~27% reduction from baseline
   - PacifiCorp current: ~13% reduction from baseline

2. **Public data sources**
   - Oregon DEQ emissions reports
   - PUC docket filings (EDOCKETS system)
   - EIA Form 860/923 (power plant data)

3. **Manual entry API** for data not yet machine-readable
   - Admin endpoint to log verified promise events
   - Source attribution (filing number, date, URL)

### Phase D: Dashboard & Public Interface (Week 4-6)

1. **HB 2021 Scorecard page** (`/hb2021`)
   - Utility-by-utility integrity scores
   - Emissions trajectory chart (baseline → target, with actuals)
   - Promise status grid (6 schemas × N utilities)
   - Color-coded: green (KEPT), red (BROKEN), yellow (PENDING), blue (RENEGOTIATED)

2. **Utility detail view** (`/hb2021/:utility_id`)
   - Full promise history for a single utility
   - CEP timeline and status
   - Community benefits breakdown
   - Rate impact trend

3. **Public API endpoints**
   - `GET /api/hb2021/scorecard` — summary for all utilities
   - `GET /api/hb2021/utility/:id` — detail for one utility
   - `GET /api/hb2021/emissions/:utility_id` — emissions trajectory data
   - `GET /api/hb2021/promises` — all promise events for the vertical

---

## Why This Vertical Matters for Promise Engine

### 1. High-stakes, real-world promises
Unlike coffee grind compatibility, HB 2021 promises affect millions of ratepayers, entire communities, and the climate. This proves Promise Engine works for consequential accountability.

### 2. Multiple promise types in one system
Six schemas covering emissions, planning, justice, labor, affordability, and prohibitions — demonstrating the engine's flexibility beyond single-domain use.

### 3. Public transparency use case
This isn't behind-the-scenes enterprise auditing. It's a **public accountability dashboard** — a new category for Promise Engine that complements the enterprise SaaS model.

### 4. Regulatory alignment
HB 2021 compliance is already struggling (Pacific Power CEP rejected, PGE 2030 target uncertain). There's a real gap between legislative intent and utility execution. Promise Engine fills that gap.

### 5. Replicable to other states
Washington (CETA), California (SB 100), New York (CLCPA), and 20+ states have similar clean energy mandates. The `hb2021` vertical becomes a template for `ceta`, `sb100`, etc.

### 6. Promise Theory showcase
This is the clearest demonstration of why obligation-based monitoring fails:
- **Obligation logic:** "Utilities must reduce emissions 80% by 2030" (no one tracks whether it's happening)
- **Promise logic:** "PGE promises 80% reduction → current trajectory shows 27% → gap analysis → integrity score 0.34 → BROKEN at current pace"

---

## Current State of HB 2021 Compliance (As of March 2026)

| Utility | Emissions Reduction (from baseline) | On Track for 2030? | CEP Status |
|---|---|---|---|
| PGE | ~27% | Uncertain — PUC accepted short-term plan, asked for long-term revisions | Partially accepted |
| PacifiCorp | ~13% | **No** — significantly behind | **Rejected** by PUC |
| ESS Providers | Varies | Reporting in progress | N/A |

This data alone tells the story: **the promises are being broken, and there's no unified system tracking it**.

---

## Data Sources

| Source | URL / Reference | Data Available |
|---|---|---|
| Oregon DEQ Clean Energy Targets | oregon.gov/deq | Emissions data, baselines |
| Oregon PUC HB 2021 Implementation | oregon.gov/puc | Docket filings, CEP reviews |
| EIA Form 860/923 | eia.gov | Power plant capacity, generation |
| PGE Clean Energy Plan | PUC Docket | CEP filings, PUC orders |
| PacifiCorp IRP/CEP | PUC Docket | CEP filings, PUC rejection |
| Oregon CUB (Citizens' Utility Board) | oregoncub.org | Consumer advocacy analysis |

---

## Open Questions

1. **Data freshness:** DEQ emissions data has a ~1 year lag. How do we handle the gap between real-time and reported data? Interim estimates from EIA data?

2. **Scope:** Do we track all ESS providers, or start with just PGE and PacifiCorp (the two IOUs that represent the vast majority of retail electricity)?

3. **Public vs. authenticated:** Should the HB 2021 dashboard be fully public (advocacy tool) or require login (enterprise product)?

4. **Community input:** Should we integrate public comment data from PUC dockets as a signal source?

5. **Multi-state expansion:** Build the schema to be Oregon-specific, or abstract it for reuse across state clean energy mandates from the start?

---

## References

- [Oregon PUC HB 2021 Implementation](https://www.oregon.gov/puc/utilities/pages/hb2021-implementation-activities.aspx)
- [Oregon DEQ Clean Energy Targets](https://www.oregon.gov/deq/ghgp/pages/clean-energy-targets.aspx)
- [HB 2021 Enrolled Text](https://olis.oregonlegislature.gov/liz/2021R1/Downloads/MeasureDocument/HB2021/Enrolled)
- [Davis Wright Tremaine Analysis](https://www.dwt.com/blogs/energy--environmental-law-blog/2021/06/oregon-clean-energy-law)
- [Oregon CUB: 100% Clean Electricity Progress](https://oregoncub.org/news/blog/100-clean-electricity-how-are-utilities-doing/2950/)
- [Canary Media: Oregon bill targets 100% clean power by 2040](https://www.canarymedia.com/articles/clean-energy/oregon-bill-adds-labor-and-environmental-justice-provisions-to-100-clean-energy-by-2040-mandate)
- [Sightline Institute: Environmental Justice in Oregon](https://www.sightline.org/2021/09/23/environmental-justice-advocates-lead-oregon-to-100-percent-clean-electricity-future/)
