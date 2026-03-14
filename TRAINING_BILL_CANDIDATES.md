# Training Bill Candidates for Promise Engine

**Purpose:** Catalog state clean energy laws and federal legislation suitable for expanding Promise Engine's training data beyond Oregon HB 2021. Each bill is assessed for extractable promises, structural similarity to HB 2021, and public data availability.

**Last Updated:** 2026-03-14

---

## Context

Promise Engine currently has **20 hand-labeled promises** from Oregon HB 2021 (see [LABELED_DATA_INVENTORY.md](LABELED_DATA_INVENTORY.md)). The ML training pipeline (ROADMAP Phase 3) requires **500+ labeled promises** across 3+ domains before fine-tuning. This document identifies the best legislative sources for that expansion.

### Oregon HB 2021 Structure (Comparison Baseline)

HB 2021 contains these structural elements used for similarity scoring:

| Element | HB 2021 Implementation |
|---|---|
| Utility-specific emissions targets | 80%/90%/100% by 2030/2035/2040 |
| Clean Energy Plan filing requirements | Per IRP cycle, PUC-reviewed |
| Community benefit obligations | Advisory groups, EJ investment, biennial assessment |
| Labor standards | Prevailing wage, apprenticeship for projects >10 MW |
| Rate impact cap | 6% of annual revenue requirements |
| Fossil fuel generation ban | No new gas plants |
| Responsible parties | PGE, PacifiCorp, DEQ, PUC, community advisory groups |

---

## Priority Tiers

### Tier 1: Highest Structural Similarity + Richest Data

Best candidates to label next — closest structural parallels, most extractable promises, best public compliance data.

### Tier 2: Strong Candidates

Good promise density and some structural overlap, but either broader scope or less utility-specific granularity.

### Tier 3: Useful but Less Structurally Rich

Valuable for diversity of training data but fewer extractable promises or weaker structural match to HB 2021's mandate model.

---

## Tier 1 Bills

### 1. Washington Clean Energy Transformation Act (CETA) — SB 5116

