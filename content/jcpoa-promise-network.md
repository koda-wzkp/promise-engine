# The JCPOA Promise Network: When Verification Is a Promise That Can Break

**Conor Nolan-Finkel · March 2026**

-----

22 promises. 11 agents. 8 domains. The most precisely specified multinational promise network in modern diplomatic history — and what happened when the cascade source was pulled.

We applied the Promise Pipeline schema to the Joint Comprehensive Plan of Action (2015), the Iran nuclear deal, identifying every discrete commitment, its verification mechanism, and its dependency edges. The network health score: **7 out of 100. Grade: F.** Seventeen of twenty-two promises violated.

The JCPOA is the stress test that changed how the simulation engine works.

-----

## The Cascade: 2018 to Present

The U.S. withdrawal from the JCPOA in May 2018 is the cascade source that collapsed the entire promise network. The sequence:

1. **May 2018:** U.S. reimposed all suspended sanctions (JCPOA-011, JCPOA-015 violated)
1. **2018–2019:** EU sanctions relief rendered economically meaningless by U.S. secondary sanctions — INSTEX facilitated exactly one transaction in its lifetime
1. **July 2019:** Iran began exceeding enrichment limits, explicitly citing JCPOA §26 ("grounds to cease performing")
1. **2019–2021:** Progressive escalation across all enrichment and facilities promises
1. **February 2021:** Iran suspended the Additional Protocol, collapsing the verification architecture
1. **2021–2025:** IAEA progressively lost ability to monitor Iran's nuclear program
1. **September 2025:** E3 invoked snapback, reimposing UN sanctions
1. **October 2025:** Iran declared JCPOA terminated

Cascade depth: 5 edges from the source. The entire network collapsed in ~3.5 years from the initial violation. This is structurally identical to the PacifiCorp cascade in HB 2021, just at the scale of international nuclear diplomacy.

-----

## The Inverted Verification Gap

In Oregon's HB 2021, the verification gap runs in one direction: quantifiable commitments (emissions) get robust verification while qualitative commitments (equity) get none. The gap was baked in at the design level.

The JCPOA inverts this. Iran's nuclear commitments had the **most robust verification infrastructure ever deployed for an arms control agreement** — continuous IAEA presence, online enrichment monitoring, electronic seals, satellite surveillance, environmental sampling. 3,000 inspector-days per year.

And it all depended on a single promise: Iran's commitment to implement the Additional Protocol (JCPOA-008). That commitment depended on sanctions relief being maintained.

When the U.S. reimposed sanctions, Iran suspended the Additional Protocol, removed IAEA cameras, and restricted inspector access. The verification infrastructure — the thing that made every other promise auditable — went down with the network.

This reveals a structural pattern not found in other verticals: **verification infrastructure is itself a commitment network, and it has its own dependency graph.** A verification oracle is only as reliable as the promise network that sustains it.

-----

## The §26 Structural Conflict

JCPOA §26 contains a built-in cascade trigger: if sanctions relief fails, Iran has a declared pathway to nuclear non-compliance. The negotiators knew this — it was a deliberate acknowledgment that the network's survival depended on mutual performance.

This is formally a **threat** in Promise Theory terms: a conditional promise with negative valuation. Unlike dependency-based cascades (which propagate downward through structural requirements), threats propagate laterally across domains. The cost cap in HB 2021 operates the same way — when the transition becomes expensive, emissions goals yield to affordability goals.

The promise graph makes these structural tensions computable: under what conditions does keeping one promise require breaking another?

-----

## Breakout Time as Network Health

Before the JCPOA, Iran's breakout time — the time to produce enough fissile material for one weapon — was estimated at 2–3 months. Under full implementation, breakout time was extended to 12+ months. As of late 2024, breakout time had collapsed to approximately one week or less.

Breakout time functions as a real-world network health score for this promise network. It integrates the fulfillment status of enrichment, centrifuge, stockpile, and facility promises into a single consequence measure. The JCPOA's health went from "healthy" (12+ months) to "critical" (< 1 week) in approximately 5 years.

-----

## Network Health Summary

|Metric             |Value                                                                        |
|-------------------|-----------------------------------------------------------------------------|
|Total promises     |22                                                                           |
|Verified           |1 (snapback mechanism — its activation is itself evidence of network failure)|
|Violated           |17 (77.3%)                                                                   |
|Degraded           |3 (13.6%)                                                                    |
|Unverifiable       |1 (Iran's peaceful nuclear commitment — the foundational promise)            |
|Network health     |7/100                                                                        |
|Cascade source     |U.S. non-reimposition pledge (JCPOA-015)                                     |
|Cascade depth      |5 edges                                                                      |
|Domains affected   |All 8                                                                        |
|Agents in violation|4 of 11                                                                      |

-----

## What It Changed in the Engine

The JCPOA analysis directly produced two new features in the Promise Pipeline simulation engine:

**Certainty cascades.** The cascade engine now propagates not just status changes but certainty changes through verification dependency edges. When a promise that enables verification fails, every promise it verified becomes less certain — even if its compliance status hasn't changed. Status cascades tell you what's broken. Certainty cascades tell you what you can no longer see.

**Network entropy.** A certainty-weighted uncertainty score (0–100) computed alongside the health score. Two networks with identical health scores can have radically different entropy — one where you know what's broken, and one where you can't tell.

Both of these features are now available across all Promise Pipeline dashboards, not just the JCPOA analysis.

-----

The full 22-promise extraction with complete dependency graph, agent analysis, and cross-vertical comparison is available as a case study. The JCPOA extraction includes detailed comparison tables showing structural parallels with HB 2021, the Fort Laramie Treaty, and the Paris Agreement.

*This is infrastructure, not advocacy. The data says what it says.*

-----

*Sources: JCPOA Full Text (European Parliament, 2015), UNSCR 2231, IAEA Board of Governors Reports, Arms Control Association, Congressional Research Service, House of Commons Library.*
