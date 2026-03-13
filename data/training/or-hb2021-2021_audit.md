# Extraction Audit Trail: Oregon HB 2021

## Bill Selection Rationale

Oregon HB 2021 was selected as the first extraction target because:

1. **Structural clarity** — The bill has a clear mandate structure with named utilities (PGE, PacifiCorp), specific percentage targets (80/90/100%), and defined deadlines (2030/2035/2040)
2. **Verification infrastructure** — Oregon DEQ and PUC provide public regulatory filings that serve as ground truth
3. **Known failure case** — PacifiCorp's cascade failure provides labeled "violated" examples across a dependency chain
4. **Verification gaps** — Equity and tribal promises lack verification mechanisms, providing "unverifiable" labels
5. **Moderate complexity** — 20 promises, 11 agents, 7 domains — large enough for graph structure, small enough for thorough manual review

## Extraction Decisions

### Promise Identification

- **Emissions targets extracted as separate promises per utility** — PGE and PacifiCorp have identical statutory language but completely different compliance trajectories. Extracting separately enables per-agent tracking.
- **Clean Energy Plans as distinct promises** — The CEP filing requirement (§4) is a prerequisite for emissions targets, not part of them. Extracting separately reveals the dependency structure.
- **Equity provisions extracted despite vagueness** — P012, P013, P018 use qualified language ("to the maximum extent practicable") but represent real legislative commitments. Their unverifiable status IS the finding.
- **ESS targets grouped** — Electricity Service Suppliers have lighter oversight and a single combined promise (P007) rather than the three-tier structure of investor-owned utilities.

### Omitted Sections

- **Definitions (§1)** — Context only, no commitments
- **Severability clause** — Standard boilerplate
- **Effective date provisions** — No behavioral commitments
- **Fee schedule details** — Implementation mechanics, not promise-level commitments

### Ambiguous Cases

1. **Affordability (P016, P017)** — The 6% rate impact cap (§10) is a safety valve, not a promise by utilities. We extracted the utilities' general affordability commitment instead, noting the structural conflict with emissions targets in the insights.
2. **Tribal consultation (P018)** — Could be read as aspirational legislative intent rather than an enforceable commitment. Extracted because it creates an expectation that tribes can reference, even without enforcement mechanisms.
3. **Responsible contractor standards (P019)** — Applies only to projects ≥10MW, creating a gap for smaller projects. Extracted the commitment as-is and noted the gap.

## Dependency Rationale

| Edge | Type | Rationale |
|------|------|-----------|
| P008 → P001 | prerequisite | PGE cannot implement emissions changes without an approved Clean Energy Plan specifying the generation mix transition |
| P010 → P001 | verification | DEQ's emissions verification provides the measurement infrastructure for assessing PGE's compliance |
| P001 → P002 | sequential | 2035 target requires 2030 trajectory to be on track |
| P002 → P003 | sequential | 2040 terminal target depends on 2035 milestone |
| P009 → P004 | prerequisite | Same as P008→P001 but for PacifiCorp |
| P010 → P004 | verification | Same verification dependency for PacifiCorp |
| P004 → P005 | sequential | PacifiCorp 2035 depends on 2030 trajectory |
| P005 → P006 | sequential | PacifiCorp 2040 depends on 2035 trajectory |
| P010 → P007 | verification | ESS targets need DEQ verification infrastructure |
| P018 → P008 | enabling | PGE's plan should incorporate tribal consultation input |
| P018 → P009 | enabling | PacifiCorp's plan should incorporate tribal consultation input |
| P010 → P011 | prerequisite | PUC review depends on DEQ providing verified emissions data |
| P014, P015 → P012 | enabling | Equity outcomes depend on advisory groups being operational |
| P019 → P013 | enabling | Workforce equity depends on contractor standards being applied |
| P008, P009 → P019 | prerequisite | Labor standards apply to projects arising from approved clean energy plans |

### Structural Conflicts (NOT dependency edges)

- **Emissions vs. Affordability** — P001/P004 targets and P016/P017 affordability promises are in structural tension. The 6% rate cap safety valve could override emissions compliance.
- **PacifiCorp multi-state vs. Oregon mandates** — PacifiCorp serves 6 states; Oregon's mandates create allocation conflicts not present for PGE.

## Sources Consulted

| Source | Access Date | Data Used For |
|--------|-------------|---------------|
| Oregon Legislature (OLIS) — HB 2021 enrolled text | 2025-03-10 | Promise extraction |
| Oregon PUC — Clean Energy Plan dockets | 2025-03-10 | P008, P009 status |
| Oregon DEQ — GHG reporting orders | 2025-03-10 | P010 status, emissions data |
| PGE 2023 IRP | 2025-03-11 | P001 progress, P008 status |
| PacifiCorp 2023 IRP | 2025-03-11 | P004 progress, P009 status |
| Oregon PUC — Rate case filings | 2025-03-11 | P016, P017 status |
| Oregon PUC — UCBIAG reports | 2025-03-11 | P014, P015 status |

## Open Questions for Human Review

1. **P001 progress accuracy** — 27% reduction as of 2022 is the latest confirmed figure. PGE's 2023 IRP projects higher, but actual 2023 data not yet published. Should we use projected or confirmed?
2. **P007 (ESS) status** — Classified as "declared" due to lighter oversight, but ESS entities may have compliance data we haven't located. Worth investigating Oregon ESS reporting.
3. **Tribal consultation mechanism** — P018 is unverifiable by design, but are there any tribal government reports or testimony that could provide partial verification?
4. **Workforce outcomes** — P013 and P019 could potentially be verified through Oregon Bureau of Labor and Industries data on clean energy project employment. Not yet investigated.
