# The Trust Primitive: What It Means for Commitments to Nest, Compose, and Scale

**Conor Nolan-Finkel · March 2026**

> Every institution runs on promises. Laws, contracts, SLAs, org commitments, even personal resolutions — they're all the same thing at the structural level: one agent commits to doing something for another, by a certain time, verified somehow. Promise Pipeline treats this structure as a **trust primitive** — a basic building block that nests, composes, and scales. This post explains what that means and why it matters.

-----

## What's a Primitive?

In computing, a primitive is an irreducible building block. An integer. A boolean. A hash function. You don't build a hash function from simpler hash functions — it's foundational. Everything else is built from it.

Trust doesn't have a primitive yet. We have credit scores, reputation systems, blockchain "trustlessness," star ratings, verification badges. These are all *derived* representations — they take the messy reality of trust and compress it into a number, a badge, or a binary. Useful, but lossy. A credit score tells you someone's financial reliability as a single number. It doesn't tell you *which* commitments they kept, which they broke, what depended on what, or what's likely to fail next.

The promise graph is the primitive that sits underneath all of these. It models the full structure: who promised what to whom, by when, verified how, and what depends on it. Everything else — scores, ratings, badges — can be *computed from* the graph. The graph can't be computed from them.

*[Figure 1: Diagram showing credit score (742), reputation (4 stars), and verified badge as "derived (lossy compression)" sitting above the promise graph (primitive). Scores, ratings, and badges are derived from the promise graph.]*

The graph is the primitive.

-----

## One Promise, Five Fields

Every commitment — regardless of domain — decomposes into the same structure. This is the schema that makes promises composable:

- **Promiser:** PGE (utility)
- **Promisee:** Oregon citizens
- **Body:** "Reduce emissions 80% by 2030" · ● verified
- **Verification:** DEQ audit
- **Depends on:** P002 (approved plan)

Same schema. Every domain. Every scale.

*[Figure 2: A single promise node showing the five-field structure. Every promise, from a state law to a personal deadline, uses the same five-field structure.]*

The promiser is the agent making the commitment. The promisee is the agent it's made to. The body is the specific claim. Verification is how you check. And dependencies connect this promise to the other promises it needs in order to succeed.

That last field — `depends_on` — is what makes promises composable. It's the edge in the graph. Without it, you have a list. With it, you have a network.

-----

## What "Nesting" Means

A trust primitive nests when a promise at one scale contains — or depends on — promises at another scale. This isn't metaphor. It's architecture. Consider a chain from international treaty down to a single utility's quarterly filing:

- **INTERNATIONAL:** "Net-zero by 2050" — Paris Agreement
- **NATIONAL:** "50% emissions reduction by 2030" — U.S. NDC
- **STATE:** "100% clean electricity by 2040" — Oregon HB 2021
- **ORGANIZATION:** "Reduce emissions 80% by 2030" — PGE Clean Energy Plan
- **OPERATIONAL:** "Q3 filing shows 12% reduction" — DEQ

Each layer depends on the one inside it.

*[Figure 3: Nested boxes showing promises at each governance scale. Promises nest. Each outer commitment depends on inner ones to succeed. Break a quarterly filing, and the cascade runs upward through four layers.]*

The Paris Agreement is a promise made by nations. Each nation's commitment nests promises at the state/provincial level. Oregon's HB 2021 nests promises made by utilities. Each utility's plan nests operational commitments — quarterly filings, equipment procurements, workforce training.

This nesting is real. It's not organizational hierarchy — it's dependency. If PGE's quarterly filing shows missed reduction targets, that doesn't just affect PGE. It degrades Oregon's HB 2021 compliance, which degrades the U.S. nationally determined contribution, which degrades the Paris Agreement network. A single data point in a single utility's filing is structurally connected to an international treaty obligation.

No existing tool models this. ESG platforms track corporate pledges in isolation. Legislative trackers show bill status without downstream dependencies. International climate dashboards aggregate national targets without connecting them to the operational promises that determine whether those targets are met.

