# Labeled Data Inventory

**Purpose:** Catalog all hand-annotated promise data in Promise Engine for ML training readiness assessment.

**Last Updated:** 2026-03-11

---

## Summary

| Source | Promise Count | Agent Count | Fields Present | ML-Ready? |
|--------|--------------|-------------|---------------|-----------|
| HB 2021 (frontend) | 20 | 11 | Partial | No — missing dependency edges, structured extraction fields |
| HB 2021 (backend schemas) | 6 schema types | 11 | Rich | Partially — schemas define structure but no instance data in DB |
| AI/ML demo | 12 | 8 | Partial | No — hardcoded, no real data |
| Infrastructure demo | 12 | 7 | Partial | No — hardcoded, no real data |
| Supply Chain demo | 12 | 9 | Partial | No — hardcoded, no real data |
| CODEC (backend) | 1 schema type | — | Minimal | No — single domain, single schema |
| JSON reference schemas | 6 files | — | Schema only | No — no instance data |

**Total labeled promise instances:** 56 (20 real + 36 demo/synthetic)
**Total usable for ML training:** 20 (HB 2021 only)

---

## Detailed Inventory

### 1. HB 2021 Frontend Promises (Primary Training Asset)

**Location:** `frontend/src/pages/HB2021Dashboard.jsx`, lines 20-41

**Count:** 20 promise instances

**Fields present per promise:**

| Field | Type | Example | Present in all 20? |
|-------|------|---------|-------------------|
| `id` | string | "P001" | Yes |
| `ref` | string | "§3(1)(a)" | Yes |
| `promiser` | agent_id | "pge" | Yes |
| `promisee` | agent_id | "ratepayers" | Yes |
| `body` | string | "Reduce GHG emissions 80% below baseline by 2030" | Yes |
| `domain` | string | "Emissions" | Yes |
| `target` | date/null | "2030-12-31" | 10 of 20 (rest null) |
| `status` | enum | "degraded" | Yes |
| `progress` | number/null | 27 | 10 of 20 (rest null) |
| `required` | number/null | 80 | 10 of 20 (rest null) |
| `note` | string | "27% below baseline..." | Yes |

**Status distribution:**

| Status | Count | Meaning |
|--------|-------|---------|
| verified | 5 | On track / completed |
| declared | 4 | Announced, not yet verifiable |
| degraded | 4 | Behind schedule |
| violated | 4 | Off track / failed |
| unverifiable | 3 | No verification mechanism exists |

**Domain distribution:**

| Domain | Count |
|--------|-------|
| Emissions | 7 |
| Planning | 3 |
| Verification | 2 |
| Equity | 4 |
| Affordability | 2 |
| Tribal | 1 |
| Workforce | 1 |

**Fields MISSING for ML training:**

| Field | Why Needed | Current State |
|-------|-----------|--------------|
| `depends_on` | Dependency graph for cascade modeling | Not present. Dependencies described only in narrative insights. |
| `source_text` | Raw legislative text this promise was extracted from | Not present. Only statutory reference (§ number). |
| `extraction_confidence` | For NLP training: how certain is this extraction? | Not present. All manually labeled (100% confidence). |
| `outcome_date` | When was the status last verified? | Not present. Statuses are undated snapshots. |
| `outcome_evidence` | Link to source document proving status | Partially in `note` field, not structured. |
| `structured_target` | Machine-readable target (e.g., {metric: "emissions_pct", value: 80, deadline: "2030-12-31"}) | Partially present (progress/required), but not formalized. |
| `actor_history` | Prior promise-keeping record of this actor | Not present at instance level (IntegrityScore exists in backend). |

### 2. HB 2021 Backend Schemas (Schema Definitions)

**Location:** `backend/app/promise_engine/verticals/hb2021/schemas.py`

**Count:** 6 schema types (not instances — these define the structure, not individual promises)

