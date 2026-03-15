# Promise Engine

A trust primitive for commitment networks. Promise Engine applies [Promise Theory](https://en.wikipedia.org/wiki/Promise_theory) (Burgess, 2004) to commitment tracking, auditing, and simulation across domains — from climate legislation to team accountability.

> **Promise Engine** is the open-source core — the schema, simulation engine, graph utilities, and annotation pipeline. **Promise Pipeline** is the product and platform built on Promise Engine, including the hosted dashboards, services, and client-facing tools at [promisepipeline.com](https://promisepipeline.com).

---

## What It Does

- **Map** commitments as typed promises with dependencies, verification, and polarity
- **Verify** promise status against evidence (filing, audit, sensor, self-report)
- **Simulate** cascade effects: when one promise fails, what breaks downstream?
- **Track** personal and team promises with the same universal schema

## Live Demos

- **Oregon HB 2021** — 20 promises, 11 agents, 7 domains, full cascade simulation
- **AI Safety** — Tracking voluntary safety commitments from frontier AI labs
- **Infrastructure SLAs** — Cloud provider uptime and sustainability promises
- **Supply Chain** — Labor, materials, and transparency across global brands

## Products

- **Promise Garden** — Personal promise tracker with rewilding visualization (free)
- **Teams** — Team promise network with capacity simulation and cascade analysis

---

## Quick Start

### Promise Pipeline (Active Development)

```bash
cd promise-pipeline
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Promise Garden

```bash
cd promise-garden
npm install
npm run dev
```

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

## Current State (March 2026)

### What Works

| Component | Status |
|---|---|
| Promise annotation tool (AI-assisted extraction from bill text) | Working |
| Promise network visualization (force-directed graphs) | Working |
| Cascade simulation (toggle promises, see what breaks) | Working |
| Promise Garden (personal promise tracker) | Working |
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
├── promise-pipeline/          # Next.js v2 app (active development)
│   ├── app/                   # Pages and API routes
│   ├── components/            # React components
│   ├── lib/                   # Core logic (types, simulation, data)
│   └── sanity/                # CMS schemas
├── promise-garden/            # Personal promise tracker (Next.js)
├── backend/                   # Flask API (legacy — promise kernel, verification)
├── frontend/                  # React v1 (legacy — original dashboards)
├── docs/                      # Documentation and whitepaper
├── analysis/                  # Analysis scripts
├── .github/workflows/         # CI configuration
├── ROADMAP.md
├── CONTRIBUTING.md
├── TRAINING_BILL_CANDIDATES.md
└── LABELED_DATA_INVENTORY.md
```

---

## Tech Stack

**Promise Pipeline:** Next.js 14+ (App Router), TypeScript (strict), Tailwind CSS, Recharts, Sanity CMS, SVG network graphs, deterministic BFS cascade simulation engine

**Promise Garden:** Next.js, TypeScript, Tailwind CSS, Supabase

**Legacy Platform:** Python 3.9.6, Flask 3.0.0, SQLAlchemy 2.0.25, Alembic, PostgreSQL, React 18.2.0, JWT + bcrypt, Stripe, SendGrid

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
