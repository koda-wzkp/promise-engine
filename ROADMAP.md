# Promise Engine Roadmap

**Vision:** A promise simulation engine — a tool for modeling interdependent commitments and running counterfactual queries ("what happens to the network if this promise fails?"). The civic/legislative vertical is the proving ground; the architecture is domain-general.

**Theoretical Foundation:** Promise Theory (Burgess, 2004) — promises create directed graphs of agent relationships. Graph theory + set theory foundations. Proven in 2,700+ companies via CFEngine, adopted by Cisco for SDN.

**Last Updated:** 2026-03-11

---

## Strategic Framing

Promise Engine treats policy implementation as a complex system of interdependent commitments. By modeling these commitments as a formal network and training on decades of public legislative data, we move from **reactive accountability** (did they keep their promise?) to **predictive accountability** (will this network of promises produce the intended outcome?).

The core insight: a single broken promise rarely matters in isolation. What matters is the **cascade** — how one failure propagates through a network of dependent commitments. A rejected Clean Energy Plan doesn't just mean one utility failed a filing requirement. It means the emissions targets that depend on that plan are now unreachable, the community benefit investments that depend on those targets won't materialize, and the environmental justice communities who were promised protection have no pathway to the outcome the law intended.

Promise Engine makes these cascades visible, queryable, and eventually predictable.

**Three horizons:**

1. **Deterministic simulation** (Phase 2): Model the dependency graph. Toggle a promise to "failed" and propagate effects through the network using graph traversal. No ML required — just making the structure explicit.

2. **Statistical prediction** (Phase 3): Train on historical promise-keeping data. Predict which promises are likely to fail based on actor reliability, structural features, and domain patterns. XGBoost on tabular features, then GNNs on the full graph.

3. **Counterfactual reasoning** (Phase 4): "What if this amendment passes?" "What if this actor exits?" "Where should advocacy resources go for maximum leverage?" Full simulation engine over the promise network.

---

## Current State Audit (March 2026)

### What's Built

| Component | Status | Location |
|---|---|---|
| **Core promise engine** | Production | `backend/app/promise_engine/core/` |
| Promise schemas (PromiseSchema) | Production | `core/models.py:320-355` |
| Promise events (PromiseEvent) | Production | `core/models.py:72-152` |
| Integrity scoring (IntegrityScore) | Production | `core/models.py:188-231` |
| Verification engine | Production | `core/engine.py` (422 lines) |
| PostgreSQL + JSONB storage | Production | `storage/models.py`, `storage/repository.py` |
| Schema versioning | Production | `storage/models.py:48-76` |
| **HB 2021 vertical** | Production | `verticals/hb2021/` |
| 6 promise schemas (emissions, CEP, community, labor, rates, fossil ban) | Complete | `verticals/hb2021/schemas.py` (549 lines) |
| 11 agents (utilities, regulators, communities, legislature, auditor) | Complete | `verticals/hb2021/agents.py` (199 lines) |
| Emissions trajectory verifier | Complete | `verticals/hb2021/verification.py` (183 lines) |
| **HB 2021 dashboard (frontend)** | Production | `frontend/src/pages/HB2021Dashboard.jsx` |
| 20 hand-annotated promises with status, progress, statutory refs | Complete | Lines 20-41 |
| 11 agents with roles and types | Complete | Lines 6-18 |
| Emissions trajectory charts (PGE + PacifiCorp) | Complete | Lines 44-63 |
| 4 narrative insights (cascade, gap, conflict, working) | Complete | Lines 65-78 |
| 5-tab dashboard (Summary, Trajectory, Promises, Insights, About) | Complete | — |
| **Demo verticals (frontend only)** | Demo | `frontend/src/pages/` |
| AI/ML dashboard (12 promises, 8 agents) | Hardcoded demo | `AIDemoDashboard.jsx` |
| Infrastructure SLA dashboard (12 promises, 7 agents) | Hardcoded demo | `InfraDemoDashboard.jsx` |
| Supply Chain dashboard (12 promises, 9 agents) | Hardcoded demo | `SupplyChainDemoDashboard.jsx` |
| **JSON schema files** | Reference | `backend/schemas/` |
| ML: hallucination_check, policy_adherence | Reference schemas | `schemas/ml/` |
| IoT: state_verification, schedule_adherence | Reference schemas | `schemas/iot/` |
| Infra: uptime_sla, latency_sla | Reference schemas | `schemas/infra/` |
| **API layer** | Production | `backend/app/api/` |
| POST /verify, POST /log, GET /integrity, GET /schemas | Working | `api/promise.py` |
| GET /hb2021/dashboard (with static fallback) | Working | `api/hb2021.py` |
| Auth (register, login, me) | Scaffolded | `api/auth.py` |
| **CODEC vertical** | Production | `verticals/codec/schemas.py` |
| Grind-roast compatibility schema | Working | 1 schema |
| **Deployment** | Live | promise.pleco.dev |
| Vercel (frontend) + Railway (backend + Postgres) | Working | — |

