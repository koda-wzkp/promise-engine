# Extraction Audit Trail: Dodd-Frank Wall Street Reform Act (2010)

## Bill Selection Rationale

Dodd-Frank was selected as the fourth extraction target because:

1. **Domain expansion** — Financial regulation is a new domain with unique agent types (banks, SIFIs, clearinghouses)
2. **Rulemaking complexity** — 398 required rulemakings across multiple agencies; the implementation story IS the promise story
3. **Known rollbacks** — 2018 Economic Growth Act provides "modifier" nodes and demonstrates promise degradation
4. **Mixed outcomes** — Clear successes (derivatives clearing, whistleblower), clear failures (incentive comp rule), and contested outcomes (CFPB)
5. **Causal test** — SVB failure in 2023 provides a natural experiment: was the 2018 rollback causally linked?
6. **New agent types** — Financial regulators (FSOC, CFPB, CFTC), banks, swap dealers — none present in prior extractions

## Extraction Decisions

### Promise Identification

- **32 promises across 10 domains** — Largest extraction so far, reflecting Dodd-Frank's breadth
- **2018 rollback as modifier nodes** — DF-022 and DF-023 use `nodeType: "modifier"` to represent legislative changes that modified the original promise network, consistent with ACA treatment of SCOTUS rulings
- **CFPB as both creation promise and enforcement agent** — DF-009 is the creation commitment; DF-010, DF-011 are CFPB's own promises. This captures the institution's dual role
- **Rulemaking completion as aggregate promises** — DF-020 (SEC) and DF-021 (CFTC) track overall rulemaking progress rather than individual rules
- **Swaps push-out included despite repeal** — DF-028 was repealed in 2015; included as a "repealed" example showing legislative promise reversal

### Omitted Sections

- **Title III details** — OTS abolition transfer mechanics (kept as single promise DF-018)
- **Title V (Insurance)** — Federal Insurance Office created but limited authority; minimal promise network
- **Title VIII (Payment Systems)** — Financial market utility designation; narrow technical scope
- **Title XI (Fed Reserve governance)** — Internal governance reforms; not behavioral promises
- **Individual rulemaking deadlines** — 398 individual deadlines too granular; captured as aggregates

### Ambiguous Cases

1. **CFPB status: "legally_challenged" vs "kept" vs "degraded"** — The CFPB won its Supreme Court funding case (2024) but faces political defunding under Trump 2.0. Classified as "legally_challenged" because the institution's authority remains contested despite legal wins.
2. **Volcker Rule: "modified" vs "kept"** — The core prohibition on proprietary trading remains, but 2018/2020 revisions significantly widened exemptions. Classified as "modified" because the promise changed in substance.
3. **OLA (DF-004): "declared" vs "unverifiable"** — OLA has never been used. Classified as "declared" (authority exists but untested) rather than "unverifiable" (which implies we can't tell). The mechanism exists in law; its efficacy is unknown.
4. **Incentive compensation (DF-030): "declared" vs "violated"** — The rule was mandated but never finalized after 14 years. Classified as "declared" (commitment announced) but this is arguably "violated" since the congressional mandate was ignored.

## Dependency Rationale

| Edge | Type | Rationale |
|------|------|-----------|
| DF-001 → DF-002 | enabling | Enhanced prudential standards are part of the systemic risk framework FSOC oversees |
| DF-002 → DF-003 | prerequisite | Living wills are one component of enhanced prudential standards |
| DF-001 → DF-004 | enabling | OLA is a systemic risk tool coordinated with FSOC |
| DF-006 → DF-007 | enabling | SEFs execute trades that are then centrally cleared |
| DF-006 → DF-008 | enabling | Swap dealer registration operates within the clearing framework |
| DF-009 → DF-010 | prerequisite | Complaint database requires CFPB to exist and be operational |
| DF-009 → DF-011 | prerequisite | UDAAP enforcement requires CFPB's enforcement authority |
| DF-009 → DF-015 | enabling | ATR/QM rule was written and enforced by CFPB |
| DF-015 → DF-016 | enabling | QM definition builds on ATR requirement |
| DF-009 → DF-017 | enabling | Mortgage servicing rules promulgated by CFPB |
| DF-002, DF-024 → DF-025 | enabling | Stress tests assess compliance with capital requirements |
| DF-006 → DF-026 | sequential | SEC derivatives rules follow CFTC's framework |
| DF-012 → DF-032 | enabling | Enhanced SEC enforcement powers complement whistleblower incentives |
| DF-015 → DF-029 | enabling | Credit risk retention aligns incentives created by ATR |
| DF-001 → DF-019 | enabling | OFR provides data infrastructure for FSOC's mission |

## Sources Consulted

| Source | Access Date | Data Used For |
|--------|-------------|---------------|
| Davis Polk Dodd-Frank Progress Report | 2026-03-13 | Rulemaking completion statistics |
| Federal Reserve stress test results | 2026-03-13 | Capital adequacy data, stress test outcomes |
| CFPB Annual Reports (2012-2024) | 2026-03-13 | Consumer relief data, enforcement actions |
| CFPB Consumer Complaint Database | 2026-03-13 | Complaint volume data |
| SEC Office of the Whistleblower | 2026-03-13 | Award data, tip volume |
| CFTC Swaps Reports | 2026-03-13 | Central clearing percentages |
| GAO-23-105576 (SVB post-mortem) | 2026-03-13 | 2018 rollback impact analysis |
| Federal Reserve SVB Review (2023) | 2026-03-13 | Supervisory failure analysis |
| BIS Quarterly Review | 2026-03-13 | Global derivatives market data |
| CII Proxy Access Tracker | 2026-03-13 | Proxy access adoption rates |

## Open Questions for Human Review

1. **SVB causation** — The 2018 rollback exempted SVB from stress testing, and SVB failed. But was the rollback *causal* or were there other factors (supervisory failures, interest rate risk)? The Fed's own report blamed both. How strongly should the dependency edge be drawn?
2. **CFPB political status** — Under Trump 2.0, CFPB enforcement is effectively paused. Should this be captured as a status change to DF-009, or as a separate modifier node (like the 2018 rollback)?
3. **Rulemaking completion baseline** — Davis Polk counts 398 total requirements. Some are reports, not rules. Should we filter to binding regulations only, or include all mandated actions?
4. **Cross-border derivatives** — U.S. derivatives reforms were part of G20 commitments. Should foreign jurisdiction implementation be tracked as related promises?
5. **DF-030 (incentive comp)** — 14 years unfulfilled. Should this be escalated to "violated" rather than "declared"? The congressional mandate was clear; the agencies' non-action is arguably non-compliance.
