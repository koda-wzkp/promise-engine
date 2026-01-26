# Promise Engine Roadmap

**Mission:** Build universal auditing infrastructure for autonomous systems that make promises.

**Theoretical Foundation:** Promise Theory (Burgess, 2004) - proven in 2,700+ companies via CFEngine, adopted by Cisco for SDN, discussed by Tim O'Reilly.

---

## Phase 1: Foundation (✅ Complete - January 2026)

### Core Infrastructure
- [x] Promise creation, verification, and querying API
- [x] PostgreSQL with JSONB for flexible promise storage
- [x] Integrity scoring system (trust capital, recovery rate)
- [x] JSON Schema validation for promise types

### CODEC Vertical (First Customer)
- [x] Coffee subscription validation (grind/roast compatibility)
- [x] Live in production serving real roasters
- [x] 0% commission model (vs. 10% on Table22)

### Deployment
- [x] Frontend: promise.pleco.dev (Vercel)
- [x] Backend: Railway with PostgreSQL
- [x] Domain configured and SSL enabled

### Positioning
- [x] Rebranded as "Universal Auditing Infrastructure"
- [x] Landing page with Promise Theory explanation
- [x] Real industry statistics (not fabricated vanity metrics)
- [x] Multi-domain promise schemas (AI/ML, IoT, Infrastructure, Supply Chain)

---

## Phase 2: Enterprise Validation (Q1 2026)

### Goal: Prove Promise Engine's value for intelligent audit triage

**Key Insight from Promise Theory:** "Obligation theories amounted to wishful thinking" (Burgess, 2005). You can't *command* autonomous systems—you can only *verify* their promises.

### Target Customers

**Living Room Wines** (Portland wine bar)
- [x] CODEC Wine demo built (codec.pleco.dev/demo/livingroom-wines)
- [ ] Connect to backend for real checkout
- [ ] Deploy as production wine club
- [ ] Upsell: Living Room Coffee combo membership

**Enterprise AI Teams**
- [ ] Target: Companies deploying LLMs facing EU AI Act compliance (Aug 2026)
- [ ] Value prop: $149-$499/mo continuous monitoring vs. $200K-$800K quarterly audits
- [ ] 400× ROI by preventing one unnecessary audit

**IoT/Smart Home Companies**
- [ ] Target: Device manufacturers with "Did it actually lock?" problems
- [ ] Integration: Home Assistant plugin
- [ ] Value prop: Independent verification of device behavior

### Features

**Evidence-Ready Audit Trails**
- [ ] Export compliance reports for SOC2, EU AI Act
- [ ] Timestamp + cryptographic verification of promise events
- [ ] Gap analysis: promised vs. actual behavior

**Real-Time Alerting**
- [ ] Slack integration for broken promises
- [ ] Webhook support for custom integrations
- [ ] Configurable thresholds (integrity score drops, SLA breaches)

**Training Data Export**
- [ ] ML teams want failures as training signal
- [ ] Export broken promises → fine-tuning datasets
- [ ] Close the loop: audit failures improve models

---

## Phase 3: Multi-Domain Expansion (Q2 2026)

### Verticals Beyond Coffee

**Wine** (Living Room Wines - in progress)
- Tier-based memberships
- Frequency options (monthly, quarterly, annual)
- Member reviews and upsells

**Infrastructure Monitoring**
- SLA verification (uptime, latency)
- Independent of vendor reporting
- Prove 99.9% or catch the gap

**Supply Chain**
- Delivery promise verification
- Sustainability claim auditing
- End-to-end visibility (only 6% of companies have this)

**AI/ML Compliance**
- Hallucination tracking
- Policy adherence (EU AI Act, content filters)
- Model drift detection

**IoT/Smart Home**
- State verification (did device reach promised state?)
- Schedule adherence (did automation run on time?)
- Building management at scale

**PromiseCRM** (Future)
- Sales rep promises to customers
- Super-agent model: rep aggregates fulfillment team promises
- Integrity scores for individual reps
- Dependency visibility: rep promise valid only if team can promise support
- Renegotiation workflow built-in

**PB-OKR: Promise-Based OKRs** (Future)
- Apply Promise Engine to organizational goal-setting
- OKRs as promise chains
- Proposal → negotiation → commitment workflow
- Traffic light status (green/yellow/red) per objective
- Renegotiation tracking ("It's OK to say 'I can't do that'")
- Team/org integrity scores
- Integration with Linear, Asana, Notion

**Status:** Conceptual verticals
**Priority:** After CODEC, Living Room Wines, and Enterprise AI validated

### Schema Library (Open Source?)

**Consideration:** Open-source promise schema definitions
- Increases adoption
- Community contributions
- Standard schemas for common domains
- Promise Engine backend remains proprietary