### What's Stubbed / Partially Built

| Component | State | Gap |
|---|---|---|
| HB 2021 API ↔ frontend | Falls back to hardcoded | API returns static data; frontend doesn't consume live DB data for promises |
| Auth flow | Forms exist, JWT scaffolded | No protected routes, no session management |
| CX journey tracking (TouchpointDB, JourneyDB) | Tables exist | No API endpoints, no frontend, no data |
| Vouching/trust network (VouchingDB) | Table exists | No API, no logic, no UI |
| Promise delta / leak detection | Model exists (`PromiseDelta`) | No integration, no UI |
| Training data export | Field exists (`training_eligible`, `exported_at`) | No export pipeline |
| Living Room Wines | Commerce demo page | Not connected to backend |

### What's Missing (for simulation engine)

| Component | Priority | Notes |
|---|---|---|
| **Dependency edges between promises** | CRITICAL | No `depends_on` field. No graph structure. Cascades are described in narrative text only. |
| **Graph data structure** | CRITICAL | No adjacency list, no edge table, no traversal logic |
| **Promise toggle / what-if simulation** | HIGH | Can't set a promise to "failed" and see what breaks |
| **NLP extraction pipeline** | MEDIUM | All promises hand-annotated. No automated extraction from legislative text. |
| **Historical data** | MEDIUM | Only current-year snapshots. No time series of promise status changes. |
| **Actor reliability model** | MEDIUM | IntegrityScore exists but no historical training data to populate it |
| **Contradiction/anomaly detection** | LOW | No logic to detect conflicting promises |
| **Multi-state replication** | LOW | HB 2021 schema is Oregon-specific |

---

## Phase 1: Static Promise Dashboards (DONE)

**Delivered:** January–March 2026

- Hand-annotated promise schemas for HB 2021 (6 schema types, 20 promise instances)
- 11 agents mapped with roles (promiser, promisee, verifier, legislator, auditor)
- Deterministic emissions trajectory verification (linear interpolation with tolerance)
- Public dashboard at promise.pleco.dev/hb2021
- Core promise engine: verify, log, score, query
- PostgreSQL storage with JSONB flexibility
- 3 demo verticals (AI/ML, Infrastructure, Supply Chain) showing domain generality
- CODEC coffee subscription vertical (production)

---

## Phase 2: HB 2021 Cascade Simulator (NEXT)

**Goal:** Add dependency edges to the promise data model and build a deterministic cascade simulator. When you toggle a promise to "failed," every downstream promise updates its status. No ML — pure graph traversal.

### 2A. Dependency Graph Data Model

**Add to the promise schema:**

```
PromiseDependency {
  source_id: string        // upstream promise (e.g., P009 — CEP rejected)
  target_id: string        // downstream promise (e.g., P004 — emissions target)
  relationship: enum       // "requires" | "enables" | "constrains" | "conflicts"
  strength: float          // 0.0-1.0 — how strongly source failure affects target
  propagation_rule: enum   // "hard" (target fails if source fails)
                           // "soft" (target degrades if source fails)
                           // "conditional" (depends on other factors)
  note: string             // human explanation
}
```

**HB 2021 dependency edges to encode (from the existing narrative insights):**

| Source | Target | Relationship | Strength | Rule |
|--------|--------|-------------|----------|------|
| P009 (PAC CEP rejected) | P004 (PAC 2030 target) | requires | 1.0 | hard |
| P004 (PAC 2030) | P005 (PAC 2035) | requires | 1.0 | hard |
| P005 (PAC 2035) | P006 (PAC 2040) | requires | 1.0 | hard |
| P008 (PGE CEP degraded) | P001 (PGE 2030 target) | enables | 0.8 | soft |
| P001 (PGE 2030) | P002 (PGE 2035) | requires | 1.0 | hard |
| P002 (PGE 2035) | P003 (PGE 2040) | requires | 1.0 | hard |
| P001 (PGE emissions) | P016 (PGE affordability) | constrains | 0.6 | conditional |
| P004 (PAC emissions) | P017 (PAC affordability) | constrains | 0.6 | conditional |
| P016/P017 (affordability) | P001/P004 (emissions) | conflicts | 0.7 | conditional |
| P010 (DEQ verification) | P011 (PUC review) | enables | 0.9 | soft |
| P014 (PGE advisory group) | P012 (EJ minimization) | enables | 0.4 | soft |
| P015 (PAC advisory group) | P012 (EJ minimization) | enables | 0.4 | soft |