| Schema ID | Commitment Type | Stakes | Verification | Fields Defined |
|-----------|----------------|--------|-------------|---------------|
| `hb2021.emissions_target` | emissions_reduction | high | automatic | utility_id, reporting_year, baseline, actual/target emissions, data_source |
| `hb2021.clean_energy_plan` | regulatory_filing | high | reported | utility_id, irp_cycle, filing_date, docket, puc_disposition, conditions |
| `hb2021.community_benefits` | community_obligation | high | reported | utility_id, assessment_period, advisory_group, ej_investment, jobs, resiliency |
| `hb2021.labor_standards` | labor_compliance | medium | reported | project_id, capacity_mw, pla, prevailing_wage, worker_count, local_hire |
| `hb2021.rate_impact` | affordability | high | reported | utility_id, rate_year, revenue_requirement, compliance_cost, impact_pct, exemption |
| `hb2021.fossil_fuel_ban` | prohibition | high | automatic | utility_id, review_period, gas_plants_proposed/permitted, expansions |

**ML relevance:** These schemas define the JSON Schema validation rules for each promise type. They can serve as the **output schema** for the NLP extraction model — given legislative text, produce a structured object matching one of these schemas.

### 3. HB 2021 Agents (Backend)

**Location:** `backend/app/promise_engine/verticals/hb2021/agents.py`

**Count:** 11 agents

| Agent ID | Type | Role | Metadata |
|----------|------|------|----------|
| `pge` | BUSINESS | promiser | 930k customers, 27% reduction (2022) |
| `pacificorp` | BUSINESS | promiser | 620k customers, 13% reduction (2022), multi-state |
| `ess` | BUSINESS | promiser | Lighter oversight |
| `oregon_puc` | PLATFORM | verifier | Reviews CEPs, grants exemptions |
| `oregon_deq` | PLATFORM | verifier | Establishes baselines, measures emissions |
| `ratepayers` | COMMUNITY | promisee | Residential, commercial, industrial |
| `ej_communities` | COMMUNITY | promisee | Communities of color, low-income, tribal, rural, coastal |
| `tribes` | COMMUNITY | promisee | Federally recognized tribes |
| `workers` | COMMUNITY | promisee | Clean energy workforce |
| `or_legislature` | PLATFORM | legislator | Enacted HB 2021 |
| `cub` | PLATFORM | auditor | Independent consumer advocacy |

### 4. HB 2021 Narrative Insights (Implicit Dependency Data)

**Location:** `frontend/src/pages/HB2021Dashboard.jsx`, lines 65-78

**Count:** 4 insights, referencing 11 unique promises

These contain **implicit dependency information** that should be formalized:

| Insight | Type | Promise Refs | Implicit Dependencies |
|---------|------|-------------|----------------------|
| "PacifiCorp's entire promise chain is off track" | Cascade | P004, P005, P006, P009 | P009 → P004 → P005 → P006 (sequential chain) |
| "Equity promises have no accountability mechanism" | Gap | P012, P013, P018 | None (structural gap, not dependency) |
| "Clean energy targets vs. affordability" | Conflict | P001, P004, P016, P017 | P001 ↔ P016, P004 ↔ P017 (bidirectional conflict) |
| "The verification system caught the problem" | Working | P010, P011 | P010 → P011 (enables) |

### 5. Emissions Trajectory Data

**Location:** `frontend/src/pages/HB2021Dashboard.jsx`, lines 44-63

**PGE trajectory:** 8 data points (2012-2040), mix of actual (4), projected (4), and target (3)
**PacifiCorp trajectory:** 7 data points (2012-2040), mix of actual (3), projected (4), and target (3)

### 6. Demo Vertical Data (Not ML-Ready)

These are synthetic/illustrative and should NOT be used for training, but their structure shows what the promise schema looks like across domains:

**AI/ML (12 promises):** Hallucination rates, safety scores, latency, compliance — `AIDemoDashboard.jsx:16-29`
**Infrastructure (12 promises):** Uptime SLAs, latency targets, capacity — `InfraDemoDashboard.jsx:15-28`
**Supply Chain (12 promises):** Traceability, ethics scores, deforestation targets — `SupplyChainDemoDashboard.jsx:17-30`