**Schemas to Publish:**
- `ml/hallucination_check.json`
- `ml/policy_adherence.json`
- `iot/state_verification.json`
- `iot/schedule_adherence.json`
- `infra/uptime_sla.json`
- `infra/latency_sla.json`

---

## Phase 4: Academic Partnership & Thought Leadership (Q2-Q3 2026)

### Goal: Establish Promise Engine as the canonical implementation of Promise Theory for compliance

**Why This Matters:**
- Promise Theory has 20+ years of academic research
- No commercial product has operationalized it for AI/IoT auditing
- First-mover advantage in a proven framework

### Deliverables

**Whitepaper** (Target: ArXiv + company website)
- Title: "Promise Engine: Operationalizing Promise Theory for AI Compliance and IoT Auditing"
- Authors: Promise Engine team + Mark Burgess (if willing to collaborate)
- Length: 15-20 pages
- Content:
  - Promise Theory recap
  - Why existing monitoring tools use obligation logic (and fail)
  - Promise Engine architecture as Promise Theory implementation
  - Case studies: AI hallucination detection, IoT state verification, SLA auditing
  - EU AI Act alignment

**Academic Collaborations**
- [ ] Contact Mark Burgess (Promise Theory originator)
- [ ] Contact Oslo University (Promise Theory research group)
- [ ] Contact Jan Bergstra (co-author on Promise Theory books)
- [ ] Offer Promise Engine as research platform for studying autonomous systems

**Conference Presentations**
- [ ] DevOps conferences (CFEngine/Puppet/Chef audience)
- [ ] AI Safety conferences (alignment with EU AI Act)
- [ ] IoT security conferences (smart home verification)

**Blog Series: "Promise Theory in Practice"**
1. Why CFEngine uses promises (configuration management)
2. Why Cisco uses promises (SDN/ACI)
3. Why Promise Engine uses promises (auditing autonomous systems)
4. The Boeing 737 Max case: What Promise Theory reveals about safety

---

## Phase 5: Enterprise Scale (Q3-Q4 2026)

### Features for $499/mo "SCALE" and Enterprise Tiers

**Multiple Environments**
- Dev/staging/prod promise tracking
- Compare integrity scores across environments
- Catch issues before production

**Advanced Analytics**
- Time-series analysis of integrity scores
- Correlation: Which broken promises predict others?
- Anomaly detection: When does behavior deviate from promises?

**Custom Verification Logic**
- Python/JavaScript sandbox for custom verifiers
- Example: ML team wants domain-specific hallucination detection
- Example: IoT team wants custom state validation

**On-Prem Deployment**
- Docker/Kubernetes deployment
- Air-gapped installations for regulated industries
- Customer-controlled data (GDPR, HIPAA)

**Compliance Reports**
- Auto-generate SOC2 evidence
- EU AI Act Article 52 compliance (transparency requirements)
- ISO 42001 (AI management system standard)

---

## Phase 6: Platform Play (2027+)

### Vision: Promise Engine as infrastructure layer for the autonomous systems era

**Promise Theory Predicts:**
- More systems will be autonomous (AI agents, IoT swarms, microservices)
- Centralized control will fail at scale
- Promise-based coordination will dominate
- Verification becomes critical infrastructure

### Platform Features

**Promise Marketplace**
- Standard promise types for common use cases
- Community-contributed schemas
- Verification logic as a service

**Promise Network Effects**
- Cross-organization promise verification
- Supply chain: Vendor promises verified by customer's Promise Engine
- B2B trust: "We verify each other's promises"

**Promise Certificates**
- Cryptographic proof of promise-keeping
- Auditable evidence for compliance
- Transferable trust credentials

### Adjacent Markets

**Developer Tools**
- Promise Engine SDK for embedding verification
- CI/CD integration: Block deployments if promises broken
- IDE plugins: "Your code promises X, but tests show Y"

**Insurance/Risk**
- Cyber insurance wants proof of security promises
- SLA insurance wants independent uptime verification
- Provide evidence layer for risk assessment

**Regulatory Technology (RegTech)**
- EU AI Act compliance as a service
- GDPR Article 35 (DPIA) automation
- Financial services monitoring (promises about trading behavior)

---

## Key Milestones & Success Metrics

### 2026 Q1 (Enterprise Validation)
- **Goal:** 10 paying customers across 3 verticals
- **Metric:** $25K MRR (monthly recurring revenue)
- **Evidence:** Living Room Wines deployed, 5 AI teams, 3 IoT companies

### 2026 Q2 (Multi-Domain)
- **Goal:** Schema library published, 50 customers
- **Metric:** $100K MRR
- **Evidence:** Open-source schemas have 1,000+ stars on GitHub

