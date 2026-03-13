# Extraction Audit Trail: No Child Left Behind / Every Student Succeeds Act (2001/2015)

## Bill Selection Rationale

NCLB/ESSA was selected as the fifth extraction target because:

1. **Domain expansion** — Education is a new policy domain with unique agent dynamics (federal-state-district-school)
2. **Promise network evolution** — NCLB (2001) → Waivers (2011) → ESSA (2015) shows how a promise network can be replaced, not just modified
3. **Impossible target case study** — NCLB's 100% proficiency goal is the definitive example of a structurally impossible promise, providing strong "broken" labels
4. **Achievement data richness** — NAEP and state assessments provide longitudinal outcome data spanning 25 years
5. **COVID natural experiment** — 2022 NAEP "COVID slide" shows how external shocks affect promise networks
6. **Federal-state tension** — Education accountability sits at the intersection of federal mandates and state sovereignty

## Extraction Decisions

### Combined NCLB + ESSA Extraction

NCLB and ESSA are extracted as a single promise network rather than two separate bills because:
- ESSA explicitly replaced NCLB provisions; they share the same statutory authority (ESEA)
- Most ESSA promises directly reference or modify NCLB promises
- The 25-year outcome data spans both laws
- The waiver period (2011-2015) bridges them

NCLB promises are prefixed `NCLB-`, ESSA promises are prefixed `ESSA-`. This makes the temporal evolution visible.

### Promise Identification

- **28 promises across 7 domains** — 15 from NCLB, 1 modifier (Obama waivers), 7 from ESSA, 5 cross-cutting
- **100% proficiency target as a single promise** — NCLB-001 captures the defining (and broken) commitment
- **Obama waivers as modifier node** — NCLB-012 uses `nodeType: "modifier"` because waivers effectively rewrote the law
- **Cross-cutting outcomes extracted** — NCLB-013 (graduation rates), NCLB-014 (ELL), NCLB-015 (SWD) span both laws
- **ESSA's federal authority guardrails** — ESSA-006 is extracted as a promise because it actively constrains federal power, a novel promise type

### Omitted Sections

- **Title II-A (Teacher Quality under ESSA)** — Replaced NCLB's HQ requirement with flexible grants; minimal promise structure
- **Title III (English Language Acquisition)** — Folded into ESSA accountability (captured in NCLB-014)
- **Title IV (21st Century Schools)** — Block grants for various programs; no specific commitments
- **Title V (Rural Education)** — Flexibility provisions; not behavioral promises
- **Individual state accountability plans** — 50 state plans are sub-graphs; captured as aggregate (ESSA-002)

### Ambiguous Cases

1. **NCLB-001 (100% proficiency): "broken" vs "violated"** — Chose "broken" (not met) rather than "violated" (actively breached) because the failure was structural impossibility, not willful non-compliance. No agent could have fulfilled this promise.
2. **NCLB-003 (state standards): "partial" vs "broken"** — All states adopted standards (letter of the law), but variation was so extreme it undermined the purpose. "Partial" captures both the compliance and the failure.
3. **NCLB-013 (graduation rates): "kept" vs "partial"** — 87% is below the 90% aspiration but represents a 14-point increase. Classified as "kept" because the accountability mechanism demonstrably worked, even if the gap to 90% remains.
4. **COVID impact on ESSA promises** — The 2020 testing waiver and 2022 score declines affect multiple promises. Treated as context in notes rather than status changes, because the promises themselves (testing requirements, accountability) resumed.

## Dependency Rationale

| Edge | Type | Rationale |
|------|------|-----------|
| NCLB-002, NCLB-005, NCLB-007 → NCLB-001 | enabling | 100% proficiency depended on AYP mechanism, annual testing, and school choice |
| NCLB-003 → NCLB-002 | prerequisite | AYP definitions required state standards as the baseline |
| NCLB-003 → NCLB-004 | prerequisite | Disaggregated reporting requires assessments aligned to standards |
| NCLB-003 → NCLB-005 | prerequisite | Annual testing measures against state content standards |
| NCLB-002 → NCLB-007 | enabling | School choice triggered by AYP failure status |
| NCLB-002, NCLB-007 → NCLB-008 | sequential | Restructuring follows failed AYP + failed school choice |
| NCLB-001, NCLB-004 → NCLB-009 | enabling | Achievement gap closure depends on proficiency measurement and data transparency |
| NCLB-001, NCLB-002 → NCLB-012 | enabling | Waivers were responses to the failing AYP system |
| ESSA-001 → ESSA-002 | prerequisite | State accountability built on state standards |
| NCLB-005 → ESSA-002 | prerequisite | ESSA accountability uses NCLB's annual testing infrastructure |
| ESSA-002 → ESSA-003 | prerequisite | CSI identification uses state accountability data |
| ESSA-002, NCLB-004 → ESSA-004 | prerequisite | TSI identification requires disaggregated data within accountability |
| ESSA-001 → ESSA-005 | prerequisite | Annual assessments align to state-chosen standards |
| ESSA-003 → ESSA-007 | prerequisite | School improvement funding flows to identified CSI schools |
| NCLB-002, ESSA-002 → NCLB-013 | enabling | Graduation rates tracked within both accountability frameworks |
| NCLB-004, ESSA-002 → NCLB-014 | enabling | ELL outcomes visible through disaggregated data in accountability |
| NCLB-004, ESSA-002 → NCLB-015 | enabling | SWD outcomes visible through disaggregated data in accountability |

## Sources Consulted

| Source | Access Date | Data Used For |
|--------|-------------|---------------|
| NAEP data (nationsreportcard.gov) | 2026-03-13 | Achievement scores, trends, gaps |
| NCES EDFacts data | 2026-03-13 | State assessment data, graduation rates |
| ED ESSA State Plan Dashboard | 2026-03-13 | State accountability plan approvals |
| IES Reading First Impact Study (2008) | 2026-03-13 | Reading First program evaluation |
| Center on Education Policy reports | 2026-03-13 | AYP failure rates, school choice uptake |
| GAO NCLB implementation reports | 2026-03-13 | Highly qualified teacher rates, SES data |
| ED Budget Service data | 2026-03-13 | Title I appropriation levels |
| NCES Mapping State Proficiency Standards | 2026-03-13 | State-NAEP proficiency alignment |
| ED ESEA Flexibility waiver documents | 2026-03-13 | Waiver state counts and conditions |

## Open Questions for Human Review

1. **NCLB/ESSA split** — Should these be two separate training examples rather than one combined extraction? The argument for combined: they're the same statute (ESEA) reauthorized. The argument for separate: they have fundamentally different promise structures.
2. **Common Core** — The Common Core State Standards Initiative (2010) was not federal legislation but was required by Obama waivers (NCLB-012). Should it be a separate extraction or a sub-promise?
3. **COVID adjustment** — Should ESSA promises get a status adjustment for COVID disruption? Testing was waived in 2020. Accountability was paused. How to label promises that were "kept" pre-COVID and "kept" post-COVID but interrupted?
4. **State-level variation** — NAEP shows enormous state variation. Should state-level promise sub-graphs be extracted (e.g., Massachusetts vs. Mississippi accountability implementations)?
5. **Race to the Top** — The 2009 competitive grant program ($4.35B) was not part of NCLB/ESSA but significantly influenced state policy. Should it be included as a modifier?