The key insight: Trust isn't built at a single level. It's built across levels, through nested dependency. A trust primitive that can't represent cross-scale dependencies is incomplete — like a networking protocol that works within a building but can't route between buildings.

-----

## What "Composable" Means

A composable primitive means you build complex structures by combining simple ones, using the same rules at every level. The promise schema is the same whether you're modeling a personal commitment, a restaurant's shift coverage, or an international treaty. The same graph operations apply: you can compute health scores, run cascade simulations, and identify bottlenecks regardless of what the promises are about.

- **PERSONAL:** "Run 3x/week"
- **TEAM:** "Ship v2 by Friday"
- **CIVIC:** "80% clean by 2030"

Same schema. Same simulation engine.

*[Figure 4: Three completely different domains. Same node type. Same edges. Same cascade logic. The schema composes.]*

This is the power of composability. A restaurant owner tracking shift coverage promises and a policy analyst simulating Oregon's clean electricity law are using the same tool, the same schema, and the same simulation engine. The restaurant's promise graph is smaller (dozens of nodes) and faster-cycling (daily). The civic graph is larger (hundreds of nodes) and slower (years). But the operations are identical: compute health, identify bottlenecks, simulate "what if."

### Why This Matters Practically

Composability means you don't need a different tool for each domain. It means patterns discovered in one domain transfer to others — a cascade failure pattern that recurs in legislative promise networks might also recur in team promise networks, because the structural dynamics are the same. And it means a single person can use the same framework to track their personal commitments, manage their team's promises, and audit the legislation that affects their community.

-----

## The X-Ray vs. MRI Problem

Most accountability tools are flat projections of isolated statuses. A dashboard shows you red, yellow, and green lights. Something is on track. Something isn't. But you can't see the structural relationships between them.

**The X-Ray (status dashboards):** Shows what's broken. Individual statuses, isolated metrics, flat projections. You see the fracture, but not how it relates to surrounding structures. No dependencies. No cascade. No prediction.

**The MRI (promise graph):** Shows what will break next and why. Full structural model — dependencies, cascade pathways, downstream effects. Click any node, change its status, and see which promises across which domains are affected. The simulation models the intervention before you make it.

The dashboard tells you PacifiCorp's clean energy plan was rejected. The promise graph tells you that rejection cascades to four downstream promises across three domains — emissions, workforce, and equity — and drops the network health score from 72 to 54. That's the difference between knowing something is wrong and understanding what to do about it.

-----

## Cascade: The Behavior That Nesting Makes Visible

Nesting creates dependencies. Dependencies create cascade risk. When a promise fails, the promises that depend on it are structurally affected. This propagation is the core behavior that the trust primitive makes computable.

*[Figure 5: Cascade diagram showing P003 (PacifiCorp plan, VIOLATED) propagating to P004 (emissions targets, DEGRADED), P018 (workforce dev, DEGRADED), and P016 (tribal consultation, AT RISK), which further cascade to P010 (equity), P011 (burden), and P019 (jobs). Network health drops from 72 to 54. One plan rejection. Seven affected promises. Three domains.]*

The cascade isn't speculation. It's graph traversal. If Promise A depends on Promise B, and Promise B fails, then Promise A is structurally compromised. The simulation doesn't guess — it follows the edges. The only question is *how much* each downstream promise degrades, and that's where historical data and learned weights improve the model over time.

> **The flip side is equally powerful.** If you can model which promise failure causes the worst cascade, you can also model which promise *fulfillment* would produce the greatest cascading benefit. That's intervention targeting — and it's how advocacy organizations, team leads, and policymakers can focus limited resources for maximum structural impact.

-----

## What "Scaling" Means

A trust primitive that only works at one scale isn't a primitive. The promise schema works identically across five orders of magnitude:

|Scale        |Node Count     |Example          |
|-------------|---------------|-----------------|
|Personal     |3–20 nodes     |"Exercise 3x/wk" |
|Team         |20–200 nodes   |"Ship feature Q3"|
|Org / Company|100–1,000 nodes|"ESG compliance" |
|Legislation  |20–500 nodes   |"HB 2021"        |
|Treaty       |1,000+ nodes   |"Paris Agreement"|