### 2026 Q3 (Thought Leadership)
- **Goal:** Whitepaper published, academic partnerships established
- **Metric:** 10,000+ whitepaper downloads, cited in 3+ academic papers
- **Evidence:** Mark Burgess endorsement, conference keynote invitations

### 2026 Q4 (Enterprise Scale)
- **Goal:** 3 Enterprise customers ($5K+ MRR each)
- **Metric:** $250K MRR
- **Evidence:** Fortune 500 company using Promise Engine for AI compliance

### 2027 (Platform)
- **Goal:** 500+ customers, promise marketplace launched
- **Metric:** $1M+ MRR
- **Evidence:** Community-contributed schemas, cross-org promise verification

---

## Risk Factors & Mitigations

### Risk 1: "Monitoring tools already exist"

**Mitigation:**
- Most tools use obligation logic ("system must do X")
- Promise Engine uses Promise Theory ("system promises X, did it deliver?")
- Differentiation: We audit *autonomous* systems that can't be controlled

### Risk 2: "EU AI Act might not be enforced strictly"

**Mitigation:**
- Multi-vertical strategy (not just AI compliance)
- Infrastructure/IoT auditing has value regardless
- First penalties won't hit until 2027-2028, but prep starts now

### Risk 3: "Promise Theory is too academic"

**Mitigation:**
- Don't lead with theory—lead with pain (hallucinations, broken SLAs)
- Promise Theory is credibility layer, not sales pitch
- CFEngine proves 2,700+ companies adopted it successfully

### Risk 4: "Hard to get first customers"

**Mitigation:**
- CODEC proves concept (real revenue from coffee roasters)
- Living Room Wines as second vertical
- Use CODEC + Living Room as proof points for Enterprise

---

## Technical Debt & Architecture Evolution

### Current Architecture Limitations

**Monolithic Backend**
- Flask app handles everything
- Won't scale past 1M events/day
- Need: Microservices for verification, storage, analytics

**No Real-Time Processing**
- Verification happens on API calls
- Won't work for IoT (millions of events/second)
- Need: Kafka/Pulsar for event streaming

**Limited Query Performance**
- PostgreSQL JSONB works for now
- Won't scale to time-series analytics
- Need: TimescaleDB or ClickHouse for time-series

### Refactoring Roadmap

**Q2 2026: Event Streaming**
- Add Kafka for high-throughput promise events
- Keep PostgreSQL for promise definitions/schemas
- ClickHouse for analytics queries

**Q3 2026: Microservices**
- Split: API Gateway, Verification Engine, Storage, Analytics
- Independent scaling based on load
- Kubernetes for orchestration

**Q4 2026: Multi-Tenancy**
- Separate databases per Enterprise customer
- On-prem deployment uses same codebase
- Tenant isolation for compliance

---

## Open Questions

### Business Model

**Should we open-source the core engine?**
- **Pro:** Increases adoption, builds community, establishes standard
- **Con:** Harder to monetize, Enterprise customers want support
- **Hybrid:** Open-source schemas + verification logic, closed-source SaaS platform?

**What's the pricing ceiling?**
- Current: $49-$499/mo for SMBs, "Custom" for Enterprise
- Comparable: Datadog $500K+/year for large deployments
- Question: Can we charge $50K-$100K/year for Enterprise?

### Technical Direction

**Should we build a domain-specific language (DSL) for promises?**
- JSON Schema works but is verbose
- A promise DSL could be more expressive
- Risk: Yet another config language to learn

**Should we integrate with existing observability tools?**
- Datadog, New Relic, Grafana integrations
- Promise Engine as plugin vs. replacement
- Opportunity: "Observability tells you *what* happened, Promise Engine tells you *if promises were kept*"

---

## Success Definition

**Promise Engine succeeds when:**

1. **"Promise-based auditing" becomes a recognized category** (like "configuration management" post-CFEngine)

2. **EU AI Act compliance teams default to Promise Engine** (like how CI/CD defaults to GitHub Actions)

3. **Academic papers cite Promise Engine** as the reference implementation of Promise Theory for compliance

4. **We prevent a major AI failure** by catching broken promises before harm (our "Therac-25 moment")

5. **Fortune 500 companies trust us** with their most critical promise verification

---

## Related Documents

- [docs/THEORY.md](docs/THEORY.md) - Comprehensive theoretical foundation (Burgess + Sull/Spinosa)
- [PROMISE_THEORY_FOUNDATIONS.md](PROMISE_THEORY_FOUNDATIONS.md) - Promise Theory from Wikipedia
- [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) - Production deployment info
- [README.md](README.md) - Technical documentation
- Landing page: [promise.pleco.dev](https://promise.pleco.dev)

---

**Last Updated:** 2026-01-26
**Next Review:** Q1 2026 (after Living Room Wines deployment)