### 2B. Cascade Propagation Engine

```python
# Pseudocode for deterministic cascade
def propagate_failure(graph, failed_promise_id):
    """BFS/DFS from failed node, updating downstream statuses."""
    queue = [failed_promise_id]
    affected = {}
    while queue:
        current = queue.pop(0)
        for edge in graph.outgoing_edges(current):
            target = edge.target_id
            if edge.propagation_rule == "hard":
                affected[target] = "violated"
                queue.append(target)
            elif edge.propagation_rule == "soft":
                if target not in affected:
                    affected[target] = "degraded"
                    queue.append(target)
            # "conditional" requires evaluating additional context
    return affected
```

### 2C. Interactive Simulation UI

- Promise network visualization (force-directed graph or DAG layout)
- Click a promise node to toggle it to "failed"
- Watch cascade propagate visually (animated edge highlighting)
- Side panel shows: which promises are affected, how, and why
- "Reset" button to restore original state
- Compare scenarios: "PacifiCorp fixes CEP" vs. "status quo"

### 2D. Database Changes

- New table: `promise_dependencies` (source_id, target_id, relationship, strength, propagation_rule, note)
- New API: `GET /api/v1/hb2021/graph` — returns promise nodes + dependency edges
- New API: `POST /api/v1/hb2021/simulate` — accepts a set of toggled promises, returns cascade results
- Add `depends_on` field to frontend promise data (hardcoded initially, then from API)

### Deliverables

- [ ] `PromiseDependency` model in `core/models.py`
- [ ] `promise_dependencies` table in `storage/models.py`
- [ ] Alembic migration for new table
- [ ] Cascade propagation function in `core/engine.py`
- [ ] Seed HB 2021 dependency edges (12+ edges from the table above)
- [ ] Graph API endpoint (`GET /hb2021/graph`)
- [ ] Simulation API endpoint (`POST /hb2021/simulate`)
- [ ] Frontend: network graph visualization
- [ ] Frontend: click-to-toggle simulation with cascade animation
- [ ] Frontend: scenario comparison view

---

## Phase 3: ML Foundation

**Goal:** Begin automating promise extraction and outcome prediction. Build the data pipeline from raw legislative text to promise graph.

### 3A. Promise Extraction NLP

**Task:** Given raw legislative text, extract structured promise schemas.

**Approach:**
- Fine-tune a BERT variant (Legal-BERT or similar) or Mistral 7B on hand-labeled promise schemas
- Input: section of legislative text (e.g., "Each electric company and electricity service supplier shall... reduce greenhouse gas emissions associated with electricity...")
- Output: structured promise object (promiser, promisee, body, domain, target_date, required_value, statutory_ref)
- Start with HB 2021 as gold standard, expand to other state clean energy laws

**Training data source:** The hand-labeled HB 2021 promises (see LABELED_DATA_INVENTORY.md)

### 3B. Simple Outcome Prediction

**Task:** Given a promise's features, predict likelihood of fulfillment.

**Approach:**
- XGBoost on tabular features (first pass — no graph structure needed)
- Features: actor type, actor history, domain, time-to-deadline, required magnitude, political context
- Target: binary (kept vs. broken/degraded/violated)
- Training data: historical promise outcomes from public legislative archives

**Data sources:**
- GovInfo API (federal legislation text + status)
- ProPublica Congress API (bill tracking, vote records)
- LegiScan (state legislation across all 50 states)
- OpenStates API (state legislator data)

### 3C. Data Pipeline

```
Raw legislative text (PDF/HTML)
    → Text extraction + section segmentation
    → Promise extraction NLP (3A)
    → Structured promise schemas
    → Dependency inference (rule-based first, then learned)
    → Graph construction
    → Analysis / simulation / prediction
```

### 3D. Ethical Dataset Strategy

**Public data only for training:**
- All US legislation is public domain
- GovInfo, ProPublica, LegiScan provide free API access
- State PUC filings are public record

**Client data flywheel:**
- Every client dashboard = supervised training data (promises labeled with outcomes)
- Anonymized and aggregated patterns from client engagements
- Build this into Terms of Service: "aggregate, anonymized patterns may be used to improve the platform"
- Never expose individual client data; only statistical patterns

