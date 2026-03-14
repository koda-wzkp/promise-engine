# Promise Engine Roadmap

**Vision:** A promise simulation engine — a tool for modeling interdependent commitments and running counterfactual queries ("what happens to the network if this promise fails?"). The civic/legislative vertical is the proving ground; the architecture is domain-general.

**Theoretical Foundation:** Promise Theory (Burgess, 2004) — promises create directed graphs of agent relationships. Graph theory + set theory foundations. Proven in 2,700+ companies via CFEngine, adopted by Cisco for SDN.

**Last Updated:** 2026-03-14

---

## Strategic Framing

Promise Engine treats policy implementation as a complex system of interdependent commitments. By modeling these commitments as a formal network and training on decades of public legislative data, we move from **reactive accountability** (did they keep their promise?) to **predictive accountability** (will this network of promises produce the intended outcome?).

The core insight: a single broken promise rarely matters in isolation. What matters is the **cascade** — how one failure propagates through a network of dependent commitments.

**Three horizons:**

1. **Deterministic simulation** (Phase 2): Model the dependency graph. Toggle a promise to "failed" and propagate effects through the network using graph traversal. No ML required.

2. **Statistical prediction** (Phase 3): Train on historical promise-keeping data. Predict which promises are likely to fail based on actor reliability, structural features, and domain patterns.

3. **Counterfactual reasoning** (Phase 4): "What if this amendment passes?" "What if this actor exits?" "Where should advocacy resources go for maximum leverage?"

---

## Phase 1: Static Promise Dashboards (DONE)

**Delivered:** January–March 2026

- Hand-annotated promise schemas for HB 2021 (6 schema types, 20 promise instances)
- 11 agents mapped with roles (promiser, promisee, verifier, legislator, auditor)
- Deterministic emissions trajectory verification (linear interpolation with tolerance)
- Core promise engine: verify, log, score, query
- PostgreSQL storage with JSONB flexibility
- 3 demo verticals (AI/ML, Infrastructure, Supply Chain)
- 144 tests (Promise Theory axioms, API, security)

---

## Phase 1.5: Annotation Tool & Training Pipeline (DONE)

**Delivered:** March 2026

- AI-assisted promise annotation tool using Claude
- Promise network visualization (force-directed graphs)
- Interactive cascade simulation
- Bill text collection pipeline (WA CETA, VA VCEA, NM ETA)
- Training bill candidate research (15 bills cataloged, 350–485 estimated promises)
- Next.js promise-pipeline application

---

## Phase 2: Cascade Simulator (NEXT)

**Goal:** Add dependency edges to the promise data model and build a deterministic cascade simulator. When you toggle a promise to "failed," every downstream promise updates its status.

### 2A. Dependency Graph Data Model

```
PromiseDependency {
  source_id: string        // upstream promise
  target_id: string        // downstream promise
  relationship: enum       // "requires" | "enables" | "constrains" | "conflicts"
  strength: float          // 0.0-1.0
  propagation_rule: enum   // "hard" | "soft" | "conditional"
  note: string
}
```

### 2B. Cascade Propagation Engine

BFS/DFS from failed node, updating downstream statuses based on propagation rules. Hard edges cause immediate failure; soft edges cause degradation; conditional edges require evaluating additional context.

### 2C. Interactive Simulation UI

- Promise network visualization (force-directed graph or DAG layout)
- Click a promise node to toggle it to "failed"
- Watch cascade propagate visually
- Side panel shows affected promises and why
- Compare scenarios: "PacifiCorp fixes CEP" vs. "status quo"

### Deliverables

- [ ] `PromiseDependency` model
- [ ] Cascade propagation function
- [ ] Seed HB 2021 dependency edges (12+ edges)
- [ ] Graph API endpoint
- [ ] Simulation API endpoint
- [ ] Frontend network graph with click-to-toggle simulation

---

## Phase 3: ML Foundation

**Goal:** Automate promise extraction and outcome prediction. Build the data pipeline from raw legislative text to promise graph.

### 3A. Promise Extraction NLP

- Fine-tune a model on hand-labeled promise schemas
- Input: section of legislative text
- Output: structured promise object (promiser, promisee, body, domain, target, statutory_ref)
- Start with HB 2021 as gold standard, expand to other state clean energy laws

### 3B. Outcome Prediction

- XGBoost on tabular features (actor type, history, domain, time-to-deadline, magnitude)
- Target: binary (kept vs. broken/degraded/violated)
- Training data: historical promise outcomes from public legislative archives

### 3C. Data Pipeline

```
Raw legislative text (PDF/HTML)
    → Text extraction + section segmentation
    → Promise extraction NLP
    → Structured promise schemas
    → Dependency inference (rule-based first, then learned)
    → Graph construction
    → Analysis / simulation / prediction
```

### Data Sources

All training data comes from public records:
- All US legislation is public domain
- GovInfo, LegiScan, OpenStates provide API access
- State PUC filings are public record

See [TRAINING_BILL_CANDIDATES.md](TRAINING_BILL_CANDIDATES.md) for the bill labeling queue.

### Deliverables

- [ ] Promise extraction model
- [ ] Extraction pipeline: legislative text → promise schemas
- [ ] XGBoost outcome predictor (baseline)
- [ ] Data ingestion from public APIs
- [ ] Evaluation framework (precision/recall on held-out promise extraction)

---

## Phase 4: Simulation Engine

**Goal:** Full counterfactual reasoning over promise networks.

### 4A. Graph Neural Networks

- Node features: promise attributes (domain, status, actor type, time features)
- Edge features: dependency type, strength, propagation rule
- Task: node-level prediction (will this promise be kept?) + link prediction (are these promises dependent?)

### 4B. Counterfactual Query Interface

Natural-language queries over the promise network:
- "What happens if PacifiCorp's CEP is approved on revision?"
- "Which single promise failure causes the most cascade damage?"
- "Where should advocacy resources go for maximum impact?"

### 4C. Actor Reliability Modeling

- Historical promise-keeping patterns per actor
- Cross-domain transfer: "This actor's reliability on emissions promises predicts their reliability on community benefit promises"

### Deliverables

- [ ] GNN model for promise network analysis
- [ ] Counterfactual query parser and executor
- [ ] Actor reliability model
- [ ] Anomaly/contradiction detection
- [ ] Intervention targeting algorithm

---

## Phase 5: Domain Expansion

**Goal:** Prove domain generality by applying the simulation engine to non-legislative verticals.

### Target Domains

- **Corporate ESG commitments** — Fortune 500 net-zero pledges, diversity targets
- **Supply chain promises** — delivery timelines, sustainability certifications
- **International climate agreements** — Paris Agreement NDCs

### Transfer Learning

The dependency graph structure is universal; only node/edge attributes change. Models trained on legislative data should transfer to ESG/supply chain with fine-tuning.

---

## Phase 6: Platform (2027+)

- Promise marketplace: standard schemas for common domains
- Cross-organization promise verification
- Developer SDK: embed promise verification in CI/CD, APIs, contracts
- Regulatory technology: EU AI Act, GDPR compliance reporting

---

## Related Documents

- [LABELED_DATA_INVENTORY.md](LABELED_DATA_INVENTORY.md) — Training data catalog
- [TRAINING_BILL_CANDIDATES.md](TRAINING_BILL_CANDIDATES.md) — Bills to label next
- [docs/THEORY.md](docs/THEORY.md) — Promise Theory foundation
- [docs/HB2021_SPEC.md](docs/HB2021_SPEC.md) — HB 2021 schema design