---

## Recommended JSON Schema for ML Training Data

A unified format that works for both promise extraction NLP and outcome prediction:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "LabeledPromise",
  "description": "A hand-annotated promise instance for ML training",
  "type": "object",
  "required": ["id", "vertical", "promiser", "promisee", "body", "domain", "status", "source"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier (e.g., 'hb2021-P001')"
    },
    "vertical": {
      "type": "string",
      "description": "Domain vertical (e.g., 'hb2021', 'esg', 'supply_chain')"
    },

    "promiser": {
      "type": "object",
      "required": ["id", "type"],
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string", "enum": ["business", "platform", "community", "ai_agent", "government"] },
        "name": { "type": "string" }
      }
    },
    "promisee": {
      "type": "object",
      "required": ["id", "type"],
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string" },
        "name": { "type": "string" }
      }
    },

    "body": {
      "type": "string",
      "description": "Natural language statement of the promise"
    },
    "domain": {
      "type": "string",
      "description": "Promise category (e.g., 'emissions', 'planning', 'equity')"
    },
    "commitment_type": {
      "type": "string",
      "enum": ["target", "prohibition", "filing", "obligation", "safeguard", "declaration"],
      "description": "Structural type of the commitment"
    },
    "stakes": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Consequence severity if broken"
    },

    "target": {
      "type": ["object", "null"],
      "description": "Quantified target, if any",
      "properties": {
        "metric": { "type": "string", "description": "What is being measured (e.g., 'emissions_reduction_pct')" },
        "value": { "type": "number", "description": "Target value" },
        "unit": { "type": "string" },
        "deadline": { "type": "string", "format": "date" },
        "baseline_value": { "type": "number" },
        "baseline_date": { "type": "string", "format": "date" }
      }
    },

    "status": {
      "type": "string",
      "enum": ["verified", "declared", "degraded", "violated", "unverifiable", "pending", "renegotiated"],
      "description": "Current outcome status"
    },
    "status_date": {
      "type": "string",
      "format": "date",
      "description": "When status was last assessed"
    },
    "progress": {
      "type": ["number", "null"],
      "description": "Current progress toward target (same unit as target.value)"
    },

    "dependencies": {
      "type": "array",
      "description": "Promises this one depends on",
      "items": {
        "type": "object",
        "required": ["promise_id", "relationship"],
        "properties": {
          "promise_id": { "type": "string" },
          "relationship": { "type": "string", "enum": ["requires", "enables", "constrains", "conflicts"] },
          "strength": { "type": "number", "minimum": 0, "maximum": 1 },
          "propagation": { "type": "string", "enum": ["hard", "soft", "conditional"] }
        }
      }
    },

    "source": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["legislation", "regulation", "contract", "policy", "report", "public_statement"] },
        "document_title": { "type": "string" },
        "section_ref": { "type": "string", "description": "e.g., '§3(1)(a)'" },
        "url": { "type": "string", "format": "uri" },
        "source_text": { "type": "string", "description": "Raw text from which this promise was extracted" },
        "extraction_method": { "type": "string", "enum": ["manual", "semi_auto", "auto"] },
        "extraction_confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },

    "evidence": {
      "type": "string",
      "description": "Human-written explanation of current status with source references"
    },

    "annotation_metadata": {
      "type": "object",
      "properties": {
        "annotator": { "type": "string" },
        "annotation_date": { "type": "string", "format": "date" },
        "review_status": { "type": "string", "enum": ["draft", "reviewed", "verified"] }
      }
    }
  }
}
```

### Example: HB 2021 P001 in Training Format

```json
{
  "id": "hb2021-P001",
  "vertical": "hb2021",
  "promiser": { "id": "pge", "type": "business", "name": "Portland General Electric" },
  "promisee": { "id": "ratepayers", "type": "community", "name": "Oregon Ratepayers" },
  "body": "Reduce GHG emissions 80% below baseline by 2030",
  "domain": "emissions",
  "commitment_type": "target",
  "stakes": "high",
  "target": {
    "metric": "emissions_reduction_pct",
    "value": 80,
    "unit": "percent",
    "deadline": "2030-12-31",
    "baseline_value": 0.428,
    "baseline_date": "2012-01-01"
  },
  "status": "degraded",
  "status_date": "2026-03-11",
  "progress": 27,
  "dependencies": [
    { "promise_id": "hb2021-P008", "relationship": "requires", "strength": 0.8, "propagation": "soft" }
  ],
  "source": {
    "type": "legislation",
    "document_title": "Oregon HB 2021 - 100% Clean Electricity",
    "section_ref": "§3(1)(a)",
    "url": "https://olis.oregonlegislature.gov/liz/2021R1/Downloads/MeasureDocument/HB2021/Enrolled",
    "source_text": "Each electric company and electricity service supplier shall... reduce greenhouse gas emissions... to at least 80 percent below baseline emissions level by 2030",
    "extraction_method": "manual",
    "extraction_confidence": 1.0
  },
  "evidence": "27% below baseline as of 2022. Must reach 80% by 2030. On track but questions remain about Colstrip, gas plants, and market accounting.",
  "annotation_metadata": {
    "annotator": "promise-engine-team",
    "annotation_date": "2026-03-10",
    "review_status": "reviewed"
  }
}
```

---

## Gap Analysis: What's Needed for ML Training

### For Promise Extraction NLP

| Requirement | Status | Action Needed |
|------------|--------|--------------|
| Raw legislative text | Missing | Add `source_text` field — the actual statutory language each promise was extracted from |
| Structured output format | Defined | The schema above serves as the output target |
| Training examples | 20 (HB 2021) | Need 200+ for fine-tuning. Label promises from WA CETA, CA SB 100, NY CLCPA, federal IRA |
| Negative examples | Missing | Need examples of legislative text that does NOT contain promises (definitions, procedures, etc.) |
| Section segmentation | Missing | Need a text segmentation step to identify promise-bearing sections |

### For Outcome Prediction

| Requirement | Status | Action Needed |
|------------|--------|--------------|
| Promise features | Partial | Need structured `target` objects, `commitment_type`, `stakes` for all 20 |
| Actor features | Available | Agent metadata exists in backend; need to join with promises |
| Historical outcomes | Missing | Need time series of status changes, not just current snapshot |
| Cross-domain data | Missing | Need labeled promises from other states/domains for statistical power |
| Dependency graph | Missing | Need formalized edges (see ROADMAP Phase 2) |

### Recommended Next Steps

1. **Convert existing 20 HB 2021 promises to the training JSON format** — adds source_text, structured targets, dependency edges
2. **Label 20-50 promises from Washington CETA** (closest analog to HB 2021) — tests schema generality
3. **Add negative examples** — sections of HB 2021 that are NOT promises (definitions, effective dates, legislative findings)
4. **Build the dependency edges** — formalize the 12+ implicit edges from the narrative insights
5. **Add status timestamps** — even approximate dates for when statuses were determined

---

## Data Source Roadmap for Scale

| Source | Estimated Promise Count | Access | Cost |
|--------|------------------------|--------|------|
| Oregon HB 2021 (done) | 20 | Direct reading | Free |
| Washington CETA (SB 5116) | ~15-20 | Public record | Free |
| California SB 100 | ~10-15 | Public record | Free |
| New York CLCPA | ~15-20 | Public record | Free |
| Federal IRA (climate provisions) | ~30-50 | GovInfo API | Free |
| State clean energy laws (20+ states) | ~200-400 | LegiScan API | $49/mo |
| GovInfo bulk legislative text | Thousands (unlabeled) | GovInfo API | Free |
| Corporate ESG reports (future) | Hundreds | CDP, corporate sites | Varies |

**Target:** 500+ labeled promises across 3+ domains before attempting ML fine-tuning.