**Labeled data accumulation:**
- HB 2021: 20 promises (Phase 1)
- Other state clean energy laws: ~200 promises (can be hand-labeled using HB 2021 as template)
- Federal climate legislation (IRA, etc.): ~50 promises
- **Target for ML training:** 500+ labeled promises across domains before fine-tuning

### Deliverables

- [ ] Promise extraction model (fine-tuned on labeled legislative promises)
- [ ] Extraction pipeline: legislative text → promise schemas
- [ ] Tabular feature engineering for outcome prediction
- [ ] XGBoost outcome predictor (baseline model)
- [ ] Data ingestion from GovInfo/ProPublica/LegiScan APIs
- [ ] Evaluation framework (precision/recall on held-out promise extraction)
- [ ] Ethics documentation and data governance policy

---

## Phase 4: Simulation Engine

**Goal:** Full counterfactual reasoning over promise networks using graph neural networks.

### 4A. Graph Neural Networks

- PyTorch Geometric or DGL for GNN implementation
- Node features: promise attributes (domain, status, actor type, time features)
- Edge features: dependency type, strength, propagation rule
- Task: node-level prediction (will this promise be kept?) + link prediction (are these promises dependent?)
- Transfer learning: train on legislative domain, fine-tune for infrastructure/supply chain

### 4B. Counterfactual Query Interface

Natural-language-style queries over the promise network:
- "What happens if PacifiCorp's CEP is approved on revision?"
- "What if the 6% rate cap is raised to 10%?"
- "Which single promise failure causes the most cascade damage?"
- "Where should advocacy resources go for maximum impact on the 2030 target?"

**Implementation:** Query → graph manipulation → cascade propagation (deterministic + probabilistic) → result summary

### 4C. Actor Reliability Modeling

- Historical promise-keeping patterns per actor (from IntegrityScore time series)
- Actor embedding: learn latent representation of actors from their promise-keeping behavior
- Cross-domain transfer: "PacifiCorp's reliability on emissions promises predicts their reliability on community benefit promises"

### 4D. Anomaly & Contradiction Detection

