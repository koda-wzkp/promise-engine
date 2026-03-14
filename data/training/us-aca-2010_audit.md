# Extraction Audit Trail: Affordable Care Act (2010)

## Bill Selection Rationale

The ACA was selected as the second extraction target because:

1. **Domain expansion** — Health policy is a distinct domain from energy/emissions, expanding the training set
2. **Federal jurisdiction** — First federal bill, adding jurisdiction diversity (vs. Oregon state)
3. **Agent diversity** — 16 agents including new types: judiciary (SCOTUS), insurer, executive (Obama admin), federal agencies (CMS, HHS, IRS)
4. **Extended timeline** — 15 years of implementation data with known outcomes across all status categories
5. **Legal challenge dynamics** — Multiple SCOTUS cases created "modifier" nodes that reshaped the promise network, modeling a new dependency type
6. **Mixed outcomes** — Clear examples of kept, broken, partial, repealed, modified, and legally challenged promises
7. **Scale** — 27 promises with rich dependency structure

## Extraction Decisions

### Promise Identification

- **SCOTUS rulings as modifier nodes** — ACA-025 (NFIB v. Sebelius), ACA-026 (King v. Burwell), ACA-027 (TCJA mandate zeroing) are extracted as promises with `nodeType: "modifier"` because they materially changed the promise network. This extends the base schema.
- **Campaign promise included** — ACA-023 ("reduce premiums by $2,500") is technically a campaign promise, not statutory. Included because it shaped public expectations and provides a "broken" label where the gap between political promise and policy outcome is measurable.
- **Individual mandate as full lifecycle** — ACA-006 tracks from enactment through SCOTUS challenge through repeal, demonstrating the full promise lifecycle.
- **State-level variance captured** — ACA-002 and ACA-007 include `stateVariance` data to capture the federalism dimension.

### Omitted Sections

- **CLASS Act (long-term care)** — Repealed before implementation; provides no outcome data
- **Tanning tax (§10907)** — Minor revenue provision, not a behavioral commitment
- **Detailed insurance plan tier definitions** — Implementation mechanics, not promise-level
- **Nutrition labeling requirements (§4205)** — Tangential to health coverage focus
- **Biosimilar approval pathway (§7002)** — Pharmaceutical regulation, separate domain

### Ambiguous Cases

1. **ACA-012 status: "modified" vs "broken"** — CSR payments were stopped, which could be "broken." But Silver loading created an accidental improvement for subsidy-eligible enrollees. Chose "modified" because the mechanism changed but the outcome partially persisted. This is flagged as the "Paradox" insight.
2. **ACA-016 (Medicare savings)** — Scored as "partial" because savings materialized through different mechanisms than originally specified, and the $716B figure became politically weaponized. The commitment was substantially achieved but contested.
3. **ACA-003 ("keep your plan")** — Could be classified as a "modified" promise since the administration issued a transitional policy. Classified as "broken" because the original promise was unambiguously falsified for ~4-5M enrollees.
4. **ACA-023 (premium reduction)** — The rate of premium increase slowed, so defenders argue the counterfactual is unknowable. Classified as "broken" because premiums increased $8,451 vs. the promised decrease of $2,500 — the actual outcome is measurable regardless of counterfactual.

## Dependency Rationale

| Edge | Type | Rationale |
|------|------|-----------|
| ACA-002, ACA-005, ACA-006, ACA-007, ACA-011, ACA-024 → ACA-001 | enabling | Near-universal coverage depends on the full architecture: Medicaid expansion, pre-existing condition protections, mandate, exchanges, subsidies, and employer mandate |
| ACA-025 → ACA-002 | legal | NFIB v. Sebelius made Medicaid expansion optional, fragmenting coverage architecture |
| ACA-008 → ACA-003 | enabling | EHB requirements caused plan cancellations, breaking the "keep your plan" promise |
| ACA-006, ACA-010 → ACA-005 | enabling | Pre-existing condition protections depend on community rating and individual mandate for risk pool stability |
| ACA-025, ACA-027 → ACA-006 | legal | SCOTUS upheld mandate as tax; TCJA later zeroed the penalty |
| ACA-011 → ACA-007 | enabling | Exchange viability depends on premium tax credits driving enrollment |
| ACA-006 → ACA-010 | enabling | Community rating depends on mandate keeping healthy people in the risk pool |
| ACA-026 → ACA-011 | legal | King v. Burwell preserved subsidies in federal exchange states |
| ACA-011 → ACA-012 | prerequisite | CSR reductions are structured on top of the premium tax credit framework |
| ACA-017, ACA-018 → ACA-016 | enabling | Medicare savings come partly through ACO shared savings and readmission reduction |
| ACA-019 → ACA-017 | enabling | ACO program depends on CMMI innovation infrastructure |
| ACA-008, ACA-009, ACA-017 → ACA-023 | enabling | Premium reduction promise depended on EHB standardization, MLR limits, and delivery reform efficiencies |

### Structural Conflicts (NOT dependency edges)

- **Individual mandate vs. political sustainability** — The mandate was essential for risk pool stability but was the most politically vulnerable provision, ultimately zeroed.
- **EHB requirements vs. plan continuity** — Essential Health Benefits improved coverage quality but directly caused the "keep your plan" failure.
- **Medicare savings vs. political framing** — Real savings were achieved but the $716B figure was used as a political attack, complicating ongoing support.

## Sources Consulted

| Source | Access Date | Data Used For |
|--------|-------------|---------------|
| Congress.gov — ACA enrolled text (HR 3590) | 2025-03-12 | Promise extraction |
| KFF Health Reform tracking | 2025-03-12 | Coverage data, state expansion status |
| CMS Marketplace enrollment reports | 2025-03-12 | ACA-007 enrollment data |
| Census Bureau ACS | 2025-03-12 | Uninsured rate trends |
| CBO scoring reports | 2025-03-12 | ACA-006, ACA-016 fiscal impact |
| SCOTUSblog case files | 2025-03-12 | ACA-025, ACA-026 legal analysis |
| CMS MSSP performance year data | 2025-03-12 | ACA-017 ACO outcomes |
| GAO reports on ACA implementation | 2025-03-13 | ACA-014 small business credit uptake |
| KFF Employer Health Benefits Survey | 2025-03-13 | ACA-023 premium trends |
| HHS reports on ACA impact | 2025-03-13 | Pre-existing conditions, young adult coverage |
| IRS individual mandate data | 2025-03-13 | ACA-006 penalty revenue |

## Open Questions for Human Review

1. **ACA-001 target assessment** — The "near-universal" goal implied ~3% uninsured. Current 7.2% is much better than pre-ACA 16% but still far from universal. Is "partial" the right status, or should this be "degraded"?
2. **Modifier node treatment** — ACA-025, ACA-026, ACA-027 extend the base schema with `nodeType: "modifier"`. Should this be formalized in the training schema or kept as an ACA-specific extension?
3. **State-level extraction** — Medicaid expansion created 50+ state-level promise sub-networks. Should state-level implementation be extracted as separate bills or as sub-graphs of the federal ACA?
4. **ACA-020 (preventive services)** — Braidwood Management v. Becerra is ongoing. Status may change from "legally_challenged" to "modified" or "partially_repealed" depending on ruling.
5. **Enhanced subsidies (ARP)** — The American Rescue Plan (2021) enhanced ACA subsidies but is temporary legislation. Should ARP be a separate extraction or treated as a modifier of ACA-011?