Same schema. Same cascade. Same simulation. Different scale.

*[Figure 6: Scale spectrum from 3 promises to 10,000. The schema doesn't change. The operations don't change. The scale does.]*

This isn't just conceptual elegance — it has practical consequences. Patterns discovered at one scale transfer to others. A cascade failure pattern that recurs in legislative promise networks (one rejected plan derailing three downstream domains) is structurally identical to a cascade failure in a restaurant (one missed delivery derailing the Saturday specials, the server's promise to the customer, and the revenue target). The dynamics are the same because the dependency structures are the same.

Machine learning models trained on high-volume team data (hundreds of promises per month per team) can improve predictions for low-volume civic data (20 promises per bill, updated quarterly). This is the data flywheel: the personal and team verticals generate the volume that makes the civic vertical's predictions more accurate. The civic vertical provides the high-stakes, carefully annotated examples that anchor the model's understanding of cascade dynamics.

-----

## Why This Matters

The nesting, composable trust primitive changes three things:

### 1. Accountability becomes structural, not episodic

Instead of checking on promises one at a time when something goes wrong, you can see the full structure continuously. A health score computed from the graph tells you whether the network is strengthening or degrading before any individual promise visibly fails. It's the difference between monitoring individual vital signs and having a structural scan of the whole system.

### 2. Simulation replaces speculation

"What happens if this commitment fails?" is currently answered by expert intuition or political argument. With a promise graph and a cascade simulator, it's answered by graph traversal. The answer isn't perfect — learned weights improve over time — but it's grounded in structural relationships rather than conjecture. An advocacy organization deciding where to focus can simulate the cascading impact of each target before committing resources.

### 3. Cross-domain visibility becomes possible

Because the schema is universal, promises that span domains can be connected. A federal funding promise affects state legislative promises, which affect municipal implementation promises, which affect corporate compliance promises. No existing tool connects these. The nesting primitive does — not because it imposes a hierarchy, but because the dependency edges naturally cross boundaries when the data is modeled consistently.

A caveat on legibility. Making commitment networks legible is powerful. It's also politically charged. Entities whose promises look bad in a graph have incentive to resist the graph. Promise Pipeline's approach is to work with public data and transparent methodology — the schema is open, the data sources are cited, and the simulation logic is deterministic and inspectable. The graph doesn't editorialize. It shows the structure. What people do with that visibility is their choice.

-----

## A Primitive, Not a Product

The most important thing about the promise graph is that it's infrastructure, not a finished application. Just as TCP/IP is a networking primitive that millions of different applications build on, the trust primitive is a building block. Promise Pipeline builds specific applications on it — civic dashboards, team health tools, personal trackers — but the primitive itself is what matters. Anyone who models commitments using this schema can run the same operations: health scoring, cascade simulation, bottleneck identification, intervention targeting.

The accountability structures already exist. Legislation names specific commitments. Companies publish pledges. Teams make plans. People make resolutions. The commitments are real. The dependencies are real. The cascade dynamics are real. What's missing is the infrastructure to make them legible, auditable, and simulable — to move from "did they keep their promise?" to "will this network of promises produce the intended outcome?"

The trust primitive makes that possible. It nests across scales, composes across domains, and simulates across scenarios. That's what it means, and that's why it matters.

-----

*Promise Pipeline is an open-source accountability platform built by Pleco. The full theoretical framework is described in the Promise Pipeline whitepaper (v5, March 2026). The HB 2021 simulation dashboard is live at [promisepipeline.com/demo/hb2021](https://www.promisepipeline.com/demo/hb2021).*

**References:** Promise Theory: Burgess, M. (2004). An approach to understanding policy based on autonomy and voluntary cooperation. · Burgess, M. & Siri, J. (2014). *Thinking in Promises.* O'Reilly. · Bergstra, J. A. & Burgess, M. (2019). *Promise Theory: Principles and Applications* (2nd ed.). χtAxis Press. · Legibility: Scott, J.C. (1998). *Seeing Like a State.* Yale University Press. · Promise-based management: Sull, D. & Spinosa, C. (2007). Harvard Business Review 85(4).