- Detect conflicting promises (e.g., "reduce emissions 80%" vs. "keep rates within 6%" when the math doesn't work)
- Flag structural impossibilities in the promise network
- Alert when new promises create contradictions with existing ones

### 4E. Intervention Targeting

- Identify highest-leverage nodes: which promises, if fulfilled, would unlock the most downstream value?
- Advocacy resource allocation: given a budget, which actors/promises should advocates focus on?
- Compute "cascade value" of each node: how much of the network depends on this promise?

### Deliverables

- [ ] GNN model for promise network analysis
- [ ] Counterfactual query parser and executor
- [ ] Actor reliability model with historical training
- [ ] Anomaly/contradiction detection pipeline
- [ ] Intervention targeting algorithm
- [ ] Interactive "what-if" UI with probabilistic outcomes

---

## Phase 5: Domain Expansion

**Goal:** Prove domain generality by applying the promise simulation engine to non-legislative verticals.

### Target Domains

**Corporate ESG Commitments**
- Fortune 500 net-zero pledges, diversity targets, supply chain promises
- Source: corporate sustainability reports, CDP disclosures, Science Based Targets initiative
- Same promise graph structure: actor → commitment → deadline → verification → cascade

**Supply Chain Promises**
- Delivery timelines, sustainability certifications, labor standards
- Source: supplier contracts, certification databases (Fairtrade, B Corp, FSC)
- Network structure: brand → tier-1 supplier → tier-2 supplier → raw material

**International Climate Agreements**
- Paris Agreement NDCs (Nationally Determined Contributions)
- Country → sector → emission target → verification mechanism
- Cascade: if major emitters fail NDCs, global temperature targets fail

### Transfer Learning Strategy

- Domain-general promise ontology: {agent, commitment, deadline, verification_mechanism, dependency}
- Domain-specific features plug into generic slots
- Models trained on legislative data transfer to ESG/supply chain with fine-tuning
- The dependency graph structure is universal; only node/edge attributes change

### Deliverables

- [ ] ESG vertical: schema definitions + demo dashboard
- [ ] Supply chain vertical: dependency graph from brand to raw material
- [ ] Climate agreement vertical: NDC promise network
- [ ] Transfer learning evaluation: legislative → ESG prediction accuracy
- [ ] Domain-general promise ontology specification

---

## Phase 6: Platform (2027+)

**Vision:** Promise Engine as infrastructure layer for the autonomous systems era.

- Promise marketplace: standard schemas for common domains
- Cross-organization promise verification (B2B trust networks)
- Promise certificates: cryptographic proof of promise-keeping
- Developer SDK: embed promise verification in CI/CD, APIs, contracts
- Regulatory technology: EU AI Act, GDPR, financial services monitoring
- Insurance/risk: evidence layer for cyber insurance, SLA insurance

---

## Data Model Assessment: Cascade Simulation Readiness

### What Exists

The current data model supports:
- **Promise schemas** with verification rules (6 types for HB 2021)
- **Promise events** as atomic records (individual verification results)
- **Agents** with types and metadata
- **Integrity scores** per agent (aggregate promise-keeping rate)
- **Status tracking**: KEPT, BROKEN, PENDING, BLOCKED, RENEGOTIATED

### What's Missing for Cascade Simulation

**1. Dependency edges (CRITICAL)**

No field, table, or data structure represents "promise A depends on promise B." The HB 2021 dashboard describes cascades in narrative text (Insight #1: "PacifiCorp's entire promise chain is off track") but this knowledge is not machine-readable.

**Required:** A `promise_dependencies` table or edge list that stores:
- Source promise ID → target promise ID
- Relationship type (requires, enables, constrains, conflicts)
- Propagation strength (0.0-1.0)
- Propagation rule (hard failure, soft degradation, conditional)

**2. Promise instance registry (MODERATE)**

The 20 HB 2021 promises exist only as hardcoded JavaScript arrays in the frontend (`HB2021Dashboard.jsx:20-41`). They are not stored in the database as queryable records. The backend has `PromiseEventDB` for individual verification events but no "master list of promises" that a simulation could operate on.

**Required:** Either:
- A `promise_instances` table (distinct from `promise_events` — instances are the commitments themselves, events are individual verification results)
- Or: use `promise_events` with a convention that the latest event per schema+promiser represents current state

**3. Graph traversal logic (MODERATE)**

No BFS/DFS/topological sort logic exists in the codebase. The `PromiseEngine` class handles verification and logging but has no concept of propagation.

**Required:** A `CascadeSimulator` class that:
- Loads the dependency graph
- Accepts a set of "toggled" promise IDs
- Runs BFS from each toggled node
- Returns the set of affected promises with their new statuses

**4. Status history / time series (LOW for Phase 2, HIGH for Phase 3)**

Promise statuses are point-in-time snapshots. There's no history of when a promise changed from "declared" to "degraded" to "violated." This matters for ML training but not for deterministic simulation.

### Minimum Viable Changes for Phase 2

1. Add `promise_dependencies` table (new migration)
2. Add `promise_instances` table or repurpose existing structures
3. Seed HB 2021 dependency edges (12+ from the audit)
4. Write `CascadeSimulator` class (~100 lines)
5. Add 2 API endpoints (graph, simulate)
6. Frontend: consume graph data, render network, handle click-to-toggle

**Estimated scope:** The dependency graph can be built with ~500 lines of new backend code and a frontend graph visualization component. No ML, no new infrastructure — just a new table, a BFS function, and a visualization.

---

## Related Documents

- [LABELED_DATA_INVENTORY.md](LABELED_DATA_INVENTORY.md) — Inventory of hand-annotated promise data for ML training
- [docs/THEORY.md](docs/THEORY.md) — Promise Theory theoretical foundation
- [docs/HB2021_SPEC.md](docs/HB2021_SPEC.md) — HB 2021 law specification and schema design
- [PROMISE_THEORY_FOUNDATIONS.md](PROMISE_THEORY_FOUNDATIONS.md) — Promise Theory from academic sources
- [README.md](README.md) — Technical documentation

---

## Risk Factors

### "Graph traversal is trivial — where's the moat?"

The moat isn't the BFS algorithm. It's:
1. **The labeled data**: hand-annotated promise schemas with real-world outcomes
2. **The domain expertise**: knowing what constitutes a "dependency" in legislative, ESG, and supply chain contexts
3. **The data flywheel**: every client dashboard generates training data for the ML models
4. **The network effects**: cross-domain transfer learning improves all verticals simultaneously

### "Legislative data is too sparse for ML"

True for individual laws. But across 50 states × 20+ years × multiple policy domains, there are thousands of legislative promises with known outcomes. The key is the labeling schema — once you define what a "legislative promise" looks like structurally, you can extract them at scale from public archives.

### "Why not just use a knowledge graph tool?"

Knowledge graphs model what IS. Promise Engine models what SHOULD BE and whether it happened. The simulation and prediction layers are fundamentally different from querying a static knowledge base.

---

**Next Review:** After Phase 2 dependency graph is implemented