| Field | Detail |
|---|---|
| **Citation** | SB 5116, codified as RCW 19.405 |
| **Jurisdiction** | Washington State |
| **Year enacted** | 2019 |
| **Core commitments** | Coal elimination by 2025; GHG-neutral electricity by 2030 (up to 20% alternative compliance); 100% clean electricity by 2045 |
| **Responsible parties** | All WA utilities (IOUs + consumer-owned PUDs/munis); WA UTC; WA Dept. of Commerce |
| **Rate impact cap** | ~2% of weather-adjusted sales revenue |
| **Equity provisions** | Mandatory assessment of impacts on vulnerable populations and highly impacted communities; equitable distribution of benefits |
| **Labor provisions** | Tax incentives for projects employing women, minorities, veterans; prevailing wage encouragement |
| **Compliance penalties** | $150/MWh (coal non-compliance); $84/MWh (gas peaker) or $60/MWh (combined-cycle) alternative compliance |
| **Estimated promises** | **25–35** |
| **HB 2021 similarity** | **VERY HIGH** — closest analog. Utility-specific obligations, quantified targets with deadlines, 4-year CEIPs filed with regulators, equity requirements, rate caps, workforce provisions |
| **Full text** | [WA Legislature](https://app.leg.wa.gov/billsummary?BillNumber=5116&Year=2019&Initiative=false) |
| **Compliance data** | [WA Commerce CETA](https://www.commerce.wa.gov/energy-policy/electricity-policy/ceta/) — CEIPs publicly filed; [WA UTC CETA](https://www.utc.wa.gov/regulated-industries/utilities/energy/conservation-and-renewable-energy-overview/clean-energy-transformation-act-ceta) |
| **Data richness** | **EXCELLENT** — utility-specific CEIPs publicly available, Commerce reporting templates, 4-year compliance cycle |

**Why label first:** Closest structural analog to HB 2021. Utility-specific clean energy implementation plans (CEIPs) are the direct equivalent of HB 2021's Clean Energy Plans. The 4-year filing cycle creates natural verification checkpoints. Rate cap mechanics mirror HB 2021's 6% cap. The best bill to test whether HB 2021 promise schemas generalize.

---

### 2. Virginia Clean Economy Act (VCEA) — HB 1526 / SB 851

| Field | Detail |
|---|---|
| **Citation** | HB 1526 / SB 851 (2020) |
| **Jurisdiction** | Virginia |
| **Year enacted** | 2020 |
| **Core commitments** | Dominion: 100% renewable by 2045; ApCo: 100% by 2050; coal shutdowns by 2030; biomass by Dec 31, 2028; all fossil fuel by 2045; 16,000 MW solar/onshore wind; 5,200 MW offshore wind; 3,100 MW storage by 2035; energy efficiency 5% savings (Dominion) / 2% (ApCo) by 2025; 73% clean by 2035 |
| **Responsible parties** | Dominion Energy Virginia; Appalachian Power (ApCo); VA SCC; DMME |
| **Equity provisions** | Non-compliance penalties fund EJ community job training; offshore wind local hiring from disadvantaged communities; reporting on disproportionate burden |
| **Estimated promises** | **35–45** |
| **HB 2021 similarity** | **VERY HIGH** — utility-specific obligations (Dominion vs. ApCo mirrors PGE vs. PacifiCorp), quantified MW targets, plant closure schedules by fuel type, equity penalty allocations, capacity mandates |
| **Full text** | [VA Legislature](https://lis.virginia.gov/bill-details/20201/HB1526) |
| **Compliance data** | [VA Clean Economy Act](https://www.vacleaneconomy.org/); VA SCC docket filings; utility IRP filings |
| **Data richness** | **GOOD** — SCC proceedings public, utility IRP filings available |

**Why label early:** The Dominion vs. ApCo split directly parallels PGE vs. PacifiCorp — two utilities in one state with different targets and timelines. MW capacity mandates (solar, offshore wind, storage) add a promise type not present in HB 2021, expanding schema coverage. Plant closure dates by fuel type are highly structured and extractable.

---

### 3. Illinois Climate and Equitable Jobs Act (CEJA) — SB 2408

| Field | Detail |
|---|---|
| **Citation** | SB 2408, Public Act 102-0662 |
| **Jurisdiction** | Illinois |
| **Year enacted** | 2021 |
| **Core commitments** | Carbon-free power sector by 2045; 100% clean energy by 2050; private coal/oil plant closure by Jan 1, 2030; all private gas plants by 2045; municipal coal 45% reduction by 2035; 40% renewable by 2030, 50% by 2040; $694M nuclear subsidies; 2,500 MW energy storage target |
| **Responsible parties** | IL EPA; IL Commerce Commission (ICC); IL DCEO; Exelon/ComEd; Ameren; municipal utilities |
| **Equity provisions** | **Very strong** — equity-eligible communities prioritized, workforce training programs, Displaced Energy Worker Bill of Rights, Coal-to-Solar program |
| **Labor provisions** | Prevailing wage, workforce training, ethics standards for utilities |
| **Rate impact** | Estimated $3–4/month per customer over 5 years |
| **Estimated promises** | **40–55** |
| **HB 2021 similarity** | **HIGH** — utility-specific obligations, plant-specific closure deadlines, equity/labor provisions, rate considerations. ~1,000 pages = extremely rich for extraction |
| **Full text** | [IL Legislature](https://www.ilga.gov/legislation/BillStatus.asp?DocNum=2408&GAID=16&DocTypeID=SB&SessionID=110&GA=102) |
| **Compliance data** | [IL DCEO CEJA](https://dceo.illinois.gov/ceja.html); [IL EPA CEJA](https://epa.illinois.gov/topics/ceja.html); ICC proceedings |
| **Data richness** | **GOOD** — multiple agency tracking, ICC proceedings publicly docketed |

**Why label early:** Highest raw promise count of any state bill (~40–55). Plant-specific closure deadlines are the most structured, unambiguous promise type — ideal for training precision. The Displaced Energy Worker Bill of Rights and Coal-to-Solar program introduce "transition promise" schemas not present in HB 2021.

---

### 4. New York Climate Leadership and Community Protection Act (CLCPA)

| Field | Detail |
|---|---|
| **Citation** | S.6599/A.8429 (2019), codified in Environmental Conservation Law and Public Service Law |
| **Jurisdiction** | New York |
| **Year enacted** | 2019 |
| **Core commitments** | 70% renewable electricity by 2030; 100% zero-emission electricity by 2040; economy-wide GHG: 40% reduction by 2030, 85% by 2050 (from 1990 levels), net-zero by 2050; 9,000 MW offshore wind by 2035; 6,000 MW distributed solar by 2025; 3,000 MW energy storage by 2030 |
| **Responsible parties** | 22-member Climate Action Council; NYSDEC; NY PSC; NYSERDA; Just Transition Working Group; Climate Justice Working Group |
| **Equity provisions** | **Strong** — 40% minimum of climate/energy funding to disadvantaged communities; dedicated Justice and Just Transition working groups |
| **Estimated promises** | **30–40** |
| **HB 2021 similarity** | **HIGH** — strong equity mandates, quantified targets, multiple responsible parties, but economy-wide scope (not utility-specific) makes promise extraction broader |
| **Full text** | [NY Legislature](https://legislation.nysenate.gov/pdf/bills/2019/S6599) |
| **Compliance data** | [NY Climate Act](https://climate.ny.gov); [Columbia Law Scoping Plan Tracker](https://climate.law.columbia.edu/Scoping-Plan-Tracker); NYSERDA dashboards |
| **Data richness** | **EXCELLENT** — Columbia Law Scoping Plan Tracker is one of the best public tracking tools for any state climate law |

**Why label early:** The Columbia Law Scoping Plan Tracker provides near-turnkey verification data — it tracks implementation recommendation by recommendation. The 40% EJ funding mandate is a measurable, verifiable promise type with clear beneficiaries. MW capacity targets (offshore wind, solar, storage) are highly structured.

---

## Tier 2 Bills

### 5. New Mexico Energy Transition Act (ETA) — SB 489

| Field | Detail |
|---|---|
| **Citation** | SB 489 (2019) |
| **Jurisdiction** | New Mexico |
| **Year enacted** | 2019 |
| **Core commitments** | IOUs: 40% renewable by 2025, 50% by 2030, 80% by 2040, 100% zero-carbon by 2045; Co-ops: 50% by 2030, 80% renewable / 100% carbon-free by 2050; San Juan Generating Station replacement (650 MW solar + 300 MW battery) |
| **Responsible parties** | PNM; El Paso Electric; Southwestern Public Service; rural co-ops; NM PRC |
| **Equity provisions** | Transition funds for workers; workforce development; apprenticeship requirements with diversity emphasis |
| **Consumer protection** | Securitization to reduce ratepayer costs of coal retirement |
| **Estimated promises** | **20–30** |
| **HB 2021 similarity** | **HIGH** — utility-specific RPS targets, different timelines for IOUs vs. co-ops, workforce/apprenticeship requirements, transition funding |
| **Full text** | [NM Legislature](https://www.nmlegis.gov/Sessions/19%20Regular/bills/senate/SB0489.html) |
| **Compliance data** | NM PRC dockets; utility IRP filings; [LPDD resource](https://lpdd.org/resources/new-mexicos-energy-transition-act/) |
| **Data richness** | **GOOD** |

**Key training value:** Differentiated IOU vs. co-op targets test schema flexibility. Coal securitization mechanics introduce financial promise types.

---

### 6. Massachusetts Climate Roadmap — Chapter 8 of Acts of 2021

| Field | Detail |
|---|---|
| **Citation** | Chapter 8 of the Acts of 2021 |
| **Jurisdiction** | Massachusetts |
| **Year enacted** | 2021 |
| **Core commitments** | GHG: 33% below 1990 by 2025, 50% by 2030, 75% by 2040, net-zero by 2050 (min 85% real reductions); sector-specific sublimits (residential, commercial, transportation, gas distribution, industrial); 4,000 MW offshore wind by June 30, 2027; RPS increase 3%/year 2025–2029; Municipal Light Plants: 50% clean by 2030, 75% by 2040, net-zero by 2050; $12M/year clean energy workforce funding |
| **Responsible parties** | EEA Secretary; DOER; DPU; Municipal Light Plants; CEC; retail electricity suppliers |
| **Equity provisions** | Enhanced MEPA review for EJ communities; clean energy equity workforce program |
| **Estimated promises** | **30–40** |
| **HB 2021 similarity** | **MODERATE-HIGH** — sector sublimits add granularity; MLP-specific targets parallel utility-specific approach; workforce funding mandates |
| **Compliance data** | [Mass.gov CECPs](https://www.mass.gov/info-details/massachusetts-clean-energy-and-climate-plan-for-2025-and-2030) |
| **Data richness** | **GOOD** — CECPs publicly available, sector sublimit tracking, DOER reporting |

**Key training value:** Sector sublimits are a unique promise structure — economy-wide target decomposed into sector-specific mandates. Tests whether promise schemas can handle hierarchical decomposition.

---

### 7. Minnesota 100% Clean Electricity Standard — HF 7

| Field | Detail |
|---|---|
| **Citation** | HF 7 (2023) |
| **Jurisdiction** | Minnesota |
| **Year enacted** | 2023 |
| **Core commitments** | Public utilities: 80% carbon-free by 2030; other utilities: 60% by 2030; all utilities: 90% by 2035, 100% by 2040; 55% eligible renewable energy by 2035; prevailing wage for large wind/solar; streamlined siting |
| **Responsible parties** | All MN electric utilities (IOUs, munis, co-ops); MN PUC; MN Dept. of Commerce |
| **Differentiated targets** | Public utilities vs. smaller munis/co-ops get different 2030 targets (80% vs. 60%) |
| **Compliance flexibility** | PUC may grant 2-year extensions for good cause |
| **Estimated promises** | **15–25** |
| **HB 2021 similarity** | **MODERATE-HIGH** — differentiated targets by utility type, prevailing wage, PUC oversight, 5-year benchmark reporting |
| **Compliance data** | [MN Commerce](https://mn.gov/commerce/energy/clean/cleanelectricity2040/) |
| **Data richness** | **GOOD** — 5-year benchmark reporting required; PUC filings available |

**Key training value:** Most recent major clean energy law (2023). Differentiated utility-type targets test schema generality. Extension criteria introduce "renegotiation" promise semantics.

---

### 8. Michigan Clean Energy and Jobs Act — PA 229/231/233–235

| Field | Detail |
|---|---|
| **Citation** | PA 229, 231, 233–235 (2023) |
| **Jurisdiction** | Michigan |
| **Year enacted** | 2023 |
| **Core commitments** | 50% renewable by 2030; 60% by 2035; 100% clean by 2040; 2,500 MW storage; streamlined state-level siting authority for large projects |
| **Responsible parties** | All MI utilities; MPSC; MI Dept. of Environment, Great Lakes, and Energy |
| **Equity provisions** | Workforce transition office; community benefit provisions |
| **Estimated promises** | **20–30** |
| **HB 2021 similarity** | **HIGH** — utility filing requirements, storage targets, siting authority, workforce transition |
| **Data richness** | **GOOD** — MPSC filings available |

**Key training value:** Siting authority provisions introduce a regulatory-structural promise type. Workforce transition office parallels HB 2021's community benefit advisory groups.

---

## Tier 3 Bills

### 9. California SB 100

| Field | Detail |
|---|---|
| **Citation** | SB 100 (De Leon), Chapter 312, Statutes of 2018 |
| **Jurisdiction** | California |
| **Year enacted** | 2018 |
| **Core commitments** | RPS: 33% by 2020, 44% by 2024, 52% by 2027, 60% renewable by 2030; 100% clean electricity by 2045 |
| **Responsible parties** | IOUs (PG&E, SCE, SDG&E), POUs, CCAs, ESPs; CPUC; CEC; CARB |
| **Estimated promises** | **15–20** |
| **HB 2021 similarity** | **MODERATE** — quantified targets with deadlines, multiple responsible parties, but less utility-specific granularity; weaker equity/labor provisions within the bill itself |
| **Compliance data** | [CEC SB 100 Joint Agency Report](https://www.energy.ca.gov/sb100); CPUC RPS compliance filings |
| **Data richness** | **EXCELLENT** — extensive RPS compliance data through CPUC/CEC |

**Key training value:** The CPUC RPS compliance ecosystem is the richest public compliance dataset of any state. Even though SB 100 itself is less prescriptive, the surrounding regulatory data is outstanding for verification training.

---

### 10. Maryland Clean Energy Jobs Act — SB 516

| Field | Detail |
|---|---|
| **Citation** | SB 516 (2019), Chapter 757 |
| **Jurisdiction** | Maryland |
| **Year enacted** | 2019 |
| **Core commitments** | 50% RPS by 2030; 14.5% solar carve-out; 1,200 MW offshore wind minimum; study pathway to 100% clean by 2040 |
| **Responsible parties** | MD PSC; electricity suppliers; offshore wind developers |
| **Equity provisions** | Clean Energy Workforce Account for apprenticeships; support for businesses owned by women, minorities, veterans |
| **Estimated promises** | **12–18** |
| **HB 2021 similarity** | **MODERATE** — RPS with carve-outs and capacity mandates, workforce provisions, but less utility-specific |
| **Compliance data** | [MD PSC renewable energy](https://www.psc.state.md.us/electricity/renewable-energy/) |
| **Data richness** | **MODERATE** |

---

### 11. Hawaii HB 623

| Field | Detail |
|---|---|
| **Citation** | HB 623, Act 97 (2015); amended by HB 2089 (2022) |
| **Jurisdiction** | Hawaii |
| **Year enacted** | 2015 (first state to set 100% renewable target) |
| **Core commitments** | RPS: 15% by 2015, 30% by 2020, 40% by 2030, 70% by 2040, 100% by 2045; penalty $0.02/kWh for excess fossil |
| **Responsible parties** | Hawaiian Electric (HECO); Kauai Island Utility Cooperative (KIUC); HI PUC |
| **Estimated promises** | **8–12** |
| **HB 2021 similarity** | **LOW-MODERATE** — clean RPS with penalties, but minimal equity/labor provisions |
| **Compliance data** | [HI PUC energy policies](https://puc.hawaii.gov/energy/hawaiis-renewable-energy-and-energy-efficiency-policies/) |
| **Data richness** | **MODERATE** — unique island-grid data |

---

### 12. Nevada SB 358

| Field | Detail |
|---|---|
| **Citation** | SB 358 (2019) |
| **Jurisdiction** | Nevada |
| **Year enacted** | 2019 |
| **Core commitments** | 50% RPS by 2030 (mandatory); 100% clean by 2050 (goal, not mandate); energy efficiency credit phase-out by 2025 |
| **Responsible parties** | NV Energy; electric cooperatives; NV PUC |
| **Estimated promises** | **10–15** |
| **HB 2021 similarity** | **LOW-MODERATE** — RPS with quantified targets, but 2050 goal is aspirational; limited equity/labor |
| **Compliance data** | NV PUC RPS filings; DSIRE database |
| **Data richness** | **MODERATE** |

---

### 13. Colorado HB 19-1261 — Climate Action Plan

| Field | Detail |
|---|---|
| **Citation** | HB 19-1261 (2019) |
| **Jurisdiction** | Colorado |
| **Year enacted** | 2019 |
| **Core commitments** | Statewide GHG: 26% by 2025, 50% by 2030, 90% by 2050 (from 2005); oil & gas methane: 33% by 2025, 50% by 2030 |
| **Responsible parties** | Air Quality Control Commission (AQCC); CDPHE; Governor's office |
| **Estimated promises** | **10–15** |
| **HB 2021 similarity** | **LOW** — economy-wide targets without utility-specific obligations; goal-setting rather than prescriptive |
| **Data richness** | **MODERATE** — roadmap documents public but less granular compliance tracking |

---

### 14. Maine LD 1679

| Field | Detail |
|---|---|
| **Citation** | LD 1679 (SP 550), Public Law Chapter 476 (2019) |
| **Jurisdiction** | Maine |
| **Year enacted** | 2019 |
| **Core commitments** | GHG: 45% below 1990 by 2030, 80% by 2050; established Maine Climate Council; updated in 2025 to 100% clean by 2040 |
| **Responsible parties** | Maine Climate Council; Governor's Energy Office; PUC |
| **Estimated promises** | **10–15** |
| **HB 2021 similarity** | **LOW** — framework/goal-setting establishing a council rather than imposing utility-specific obligations |
| **Compliance data** | [Maine Climate Council](https://www.maine.gov/future/climate) |
| **Data richness** | **LOW-MODERATE** |

---

## Federal Legislation

### 15. Inflation Reduction Act (IRA) — Public Law 117-169

| Field | Detail |
|---|---|
| **Citation** | Public Law 117-169, 117th Congress (2022) |
| **Jurisdiction** | Federal |
| **Year enacted** | 2022 |
| **Core commitments** | ~$370B in climate/energy investment; ITC/PTC extended and expanded; tech-neutral clean electricity credits (45Y/48E) post-2024; clean hydrogen credit (construction before Jan 1, 2033); CCS credit extended to 2033; 30% residential clean energy credit through 2032 (declining to 22% by 2034); $27B Greenhouse Gas Reduction Fund; $3B EJ block grants; clean electricity credits phase out when power sector hits 75% reduction from 2022 |
| **Responsible parties** | DOE; EPA; IRS/Treasury; DOE Loan Programs Office; individual project developers; utilities claiming credits |
| **Equity provisions** | 40% of $27B green bank to disadvantaged communities; energy community bonus credits (10%); low-income community solar |
| **Labor provisions** | **Strong** — prevailing wage + registered apprenticeship requirements for full credit value; bonus credits for domestic content |
| **Estimated promises** | **50–70+** |
| **HB 2021 similarity** | **LOW-MODERATE** — strong labor/prevailing wage provisions parallel HB 2021, but fundamentally different structure: incentives vs. mandates. No utility-specific obligations. No emissions mandates |
| **Compliance data** | [EPA IRA summary](https://www.epa.gov/green-power-markets/summary-inflation-reduction-act-provisions-related-renewable-energy); [DOE IRA page](https://www.energy.gov/edf/inflation-reduction-act-2022); Treasury/IRS guidance |
| **Data richness** | **MODERATE** — tax-credit-based compliance is less structured than utility regulatory filings |

**Training note:** Highest raw promise count but structurally different from mandate-based state laws. Useful for testing whether promise schemas generalize from mandates to incentives. Label after Tier 1 state bills.

---

## Additional Bills Worth Monitoring

| State | Law | Year | Target | Notes |
|---|---|---|---|---|
| **Rhode Island** | HB 7277A / SB 2274Aaa | 2022 | 100% renewable by 2033 | Most aggressive timeline in US |
| **Connecticut** | 2022 legislation | 2022 | 100% clean by 2040 | 40% renewable interim by 2030 |
| **New Jersey** | Executive Order 315 + Clean Energy Act | 2018/2023 | 100% carbon-free by 2035 | Strong offshore wind provisions |
| **North Carolina** | HB 951 | 2021 | 70% carbon reduction by 2030, carbon-neutral by 2050 | Bipartisan; Duke Energy-specific |
| **Washington** | Climate Commitment Act | 2021 | Economy-wide cap-and-invest | Complements CETA; significant EJ revenue |

---

## Estimated Promise Counts

| Bill | Tier | Estimated Promises | Cumulative Total |
|---|---|---|---|
| Oregon HB 2021 (done) | — | 20 | 20 |
| WA CETA (SB 5116) | 1 | 25–35 | 45–55 |
| VA VCEA | 1 | 35–45 | 80–100 |
| IL CEJA (SB 2408) | 1 | 40–55 | 120–155 |
| NY CLCPA | 1 | 30–40 | 150–195 |
| NM ETA (SB 489) | 2 | 20–30 | 170–225 |
| MA Chapter 8 | 2 | 30–40 | 200–265 |
| MN HF 7 | 2 | 15–25 | 215–290 |
| MI Clean Energy Act | 2 | 20–30 | 235–320 |
| CA SB 100 | 3 | 15–20 | 250–340 |
| MD SB 516 | 3 | 12–18 | 262–358 |
| HI HB 623 | 3 | 8–12 | 270–370 |
| NV SB 358 | 3 | 10–15 | 280–385 |
| CO HB 19-1261 | 3 | 10–15 | 290–400 |
| ME LD 1679 | 3 | 10–15 | 300–415 |
| Federal IRA | — | 50–70 | 350–485 |

**Labeling all Tier 1 + Tier 2 bills reaches 235–320 promises** — approaching the 500 target with just 8 bills. Adding Tier 3 + IRA reaches 350–485. A second pass extracting sub-promises (e.g., individual plant closure dates in CEJA) could push past 500.

---

## Recommended Labeling Order

1. **Washington CETA** — closest structural analog; test schema generality first
2. **Virginia VCEA** — utility-specific split (Dominion vs. ApCo) parallels PGE vs. PacifiCorp
3. **Illinois CEJA** — highest volume; plant-specific closure dates are unambiguous training signal
4. **New York CLCPA** — Columbia Law tracker provides near-turnkey verification data
5. **New Mexico ETA** — IOU vs. co-op differentiation tests schema flexibility
6. **Massachusetts Chapter 8** — sector sublimits test hierarchical promise decomposition
7. **Minnesota HF 7** — most recent (2023); good for temporal generalization
8. **Michigan Clean Energy Act** — completes Tier 2 coverage

---

## Key Data Sources for All Bills

| Source | URL | Coverage |
|---|---|---|
| **DSIRE Database** | [dsireusa.org](https://programs.dsireusa.org/) | State-by-state incentives and standards |
| **CESA 100% Clean Energy Collaborative** | [cesa.org](https://www.cesa.org/projects/100-clean-energy-collaborative/guide/) | Legislation texts, MRV procedures, state tracking |
| **NCSL Energy Legislation Database** | [ncsl.org](https://www.ncsl.org/energy/state-energy-legislation-database) | State legislation tracking |
| **EIA RPS Tracker** | [eia.gov](https://www.eia.gov/energyexplained/renewable-sources/portfolio-standards.php) | RPS compliance data |
| **GovInfo** | [govinfo.gov](https://www.govinfo.gov/) | Federal legislation full text (public domain) |
| **LegiScan** | [legiscan.com](https://legiscan.com/) | State legislation across all 50 states ($49/mo API) |
| **Columbia Law Scoping Plan Tracker** | [climate.law.columbia.edu](https://climate.law.columbia.edu/Scoping-Plan-Tracker) | NY CLCPA implementation tracking |

---

## Schema Compatibility Assessment

The HB 2021 training schema (from [LABELED_DATA_INVENTORY.md](LABELED_DATA_INVENTORY.md)) maps to other bills as follows:

| Schema Field | HB 2021 | WA CETA | VA VCEA | IL CEJA | NY CLCPA |
|---|---|---|---|---|---|
| `promiser` (utility-specific) | PGE, PacifiCorp | All WA utilities | Dominion, ApCo | ComEd, Ameren | Economy-wide agents |
| `promisee` (community) | Ratepayers, EJ communities | Vulnerable populations | EJ communities | Equity-eligible communities | Disadvantaged communities |
| `target` (quantified) | 80/90/100% by 2030/35/40 | Coal-free 2025, GHG-neutral 2030, 100% 2045 | 100% by 2045/2050 | Carbon-free 2045, plant closures 2030 | 70% 2030, 100% 2040, MW targets |
| `commitment_type: target` | Emissions reduction | Emissions reduction | Capacity + emissions | Plant closures + RPS | Multi-sector targets |
| `commitment_type: prohibition` | No new gas plants | Coal elimination | Coal/biomass shutdown dates | Coal/oil plant closure | — |
| `commitment_type: filing` | CEP filing | CEIP filing | IRP filing | — | Scoping plan |
| `commitment_type: obligation` | Community benefits | Equity assessment | EJ reporting | Workforce training | 40% EJ funding |
| `commitment_type: safeguard` | 6% rate cap | 2% rate cap | Penalty allocation | $3–4/month estimate | — |
| `dependencies` | CEP → emissions → affordability | CEIP → targets → equity | MW capacity → emissions → plant closures | Plant closures → RPS → carbon-free | Sector targets → economy-wide |

**Key finding:** All Tier 1 bills fit the existing schema with minimal extension. The main schema additions needed:
- `commitment_type: capacity_mandate` (MW targets in VCEA, CLCPA)
- `commitment_type: plant_closure` (specific facility closures in CEJA, VCEA)
- `commitment_type: funding_allocation` (EJ funding mandates in CLCPA, CEJA)

---

## Related Documents

- [LABELED_DATA_INVENTORY.md](LABELED_DATA_INVENTORY.md) — Current training data inventory (20 promises from HB 2021)
- [ROADMAP.md](ROADMAP.md) — Phase 3 ML training data requirements
- [docs/HB2021_SPEC.md](docs/HB2021_SPEC.md) — HB 2021 schema design (comparison baseline)
- [PROMISE_THEORY_FOUNDATIONS.md](PROMISE_THEORY_FOUNDATIONS.md) — Theoretical framework
