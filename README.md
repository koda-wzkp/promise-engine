# Promise Engine

**Accountability infrastructure for systems that make promises.**

Promise Engine turns implicit claims into verifiable commitments. AI models promise not to hallucinate. Utilities promise to cut emissions. Cloud services promise 99.9% uptime. We make those promises auditable.

Built on [Promise Theory](https://en.wikipedia.org/wiki/Promise_theory) (Burgess, 2004) — a formal methodology proven in production at 2,700+ companies via CFEngine and adopted by Cisco for software-defined networking.

> **Promise Engine** is the open-source core — the schema, simulation engine, graph utilities, and annotation pipeline. **Promise Pipeline** is the product and platform built on Promise Engine, including the hosted dashboards, services, and client-facing tools at [promisepipeline.com](https://promisepipeline.com).

---

## What's Here

This repo contains two main systems:

### Promise Pipeline (`/promise-pipeline`)
A **Next.js application** for legislative promise extraction and analysis. This is the active development focus — a tool for decomposing laws into structured promise graphs and training ML models to do it automatically.

- **Annotation tool** (`/annotate`) — AI-assisted extraction of promises from legislative text using Claude
- **Promise network visualization** — interactive force-directed graphs of promise dependency networks
- **Simulation engine** — cascade failure modeling ("what breaks if this promise fails?")
- **Bill analysis pipeline** — structured analysis of state clean energy laws (WA CETA, VA VCEA, NM ETA, and more)

**Tech stack:** Next.js 14, TypeScript, Tailwind CSS, Recharts, Claude API (Anthropic)

### Legacy Platform (`/backend` + `/frontend`)
The original **Flask + React** promise verification platform with:
- Core promise engine (create, verify, query promises)
- HB 2021 civic dashboard (Oregon's 100% Clean Electricity law)
- Integrity scoring system
- PostgreSQL + JSONB storage
- 144 passing tests (Promise Theory axioms, API, security)

---

## Quick Start

### Promise Pipeline (Active Development)

```bash
cd promise-pipeline
npm install

# Create .env.local with your API keys:
# ANTHROPIC_API_KEY=sk-ant-...
# OPENSTATES_API_KEY=... (optional, for legislator data)

npm run dev
```

Open [localhost:3000](http://localhost:3000). Navigate to `/annotate` for the annotation tool.

### Legacy Platform

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your credentials
createdb promise_engine_dev
python run.py  # Runs on :5000

# Frontend (separate terminal)
cd frontend
npm install
npm start  # Runs on :3000
```

---

## The Idea

Everything makes promises. Most systems can't prove they keep them.

A single broken promise rarely matters in isolation. What matters is the **cascade** — how one failure propagates through a network of dependent commitments. A rejected Clean Energy Plan doesn't just mean one utility failed a filing requirement. It means the emissions targets that depend on that plan are now unreachable, the community benefit investments that depend on those targets won't materialize, and the environmental justice communities who were promised protection have no pathway to the outcome the law intended.

Promise Engine makes these cascades visible, queryable, and eventually predictable.

**Three horizons:**

1. **Deterministic simulation** — Model the dependency graph. Toggle a promise to "failed" and propagate effects through the network using graph traversal. No ML required — just making the structure explicit.

2. **Statistical prediction** — Train on historical promise-keeping data. Predict which promises are likely to fail based on actor reliability, structural features, and domain patterns.

3. **Counterfactual reasoning** — "What if this amendment passes?" "What if this actor exits?" "Where should advocacy resources go for maximum leverage?"

---

## Current State (March 2026)

### What Works

| Component | Status |
|---|---|
| Promise annotation tool (AI-assisted extraction from bill text) | Working |
| Promise network visualization (force-directed graphs) | Working |
| Cascade simulation (toggle promises, see what breaks) | Working |
| HB 2021 civic dashboard (20 hand-labeled promises, 11 agents) | Working |
| Core promise engine (verify, log, score, query) | Working |
| Emissions trajectory verification (linear interpolation) | Working |
| Training data pipeline (bill text → structured promises) | Working |
| 144 backend tests (theory axioms + security) | Passing |

### Training Data

- **20 hand-labeled promises** from Oregon HB 2021 (gold standard)
- **15 bill candidates** cataloged for expansion (see `TRAINING_BILL_CANDIDATES.md`)
- **Target:** 500+ labeled promises across 3+ domains before ML fine-tuning
- Bill text collected for WA CETA, VA VCEA, NM ETA

---

## Project Structure

```
promise-engine/
├── promise-pipeline/          # Next.js app (active development)
│   ├── app/                   # Pages and API routes
│   │   ├── annotate/          # AI annotation tool
│   │   ├── networks/          # Promise network visualization
│   │   ├── demo/              # Interactive demos
│   │   └── api/               # API routes (Claude, simulation, etc.)
│   ├── components/            # React components
│   ├── lib/                   # Core logic (simulation, storage, types)
│   └── data/                  # Training data and bill texts
│
├── backend/                   # Flask API (legacy platform)
│   ├── app/
│   │   ├── promise_engine/    # Core engine, verticals, storage
│   │   └── api/               # REST endpoints
│   ├── schemas/               # JSON Schema definitions
│   └── tests/                 # 144 tests
│
├── frontend/                  # React frontend (legacy platform)
│   └── src/
│       ├── pages/             # HB2021, AI, Infra, Supply Chain dashboards
│       └── components/        # Shared UI
│
├── docs/                      # Documentation
│   ├── THEORY.md              # Promise Theory foundations
│   ├── HB2021_SPEC.md         # HB 2021 law specification
│   └── BUILD_REPORT.md        # Technical build report
│
├── ROADMAP.md                 # Project roadmap and architecture plan
├── LABELED_DATA_INVENTORY.md  # ML training data catalog
├── TRAINING_BILL_CANDIDATES.md # Bills to label next
└── CONTRIBUTING.md            # Contribution guide
```

---

## Theoretical Foundation

Promise Engine builds on established research:

**Promise Theory (Burgess, 2004+)** — Autonomous agents cannot be coerced into compliance. Cooperation emerges from voluntary, explicit commitments. "Existing theories based on obligations were unsuitable as they amounted to wishful thinking." Industry adoption: CFEngine (2,700+ companies), Cisco ACI, Kubernetes.

**Promise-Based Management (Sull & Spinosa, HBR 2007)** — "Impositions don't guarantee the outcome." Promises must be voluntary, renegotiable, and verifiable. Culture must allow "I can't do that."

**What Promise Engine adds:**
- Machine-readable promise schemas (JSON Schema)
- Automated verification at scale
- Integrity scores as verifiable trust metrics
- Dependency graph modeling for cascade analysis
- ML pipeline for promise extraction from legislative text

### Key References

- Burgess, M. (2015). *Thinking in Promises*. O'Reilly Media.
- Bergstra, J. A. & Burgess, M. (2019). *Promise Theory: Principles and Applications (2nd ed.)*. XtAxis Press.
- Sull, D. & Spinosa, C. (2007). "Promise-Based Management." *Harvard Business Review*.
- See `docs/THEORY.md` for the full theoretical foundation.

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the detailed plan. Summary:

- [x] **Phase 1:** Static promise dashboards (HB 2021, demo verticals)
- [x] **Phase 1.5:** Annotation tool and training data pipeline
- [ ] **Phase 2:** Dependency graph + cascade simulator
- [ ] **Phase 3:** ML promise extraction (NLP) + outcome prediction
- [ ] **Phase 4:** Full simulation engine (GNNs, counterfactual queries)
- [ ] **Phase 5:** Domain expansion (ESG, supply chain, international climate)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

The most impactful way to contribute right now is **labeling training data** — extracting structured promises from state clean energy laws. See `TRAINING_BILL_CANDIDATES.md` for the bill queue and `LABELED_DATA_INVENTORY.md` for the labeling schema.

---

## License

AGPL-3.0 License. See [LICENSE](LICENSE) for details.
