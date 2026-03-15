# Your Promise Network Has an Entropy Problem

**Conor Nolan-Finkel · March 2026**

Promise Pipeline tells you the health of a commitment network. As of this week, it also tells you how much you should trust that assessment — and what happens when trust itself breaks down.

We added new analytical capabilities to the simulation engine drawn from graph theory, information theory, queueing theory, and cryptographic commitments. Then we stress-tested the whole thing against the Iran nuclear deal. What came out the other side changed how the engine works.

-----

## The Problem with Looking Good

The HB 2021 dashboard reports a network health score — a weighted average of promise statuses. It's useful. It tells you the network is struggling. But it doesn't tell you how much of that assessment you can trust.

Consider two networks with identical health scores of 50/100. Network A has 10 promises: 5 verified, 5 violated. Network B has 10 promises: 2 verified, 1 violated, 7 unverifiable.

Network A is unhealthy but you know exactly where you stand. Network B might be healthy. Or it might be catastrophic. You literally cannot tell, because 70% of the promises have no verification mechanism.

Network A has low entropy. Network B has high entropy. The health score is the same. The epistemic situation is completely different.

-----

## Network Entropy

Network entropy computes a certainty-weighted uncertainty score (0–100) for the entire promise network and for each domain independently. Verified and violated promises carry high certainty — evidence exists. Declared and unverifiable promises carry low certainty — the state is unknown or untested.

The result: you now see two numbers side by side.

**Network Health: 46/100 · Network Certainty: 62/100**

When we ran this on the HB 2021 data, the Equity domain immediately flagged:

- **Emissions** — Health: 72, Certainty: 85
- **Equity** — Health: 35, Certainty: 12 ⚠ Verification gap

We already knew about the equity verification gap — it's in the whitepaper as a key finding. But we described it in English. Now the simulation engine computes it as a number. Domain certainty below 30 triggers an automated verification gap warning. The gap is no longer an insight. It's a metric.

This is Shannon entropy applied to promise networks. The math has been around since 1948. We just pointed it at the right data structure.

-----

## Bridge Nodes

We also upgraded bottleneck identification. The previous version counted how many promises depend on a given promise. That catches hub nodes. It misses bridge nodes.

Betweenness centrality (Brandes, 2001) identifies promises that sit on the most shortest paths between other promises. A bridge node might have only 4 dependents, but if it's the only connection between the emissions cluster and the equity cluster, its failure disconnects the network.

In HB 2021, the DEQ verification promises have moderate dependent count but high betweenness:

|Promise                |Dependents|Bridge Score                |
|-----------------------|----------|----------------------------|
|P002 (PGE Plan)        |12        |0.84                        |
|P006 (DEQ Verification)|4         |**0.91** ← structural bridge|
|P003 (PacifiCorp Plan) |10        |0.78                        |

P006 surfaces as the highest-leverage node despite having fewer dependents. That's a finding the old method missed.

-----

## What the Iran Deal Broke Open

Then we ran the JCPOA.

22 promises. 11 agents. 8 domains. The most precisely specified multinational promise network in modern diplomatic history. Network health score: 7 out of 100. Grade: F. Seventeen of twenty-two promises violated.

The cascade source was the U.S. withdrawal in May 2018 — a single promise violation that propagated across all 8 domains in 3.5 years, reaching a cascade depth of 5 edges. This is structurally identical to the PacifiCorp cascade in HB 2021, just at the scale of international nuclear diplomacy.

But the JCPOA revealed something HB 2021 didn't: **verification infrastructure is a promise in the graph, not external to it.**

The IAEA had the most robust verification regime ever deployed for an arms control agreement. Continuous monitoring. Online enrichment measurement. Environmental sampling. Electronic seals. Satellite surveillance. 3,000 inspector-days per year in Iran.

And it all depended on a single promise: Iran's commitment to implement the Additional Protocol (JCPOA-008). That commitment depended on sanctions relief being maintained. When the U.S. reimposed sanctions, Iran suspended the Additional Protocol, removed IAEA cameras, and restricted inspector access. The verification infrastructure — the thing that made every other promise auditable — went down with the network.

In HB 2021, the verification gap exists because no mechanism was ever created for equity promises. The gap was baked in at the design level. In the JCPOA, verification *existed* and then was destroyed because it was itself a promise that could be broken.

-----

## Certainty Cascades

This finding required a new propagation channel in the simulator. Previously, the cascade engine propagated status changes through dependency edges: if Promise A fails, Promise B (which depends on A) degrades. That still works.

Now it also propagates certainty changes through verification dependency edges. When a promise that enables verification fails, every promise it verified becomes less certain — even if its compliance status hasn't changed.

A promise can be "violated" and "certain" (evidence confirms the violation) or "violated" and "uncertain" (the evidence that confirmed the violation is no longer accessible). The distinction matters: status cascades tell you what's broken. Certainty cascades tell you what you can no longer see.

When we simulate the JCPOA's Additional Protocol suspension, the certainty cascade hits every enrichment, facilities, and plutonium promise in the network. Their statuses were already violated. But the certainty of that assessment — the IAEA's ability to confirm the violations — drops to near zero. You go from "we know Iran is violating" to "we think Iran is violating but we can't verify it."

That's a different kind of problem. And the simulator can now model it.

-----

## Entropy Over Time

The JCPOA also pushed us to track entropy as a time series, not just a snapshot. The deal's verification certainty changed dramatically over its lifetime:

- **January 2016 (Implementation Day):** Low entropy. Full IAEA access. High certainty.
- **May 2018 (U.S. withdrawal):** Health drops. Entropy stays low — verification still intact.
- **February 2021 (AP suspended):** Entropy spikes. Certainty collapses.
- **June 2022 (cameras removed):** Entropy maxes out. The network is both unhealthy and unknowable.

The moment the health line and the entropy line cross — when the network becomes both degraded and uncertain — is the point of no return. For the JCPOA, that happened in early 2021. Everything after was aftershock.

The timeline chart is now available on the JCPOA dashboard alongside a dual-line visualization of health and entropy over the agreement's lifetime.

-----

## Team Capacity

For the team vertical, we added utilization metrics based on Little's Law from queueing theory (Little, 1961). Instead of counting active promises and guessing whether the team can handle more, the engine tracks arrival rate and completion rate to compute a utilization score.

When utilization approaches 1.0, the promise queue grows unboundedly — the team is taking on commitments faster than they can fulfill them:

**Team Utilization: 87% ⚠ Approaching capacity**
*At current rates, overload in ~3 weeks*

This is predictive. It flags overload before promises start breaking.

-----

## Verification You Can Verify

Cryptographic verification commitments: when Promise Pipeline updates a promise's status based on a source document, we store a SHA-256 hash of the source alongside the status change. Anyone with access to the original document can verify the hash matches.

For a platform built on promisee-side verification, our own verification should be verifiable.

-----

## What's Coming

These features are the beginning of a formal foundations layer. On the horizon:

- **Bayesian status distributions** — probability distributions that update as evidence arrives, replacing categorical labels
- **Percolation threshold detection** — the exact point where local failures become systemic collapse
- **Zero-knowledge proofs** — contributors prove aggregate properties of their promise patterns without transmitting underlying data
- **Ecological resilience metrics** — how much disturbance a network can absorb before it shifts to a qualitatively different state

The promise graph was already a trust primitive. The formal foundations — and the JCPOA stress test — make it a rigorous one.

-----

*Promise Pipeline is open-source under the AGPL-3.0. The simulation engine, promise schema, and graph analysis tools are available at the project repository. The JCPOA dashboard is live. The formal foundations are documented in the whitepaper (v5, Section 7.7).*
