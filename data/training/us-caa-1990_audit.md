# Extraction Audit Trail: Clean Air Act Amendments of 1990

## Bill Selection Rationale

The CAAA 1990 was selected as the third extraction target because:

1. **Domain expansion** — Environment/air quality is a new domain; 35 years of EPA compliance data
2. **Market mechanism diversity** — SO2 cap-and-trade provides a fundamentally different promise type than command-and-control regulations
3. **Multi-title structure** — Seven titles with distinct agent networks and compliance mechanisms
4. **Gold standard success** — Acid rain program is the textbook example of successful environmental regulation, providing strong "kept" labels
5. **Known gaps** — HAP residual risk delays and ozone non-attainment provide "degraded" and "partial" labels
6. **Continuous monitoring** — Title IV's CEMS requirement is the strongest verification infrastructure in any extraction so far

## Extraction Decisions

### Promise Identification

- **30 promises extracted across 8 domains** — Larger than HB 2021 (20) but smaller than Dodd-Frank (32); reflects the law's breadth
- **Acid rain promises separated by phase** — Phase I (CAA-002) and Phase II (CAA-003) extracted separately because they have different agents, timelines, and compliance patterns
- **CFC phase-out as separate domain** — Title VI (Ozone Protection) extracted as distinct from Title I (Air Quality) because agents, mechanisms, and outcomes are completely different
- **EJ provision included despite being implicit** — CAA-030 addresses environmental justice, which wasn't in the 1990 text but has become central to implementation. Included to capture the verification gap.
- **NAAQS review cycle extracted** — CAA-028 is a meta-promise (review standards every 5 years) that generates new obligations. Important for understanding the "moving target" dynamic.

### Omitted Sections

- **Title VIII (Miscellaneous)** — Administrative provisions, no behavioral commitments
- **Specific NESHAP standards** — 174 individual MACT standards are too granular; captured as aggregate (CAA-012)
- **State-specific SIP details** — 50 state implementation plans are sub-graphs; captured as aggregate (CAA-008)
- **Fee schedule provisions** — Revenue mechanisms, not behavioral promises

### Ambiguous Cases

1. **Regional haze (CAA-026)** — 2064 deadline is 74 years from enactment. Classified as "degraded" because early progress is slow despite improvements from SO2/NOx reductions. The goal is correct but the timeline allows indefinite delay.
2. **Economic Incentive Programs (CAA-025)** — Title I authorized trading for criteria pollutants but it was used primarily for NOx, not broadly. Classified as "partial" — the mechanism exists but wasn't adopted as universally as Title IV's SO2 trading.
3. **Enforcement variation by administration (CAA-021)** — Enforcement resources and actions vary 2-3x between administrations. Classified as "kept" because the legal authority and mechanism function; the variation is political, not structural.

## Dependency Rationale

| Edge | Type | Rationale |
|------|------|-----------|
| CAA-001 → CAA-002 | prerequisite | Phase I units operate within the allowance system established by CAA-001 |
| CAA-002 → CAA-003 | sequential | Phase II extends the cap to all units after Phase I demonstrated the mechanism |
| CAA-001 → CAA-004 | enabling | NOx reduction program operates alongside the SO2 trading framework |
| CAA-005 → CAA-001 | verification | CEMS provide the data infrastructure that makes allowance trading enforceable |
| CAA-009, CAA-011, CAA-013 → CAA-006 | enabling | Ozone attainment depends on mobile source controls and HAP reductions |
| CAA-003 → NCLB-005 | prerequisite | State standards must exist before annual testing can measure against them |
| CAA-008 → CAA-016 | prerequisite | State permit programs build on SIP infrastructure |
| CAA-012 → CAA-013 | prerequisite | Industry compliance follows EPA standard promulgation |
| CAA-012, CAA-013 → CAA-014 | sequential | Residual risk reviews follow MACT implementation |
| CAA-018 → CAA-019 | sequential | HCFC phase-out follows CFC phase-out |
| CAA-001, CAA-004, CAA-008 → CAA-026 | enabling | Regional haze improvements depend on SO2, NOx, and SIP progress |

## Sources Consulted

| Source | Access Date | Data Used For |
|--------|-------------|---------------|
| EPA Clean Air Markets Division (AMPD) | 2026-03-13 | SO2/NOx emissions data, allowance auction results |
| EPA Green Book | 2026-03-13 | Non-attainment area designations |
| EPA Air Trends Reports | 2026-03-13 | National air quality trends |
| EPA National Emissions Inventory | 2026-03-13 | HAP emissions reductions |
| EPA ECHO Enforcement Database | 2026-03-13 | Enforcement action counts |
| WMO/UNEP Ozone Assessment (2022) | 2026-03-13 | Ozone recovery projections |
| Schmalensee & Stavins (2013) | 2026-03-13 | Acid rain program cost analysis |
| GAO reports on CAAA implementation | 2026-03-13 | Residual risk review delays, SIP adequacy |

## Open Questions for Human Review

1. **CAA-006 status** — Ozone non-attainment is classified "partial" but could be "degraded" given that 100M+ Americans still live in non-attainment areas. The complication is that the standard has been tightened 3 times since 1990.
2. **Market mechanism collapse** — SO2 allowance prices collapsed after CAIR/CSAPR regulations made the cap non-binding for most units. Should CAA-024 be "degraded" because the market ceased to be the primary compliance driver?
3. **Cross-border effects** — Canadian acid rain improvements are partially attributable to U.S. SO2 reductions. Should cross-border health benefits be captured in outcome data?
4. **PM2.5 standard** — The 1990 CAAA addressed PM10 but not PM2.5 (established 1997). Should the PM2.5 story be included as a gap in the 1990 law or left for a separate extraction?
