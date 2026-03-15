# PROMISE PIPELINE

## A Trust Primitive for Commitment Networks

### From Accountability Tracking to Predictive Simulation

**Conor Nolan-Finkel**
Pleco / Promise Pipeline
Version 5.0 — March 2026

-----

Every institution, law, and AI system rests on a network of interdependent commitments. So does every team, every relationship, and every promise we make to ourselves. These commitments are currently scattered, self-assessed, and invisible to the people they are meant to protect. Promise Pipeline provides a trust primitive: a structured, auditable, simulable graph of who promised what to whom, verified how, and whether it was kept. By modeling commitments as networks and training on decades of public data, we move from reactive accountability—did they keep their promise?—to predictive accountability: will this network of promises produce the intended outcome?

-----

## 1. The Accountability Gap

Modern institutions operate on networks of promises. Legislation commits specific agents to specific outcomes on specific timelines. AI companies publish safety commitments, model cards, and responsible use policies. Corporations issue ESG pledges, SLA guarantees, and supply chain certifications. In every domain, the pattern is the same: autonomous agents make commitments to stakeholders, and the stakeholders have no systematic way to verify whether those commitments are being kept.

The accountability infrastructure that does exist is fragmented. In climate policy, compliance data is scattered across utility filings, regulatory dockets, and agency reports that no citizen can practically synthesize. In AI safety, behavioral commitments are buried in blog posts, model cards, and terms of service that change without notice. In corporate governance, ESG pledges are self-assessed against self-selected metrics. In every case, the accountability structures are present but illegible—visible to specialists who know where to look, invisible to the stakeholders they are meant to protect.

This paper describes Promise Pipeline, an open-source platform released under the GNU Affero General Public License (AGPL-3.0) that addresses this gap by applying Promise Theory to commitment tracking, auditing, and simulation across domains. The framework treats every verifiable commitment—whether statutory, corporate, or algorithmic—as a structured promise with a defined promiser, promisee, body, verification mechanism, and deadline. By modeling these promises as a graph of interdependent commitments and applying machine learning to that graph, Promise Pipeline moves beyond static accountability dashboards toward a simulation engine capable of answering counterfactual questions: what happens to this network of promises if a key commitment fails?

### 1.1 Why Existing Approaches Fall Short

The dominant paradigm in both AI safety and regulatory compliance is obligation-based enforcement: define what agents must do, impose the rules, and punish violations. This framing has produced real results—models are measurably safer than three years ago, and regulated industries do meet compliance thresholds. But obligation-based systems have structural limitations that better enforcement within the paradigm cannot resolve.

In distributed systems, Mark Burgess identified this problem two decades ago: centrally imposed policies consistently fail when autonomous nodes encounter conditions the policy designer did not anticipate. His alternative—having each node publish its own behavioral commitments (promises)—proved more robust not because the commitments were better written, but because the architecture handled novelty differently. An obligation has no mechanism to degrade gracefully. A promise, by design, can be renegotiated, scoped, and verified by the party it affects.

In organizational management, Sull and Spinosa documented the same pattern: companies that tracked specific, voluntary commitments outperformed those that relied on top-down mandates, because promise-based systems create accountability at the point of action rather than the point of policy.

### 1.2 The Legibility Thesis

The core claim of this paper is not that accountability structures are absent. It is that they are illegible. The promises exist. The verification data exists. The failures exist. But no infrastructure connects them into a representation that a stakeholder—a citizen, a user, a regulator—can interrogate.

James C. Scott's concept of legibility is instructive here. Scott argued that states simplify complex social arrangements into standardized representations in order to govern them. The problem is not simplification per se but the loss of local knowledge in the process. Promise Pipeline inverts this: rather than imposing a top-down schema that erases nuance, it extracts the commitments that agents have already made and renders them visible in their full specificity—who promised what to whom, by when, verified how, and whether it was kept.

The difference between a traditional accountability dashboard and a promise graph is analogous to the difference between an X-ray and an MRI. An X-ray gives you a flat projection: you can see that something is broken, but not how the break relates to surrounding structures. A promise graph provides the volumetric model: the structural relationships between commitments, the dependency pathways through which failure propagates, and the downstream effects of any single break. The dashboard tells you what is broken. The graph tells you what will break next and why. The simulation engine extends the analogy further—it is the surgical simulation that models an intervention on the full structural scan before anyone operates.

The promise graph is, at its most fundamental level, a trust primitive—a basic building block from which trust relationships can be composed, observed, and reasoned about. It does not reduce trust to a single score, a binary, or a credential. It models the full structure of commitments that trust is built on, and provides the infrastructure to determine whether that structure is healthy, degrading, or failing. Credit scores reduce trust to a number derived from financial behavior. Reputation systems reduce it to an aggregate of subjective opinions. Blockchain "trustlessness" eliminates the need for trust by making outcomes deterministic. None of these model the structure of trust itself—the interdependencies, the cascades, the gap between what was promised and what was delivered. The promise graph does.

This is infrastructure, not advocacy. The data says what it says.

-----

## 2. Promise Theory as Analytical Framework

Promise Theory, developed by Mark Burgess beginning in 2004 and elaborated in *Thinking in Promises* (Burgess & Siri, 2014), provides a formal framework for reasoning about autonomous agents and their voluntary commitments. The second edition of *Promise Theory: Principles and Applications* (Bergstra & Burgess, 2019) extends the formalism considerably. This paper extracts five ideas that prove useful for accountability engineering.

### 2.1 Promises vs. Obligations

An obligation is imposed from outside. A promise is declared by the agent itself. This distinction matters because obligations create adversarial dynamics—the agent has incentive to find loopholes—while promises create accountability dynamics: the agent has stated what it will do, and that statement can be tested against reality. In legislation, a statute imposes obligations, but the agents subject to it make specific commitments about how they will comply. Those commitments are the promises. The origin of a promise—whether voluntary, imposed, or negotiated—affects its reliability: empirically, voluntary commitments have higher keep rates than imposed ones, because the agent chose the terms.

### 2.2 Promisee-Side Verification

In Promise Theory, the party affected by a commitment is better positioned to evaluate it than the party that made it. A utility company will always report that its emissions plan is on track. The community breathing the air has a different perspective. Promise Pipeline operationalizes this principle: verification is designed from the promisee's standpoint, using data the promisee can access, rather than relying on the promiser's self-assessment.

### 2.3 Promise Polarity

Burgess insists that every complete cooperative interaction requires two promises: a + promise (give/provide) and a − promise (accept/use). A server promising to reply to DNS queries is useless without a resolver promising to use the replies. In accountability contexts, this surfaces a critical gap: when a government promises equity protections (+give), but the affected community has no corresponding promise to engage with verification (−accept), the binding is incomplete. The promise may be fulfilled in isolation with no downstream effect—effort without impact. Making polarity explicit reveals incomplete bindings as a structural property of the network, not a failure of any individual promise.

### 2.4 Scope

Every promise has a set of agents who are aware it exists. Bergstra and Burgess's analysis of the Boeing 737 Max MCAS failure demonstrates that Boeing's behavioral promise for the MCAS system was scoped to the FAA, with no airlines or pilots included. The promise existed. The agents most affected by it could not see it. Scope determines who can assess, depend on, or hold the promiser accountable for a commitment. A promise where the promisee is not in scope—where the person the promise was made to cannot verify whether it is being kept—is the formal structure underlying both the Boeing MCAS failure and the equity verification gap in HB 2021.

### 2.5 The Promise Schema

Every commitment, regardless of domain, decomposes into a consistent structure:

|Field           |Description                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------|
|**Promiser**    |The agent making the commitment (a legislator, a corporation, an AI provider)                       |
|**Promisee**    |The agent to whom the commitment is made (citizens, users, regulators, communities)                 |
|**Body**        |The specific content of the commitment, stated precisely enough to verify                           |
|**Polarity**    |Give (+) or accept (−): is the agent promising to provide something or to receive and use something?|
|**Domain**      |The category (Emissions, Safety, Uptime, Equity, Transparency, etc.)                                |
|**Status**      |Verified, Declared, Degraded, Violated, or Unverifiable                                             |
|**Origin**      |Voluntary, imposed, or negotiated—how the commitment came into being                                |
|**Target**      |The deadline or threshold for fulfillment                                                           |
|**Verification**|How fulfillment is measured and by whom                                                             |
|**Scope**       |Which agents are aware this promise exists—who can assess and depend on it                          |
|**Dependencies**|Other promises this commitment requires to succeed                                                  |

This schema is domain-general by design. The same fields that decompose an Oregon climate law decompose an AI model card or a corporate ESG report.

### 2.6 The Nesting Composable Trust Primitive

The schema described above is not merely domain-general—it is scale-invariant. A single person's promise to exercise three times a week, a team's sprint commitment to a client, and a state's legislative mandate to reduce emissions by 80% all decompose into the same typed structure: promiser, promisee, body, status, dependencies, verification. The question is whether a single data architecture can operate identically across these scales without requiring separate systems for each.

The Nesting Composable Trust Primitive (NCTP) answers this affirmatively. The NCTP is a recursive data structure in which every promise network—regardless of scale—is represented by the same type (`NetworkPromise`), managed by the same hook (`usePromiseNetwork(networkId, scope)`), and simulated by the same cascade engine. A personal promise network nests inside a team network; a team network nests inside an organizational or civic network. At each level, the structure is identical. The only difference is scope.

Three properties make composition work:

**Scoped identity.** Every promise carries a hierarchical ID (`net-abc123:pp-def456`) that encodes which network it belongs to and where it sits in the nesting hierarchy. This eliminates collision across scales—a personal promise and a legislative promise are never confused—while preserving the ability to trace dependencies that cross network boundaries.

**Promise projection.** An agent can share specific commitments from a private network into a higher-level network without exposing the rest of their context. A team member projects their capacity promise into the team network; the team projects its delivery promise into the client network. The projected promise carries its status and dependency information but not the internal structure that produced it. This is the privacy mechanism: a three-class model (Private / Projected / Contributed) governs what crosses network boundaries.

**Uniform simulation.** The cascade engine operates on `NetworkPromise` regardless of whether the network contains five personal commitments or five hundred legislative mandates. When a projected promise degrades, the simulation propagates effects both within the network where the degradation occurred and upward into any network that depends on the projection. The same BFS traversal, the same status degradation rules, the same health scoring—at every scale.

The NCTP is not a theoretical construct. The implementation—seventeen files, approximately 3,900 lines of TypeScript, zero type errors—consolidates what was previously separate personal, team, and civic architectures into a single recursive primitive. The architectural consolidation follows naturally from the insight: if the promise schema is truly domain-general, the system that operates on it should be scale-general too.

-----

## 3. Proof of Concept: Oregon HB 2021

Oregon House Bill 2021 commits the state to 100% clean electricity by 2040. The law names specific agents (utilities, regulators, communities), assigns specific commitments (emissions targets, equity provisions, planning requirements), and establishes verification mechanisms (regulatory filings, DEQ reports, PUC orders). Five years in, some of those commitments are on track. Others are broken. But no public infrastructure makes the full picture visible.

We applied the promise network framework to HB 2021, decomposing the legislation into 20 discrete promises across 7 domains (Emissions, Planning, Verification, Equity, Affordability, Tribal, Workforce), made by or to 11 distinct agents. Each promise was annotated with its statutory reference, deadline, verification mechanism, current status, and quantitative progress where applicable.

### 3.1 What the Decomposition Reveals

The extraction itself produced findings that are not visible in the original legislative text or in any single agency's reporting:

**The PacifiCorp Cascade.** PacifiCorp / Pacific Power's clean energy plan was rejected by the Oregon PUC in 2024. In isolation, this looks like a single planning failure. In the promise graph, it triggers a cascade: the rejected plan affects downstream emissions commitments, workforce transition promises, and equity provisions that depend on the transition proceeding on schedule. A single promise failure propagates to four or more dependent promises across three domains.

**The Equity Verification Gap.** Emissions promises have robust verification: DEQ tracks actual emissions against statutory baselines, and progress is quantitatively measurable. Equity promises—commitments to environmental justice communities, affordability protections, tribal consultation—have no comparable verification infrastructure. In the formal terms introduced in Section 2: these are design flaws, not agent failures. The promises exist in statute, but they lack corresponding −accept promises from the communities they affect (an incomplete binding), and the communities are effectively out of scope for verification (a scope gap). The result is that measurable commitments get accountability, unmeasurable ones get rhetoric.

**The Affordability Threat.** HB 2021 contains a cost cap that structurally favors electricity rates over emissions reduction. This is formally a threat: a conditional promise with negative valuation for the emissions goals. When the clean energy transition becomes expensive, the cost cap triggers, and emissions goals yield to affordability goals. Unlike dependency-based cascades, which propagate downward through structural requirements, threats propagate laterally—across domains. The cost cap was a deliberate legislative compromise, but the promise graph makes the trade-off computable: under what conditions does keeping the affordability promise require breaking the emissions promise?

### 3.2 From Static Dashboard to Dependency Graph

The initial Promise Pipeline deployment for HB 2021 is a static accountability dashboard: 20 promises rendered with status indicators, trajectory charts, and narrative insights. This is useful—it provides legibility that did not previously exist—but it does not answer the questions that matter most: What happens next? If PacifiCorp's plan continues to be rejected, which promises fail? If the cost cap triggers, what does the cascade look like? Where should advocacy resources be focused for maximum impact?

Answering these questions requires a dependency graph—explicit edges between promises that represent structural prerequisites—and a propagation engine that can simulate the downstream consequences of state changes. This is the transition from tracking to simulation, and it is the central architectural evolution described in this paper.

-----

## 4. Proof of Concept: AI Safety Auditing

AI safety is currently governed by a patchwork of voluntary commitments. Model cards, responsible use policies, safety benchmarks, and public statements by AI providers constitute a de facto promise network—but one that is entirely illegible to the public. No shared representation exists for tracking whether the safety commitments made by major AI providers are being kept, degrading, or being quietly abandoned.

We constructed a demonstration promise network for four major AI providers and two regulatory bodies, extracting 12 promises across 7 domains: Accuracy, Compliance, Safety, Transparency, Openness, Performance, and Privacy. The structural parallels to the civic vertical are architectural, not metaphorical. The same schema decomposes both. The same cascade analysis reveals the same classes of failure. The same verification gap—measurable commitments get accountability, unmeasurable ones do not—appears in both domains.

Three findings from the demonstration are worth noting. First, safety commitments vary significantly across providers—one provider's harmful output rate is an order of magnitude below its stated threshold, while another's latency consistently exceeds its SLA. Second, transparency promises are the most commonly declared and the least verifiable: providers commit to openness but define the terms of measurement themselves. Third, drift over time is the pattern most relevant to ongoing auditing—commitments met at launch degrade as models are updated, fine-tuned, or deprecated. Without continuous monitoring, the promise network erodes silently.

-----

## 5. Promise Networks at Every Scale

The preceding sections describe Promise Pipeline applied to large-scale institutional accountability. But the framework's most useful property—and the one the NCTP makes architecturally concrete—is that it applies identically at the scale of a fifteen-person restaurant, a three-person creative studio, or a single person's commitments to the people in their life and to themselves.

### 5.1 Organizations as Promise Networks

A restaurant is a dense promise network operating in real time. The kitchen promises plates in twelve minutes. The server promises accurate orders to the kitchen and timely service to the customer. The manager promises the schedule two weeks out. The supplier promises Friday delivery. The owner promises the landlord rent, the staff fair wages, the health inspector compliance. Every operational failure is a broken promise that cascades: when the Friday delivery fails, the Saturday specials promise breaks, which cascades to the server's promise to the customer, which cascades to the revenue promise that funds the rent. Nobody models this. People experience it as stress, burnout, and organizational dysfunction.

### 5.2 The Team Promise App

Promise Pipeline for teams is not a task manager with promise branding. The differentiator is the network and the simulation. Task managers track work items in isolation. Promise Pipeline tracks commitments and their interdependencies, then shows what is about to break.

The core features map directly from the institutional verticals: a daily view of active promises with dependency graphs; a health barometer showing aggregate promise-keeping rates as diagnostic (a team whose fulfillment rate drops from 85% to 60% is overloaded, not lazy—the network shows where the bottleneck is); workload capacity simulation that answers whether a team can realistically absorb a new commitment without degrading existing ones; and the cascade view—when someone calls in sick, which downstream promises are affected? The same breadth-first propagation that models PacifiCorp's plan rejection models a sous chef's absence. Through the NCTP, a team member's personal capacity promises project into the team network, and the team's delivery promises project into the client network. A degradation at any level propagates visibly through the nesting hierarchy.

### 5.3 Promise Garden: The Personal Promise Layer

At the smallest scale, Promise Pipeline offers Promise Garden: a free personal promise tracker built on the same schema and the same composable primitive as the civic and organizational verticals. The core metaphor is rewilding a clearcut forest. Every promise plants a seed. Keeping promises grows the garden—trees fill out, water features develop, wildlife returns. Breaking promises leaves stumps. The garden is not a gamification layer bolted onto a tracker. It is the data visualization: each plant species corresponds to a promise type, the health of each plant family reflects the user's reliability score in that domain, and dependencies between personal promises produce visible stress when upstream commitments break. "Exercise three times a week" depends on "sleep by 11pm." When the sleep promise degrades, the exercise plant shows it.

Promise Garden serves three strategic functions. First, it is the entry point to the ecosystem—the visual language transfers directly to the Canopy view used in civic dashboards. Second, it generates data at the individual level that, anonymized and aggregated, improves the prediction models across all verticals. Third, it demonstrates the framework's range: if the same schema that audits state climate legislation also helps someone keep their weekly commitments, the domain-generality claim is not theoretical. It is experienced.

### 5.4 The Data Flywheel

The org and personal verticals transform the training data economics. A civic bill produces 20 promises. A single restaurant operating for a month produces hundreds—shift coverage promises, vendor deliveries, prep completion, maintenance schedules, customer-facing commitments. The civic vertical provides high-quality, carefully annotated seed data; the org vertical provides the volume that makes the ML roadmap in Section 7 tractable.

-----

## 6. From Tracking to Simulation

A static dashboard that shows promise statuses is useful. A simulation engine that models the downstream consequences of commitment changes is a qualitatively different tool.

### 6.1 The Game-State Analogy

AlphaGo succeeded because it combined a value network (given this board position, who is likely to win?) with a policy network (what is the most promising next move?) and used Monte Carlo Tree Search to simulate thousands of possible futures from the current state.

Promise networks have an analogous structure. The current state is the full graph of active promises, their interdependencies, the track records of the agents involved, and the resource constraints in play. A "move" is any state change: a bill amendment, a funding allocation, an actor reneging on a commitment, a regulatory deadline passing. The value network equivalent asks: given this promise network state, what is the probability that a specific outcome is achieved? The policy network equivalent asks: which intervention has the highest expected impact on the network's overall fulfillment rate?

Unlike Go, promise networks operate under incomplete information, continuous action spaces, and multiple competing objective functions. But even modest predictive power would be valuable, because to our knowledge no one is modeling these dynamics systematically. The baseline is zero.

### 6.2 Cascade Propagation

The simplest form of simulation is deterministic cascade propagation. Given the dependency graph, if Promise A fails, which downstream promises are affected? This requires no machine learning—only graph traversal. The cascade simulator takes a promise network, a hypothetical state change, and propagates effects through the dependency graph. Promises downstream of a failure degrade proportionally.

Critically, the type of violation matters for propagation: a fault (the agent tried and failed—PacifiCorp's plan rejection) suggests downstream promises are at risk but recoverable, while a flaw (the promise was inadequately designed—equity provisions without verification infrastructure) suggests systemic redesign is needed. Threats—conditional promises with negative valuation, like the HB 2021 cost cap—cascade laterally across domains rather than downward through dependencies.

### 6.3 Learned Cascade Weights

Deterministic propagation treats all dependency edges equally. In reality, some dependencies are tight (a planning rejection blocks all downstream implementation) while others are loose (an equity commitment degrades but doesn't collapse without its upstream dependency). Machine learning replaces the binary propagation rules with learned weights trained on historical data: given that promises of type X failed in the past, how often did promises of type Y that depended on them also fail?

Legislative archives contain decades of bills, amendments, committee records, and compliance data. Each historical bill is a promise network with known outcomes. The training task is: given the structure and features of a promise network at time T, predict the fulfillment status of each promise at time T+N.

### 6.4 Counterfactual Queries

The user-facing product is an interactive simulation interface. A policy analyst, advocacy organization, or legislative staffer opens Promise Pipeline and sees the current promise network for a bill, a sector, or a jurisdiction. They pose counterfactual questions: What if the funding mechanism changes? What if a key legislator loses their primary? What if a coalition endorses enforcement of a specific set of promises? The simulation re-propagates probabilities through the network and shows which downstream promises become more or less likely to be kept. This is the product: interactive counterfactual simulation over promise networks. Not a dashboard you look at—a model you interrogate.

### 6.5 Actor Reliability Modeling

Historical data enables actor reliability scoring. Given that Agent X has kept N% of past promises in domain Y, and they have just made a new commitment structurally similar to ones they have previously broken, the model flags the discrepancy. Burgess introduces Mean Time to Keep a Promise (MTKP)—analogous to Mean Time to Repair in reliability engineering—measuring not just whether promises are kept but how long they take. An agent who keeps 90% of promises but takes 3x the estimated time has a different reliability profile than one who keeps 90% on schedule. For teams, MTKP is the basis for realistic forecasting. For Promise Garden, MTKP by domain determines which biomes grow fastest.

### 6.6 Intervention Targeting

If an advocacy organization has limited resources, where in the promise network should they focus for maximum cascading benefit? The simulation engine identifies high-leverage nodes: promises whose fulfillment or failure has disproportionate downstream effects. This is the policy network equivalent from the game-state analogy—it identifies the most impactful "move" given the current board state.

-----

## 7. Technical Architecture and ML Roadmap

### 7.1 Current State

Promise Pipeline is deployed on Railway (backend) and Vercel (frontend) as a React-based accountability dashboard platform, released under the AGPL-3.0 license from its founding commit. The backend implements the promise kernel: schema registration, event logging, verification, and integrity scoring. The frontend renders the HB 2021 civic dashboard with 20 hand-annotated promises, 11 agents, 7 domains, emissions trajectories, and narrative insights. Three demonstration verticals (AI/ML auditing, infrastructure SLAs, supply chain transparency) show the framework's applicability across domains.

All promise data is currently embedded in frontend components as hardcoded arrays. There is no dependency graph structure. Cascade insights exist as English-language narratives, not as computable edges. The NCTP implementation (Section 2.6) consolidates the previously separate personal, team, and civic architectures into a single recursive primitive. The transition to a full simulation engine requires three further additions: dependency edges in the data model, a graph traversal engine for cascade propagation, and a machine learning pipeline for prediction.

### 7.2 Phase 2: Dependency Graph and Deterministic Simulation

The immediate next step is adding explicit dependency edges between promises. For HB 2021, approximately 12 dependency relationships have been identified. These edges, combined with a breadth-first search propagation algorithm, enable deterministic cascade simulation with no ML required.

The frontend gains a "What If" interface: users click any promise, toggle its status, and see cascade effects highlighted across the network in real time. This is the minimum viable simulation—and it demonstrates the core interaction pattern that all subsequent ML improvements will enhance.

### 7.3 Phase 3: ML Foundation

The machine learning pipeline has four components:

**Promise Extraction (NLP).** Legislative text is semi-structured. A fine-tuned language model can parse bills, hearings, press releases, and regulatory filings to extract promise schemas automatically. Every promise dashboard built for a client is a labeled training example—this is the data flywheel that makes the platform's ML capability a function of its business development.

**Outcome Prediction.** Given a promise's features (promiser track record, structural position in the network, policy domain, political configuration), predict the likelihood of fulfillment. The initial implementation uses gradient-boosted trees (XGBoost) on tabular features, upgradeable to more complex models as the dataset grows.

**Graph Neural Networks.** The promise network maps naturally to a heterogeneous graph with different node types. Graph attention networks (GATs) learn which connections matter most—a learned version of the deterministic cascade that replaces equal-weight propagation with data-driven weights.

**Anomaly Detection.** Autoencoders or isolation forests on promise embeddings detect promises structurally similar to historically broken ones, or identify when a network is becoming internally contradictory. This is the early warning system: it catches the PacifiCorp cascade before it happens, based on structural similarity to past failures.

### 7.4 Ethical Dataset Strategy

The training data strategy prioritizes public, ethically sourced datasets: legislative archives (GovInfo API, ProPublica Congress API, LegiScan), regulatory filings (PUC orders, DEQ reports, SEC filings), and anonymized client data aggregated at the pattern level. The civic vertical is the ethical "Go board": structured, public, deep history, measurable outcomes.

### 7.5 Automated Verification Infrastructure

The promise schema's verification field currently supports manual assessment. The most significant planned extension is automated verification through direct integration with independent data sources—sensors, public APIs, university research networks, and IoT infrastructure. For HB 2021 emissions promises, this means connecting to EPA AirNow, PurpleAir community sensor networks, and university air quality monitoring stations rather than relying on utility-submitted data filtered through quarterly DEQ reports. The promise status shifts from a periodic human assessment to a continuous, automated signal. This pattern generalizes: infrastructure SLAs verified by independent uptime monitors, supply chain provenance verified by IoT sensors, municipal commitments verified by distributed environmental sensors.

Architecturally, the verification field extends to support automated sources: a data source, an API endpoint, a metric, a threshold, and a polling frequency. The decision to design this field as extensible from the beginning ensures that the transition from self-reported to independently verified promise networks is an extension, not a rewrite.

### 7.6 Data Sovereignty and the Contribution Promise

The org and personal verticals generate the highest volume of training data, but they also pose the sharpest ethical question: how does a platform built on voluntary commitments handle user data without contradicting its own principles?

The answer is to treat data contribution as a promise within the framework itself. Users who opt in to share anonymized promise patterns are making a voluntary commitment to the network—visible in their own dashboard, revocable at any time, and reciprocated by the platform. Four principles govern contribution: opt-in by default (private unless the user actively chooses), granular control (contribute some domains but not others), anonymization at the edge (the platform sees schema structure—domain, duration, outcome—not content), and revocability (withdrawal removes patterns from future training batches).

The privacy-preserving training pipeline applies four complementary techniques to contributed data: temporal batching (breaking timing correlation between generation and training), k-anonymity enforcement within batches (every pattern shares quasi-identifiers with at least k−1 others), differential privacy on continuous features (calibrated Laplace noise with formal leakage bounds), and temporal jitter (perturbing timestamps to destroy within-batch correlation). These layers are complementary—each covers the others' gaps, and less of each is needed individually. In early-stage deployment with a small user base, patterns that cannot meet the k-anonymity threshold accumulate in a staging buffer until the population grows; early training data is sparser but provably safer.

Contributors receive reciprocal value: enhanced predictions trained on the broader dataset, anonymized benchmark reports comparing their organization to aggregate patterns, and network health credits that offset subscription costs. The guiding principle is that the data relationship should be as legible as the commitment relationships the platform tracks.

-----

## 8. Five-Year Roadmap: 2026–2031

**Year 1 (2026): Foundation and First Proof.** HB 2021 dependency graph and deterministic cascade simulator. Interactive "What If" UI. Whitepaper published. Next.js migration. Codebase released under AGPL-3.0 from day one. Promise extraction NLP: first fine-tuned model on hand-labeled legislative schemas. Second civic vertical. 100+ labeled promise instances. Public launch with outreach to Oregon media, civic tech organizations, and climate advocacy groups. Key metrics: 3 civic verticals deployed, 200+ labeled promises, NLP extraction achieving 70%+ F1, first media citation.

**Year 2 (2027): ML Layer and First Revenue.** Outcome prediction model. Actor reliability scoring. Launch Promise Garden as ecosystem entry point. Launch corporate ESG vertical: first paying client. Team/org promise app ($29–199/month tiers). First small business clients. Learned cascade weights replace deterministic propagation. GNN prototype. API access for researchers and journalists. Key metrics: first paying clients, Promise Garden with 1,000+ users, 500+ labeled promises.

**Year 3 (2028): Simulation Engine.** Full counterfactual simulation with probabilistic cascades. Anomaly detection. AI safety vertical moves to production. Intervention targeting. Multi-jurisdiction civic coverage. First automated verification integrations: university sensor networks, EPA AirNow, PurpleAir APIs. International climate agreement vertical (Paris Agreement). Key metrics: 3+ paying verticals, 2,000+ labeled promises.

**Year 4 (2029): Domain Expansion and Transfer Learning.** Cross-domain transfer learning. Supply chain transparency at scale. Infrastructure SLA auditing. Community-contributed domain coverage via the open extraction pipeline. Enterprise tier. Schema governance model for community contributions. Key metrics: active open-source community across 5+ domains, 10,000+ labeled promises.

**Year 5 (2030–2031): The Commitment Graph.** A domain-general, cross-domain graph connecting legislative commitments to corporate commitments to AI system commitments. The schema is the standard. The open codebase is the foundation. Citizens can see, in a single interface, whether the promises made to them—by their government, their employers, their AI tools, their supply chains—are being kept.

-----

## 9. Defensibility

Four structural advantages compound over time.

### 9.1 Open Source Under AGPL-3.0

Promise Pipeline is released under the GNU Affero General Public License from its founding commit. The AGPL requires that anyone who modifies the code and offers it as a network service must release their modifications under the same license. A platform that claims to make accountability structures legible cannot be a black box itself. The simulation engine, the promise schema, the graph analysis tools, and the extraction pipeline are open. The hosted platform—with managed instances, client support, data pipelines, and accumulated training data—is the product. This is the model established by PostgreSQL and Linux: the infrastructure is open, the expertise and operations are the business.

### 9.2 The Trust Primitive

The promise graph is a trust primitive: a basic building block from which trust relationships can be composed, observed, and reasoned about. The formal schema—grounded in Promise Theory and structured enough for ML to learn over—is what turns tracking into simulation. Anyone can build a legislative tracker. The promise graph, and the NCTP that makes it recursive across scales, is what makes trust computable without reducing it to a score.

### 9.3 The Data Flywheel

The dual-source training data flywheel—civic seed data plus organizational volume—drives the platform from deterministic rules to learned prediction. Community-deployed instances that opt in to the data contribution framework expand the training dataset beyond what any single organization could produce. The AGPL ensures that improvements to the extraction pipeline flow back to the commons. The data sovereignty architecture ensures that contribution is voluntary, granular, and revocable.

### 9.4 The Network Effects

As more actors and domains are modeled, the promise graph grows richer. Cross-domain dependencies become visible: a federal funding promise affects state legislative promises, which affect municipal implementation promises, which affect corporate compliance promises. Independent deployments for new jurisdictions and domains each produce promise networks that, when contributed, enrich the global graph. The simulation becomes more accurate because the graph is more complete.

-----

## 10. Conclusion

The accountability structures for AI safety, climate policy, corporate governance, and supply chain transparency already exist. They are scattered, self-assessed, and invisible to the people they are meant to protect. The same is true at the scale of a restaurant, a creative studio, and the promises we make to one another and to ourselves. Promise Pipeline is open-source infrastructure for making them legible, auditable, and simulable—from personal commitments to the obligations nations make to their citizens.

The core technical contribution is the application of Promise Theory to domains where commitments are made but not systematically tracked. The promise schema provides a universal representation. The Nesting Composable Trust Primitive makes that representation recursive across scales. The dependency graph reveals structural relationships invisible in narrative reporting. The simulation engine enables counterfactual reasoning over commitment networks. And the machine learning pipeline, trained on ethically sourced public data, moves the system from deterministic tracking to probabilistic prediction.

The five-year roadmap describes a path from the current static dashboard to a domain-general simulation engine. Each phase is useful on its own. The vision is not contingent on achieving the final state. Every intermediate step delivers value.

In a world where the gap between stated commitments and observed behavior is the central accountability question—in AI safety, in climate policy, in corporate governance, and in the promises we make to one another—the infrastructure for answering that question systematically does not yet exist. The promise graph is the trust primitive that makes it possible. Promise Pipeline builds it, in the open.

-----

## References

Bai, Y., et al. (2022). Constitutional AI: Harmlessness from AI Feedback. *arXiv preprint arXiv:2212.08073*.

Bender, E. M., Gebru, T., McMillan-Major, A., & Shmitchell, S. (2021). On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? *Proceedings of FAccT 2021*. ACM.

Bergstra, J. A., & Burgess, M. (2019). *Promise Theory: Principles and Applications* (2nd ed.). χtAxis Press.

Bergstra, J. A., & Burgess, M. (2019). A Promise Theoretic Account of the Boeing 737 Max MCAS Algorithm Affair. *arXiv:2001.01543*.

Blodgett, S. L., Barocas, S., Daumé III, H., & Wallach, H. (2020). Language (Technology) Is Power: A Critical Survey of Bias in NLP. *Proceedings of the 58th Annual Meeting of the ACL*. Association for Computational Linguistics.

Burgess, M. (2004). An approach to understanding policy based on autonomy and voluntary cooperation. *Proceedings of the 5th IFIP/IEEE International Workshop on Distributed Systems: Operations and Management*. Springer.

Burgess, M. (2015). *In Search of Certainty: The Science of Our Information Infrastructure*. O'Reilly Media.

Burgess, M., & Siri, J. (2014). *Thinking in Promises: Designing Systems for Cooperation*. O'Reilly Media.

European Parliament and Council. (2024). Regulation (EU) 2024/1689 (Artificial Intelligence Act). *Official Journal of the European Union*.

Kipf, T. N., & Welling, M. (2017). Semi-supervised classification with graph convolutional networks. *Proceedings of ICLR*.

Oregon Citizens' Utility Board. (2024). 100% Clean Electricity: How Are Utilities Doing? *oregoncub.org*.

Oregon Department of Environmental Quality. (2025). Oregon Clean Energy Targets: Verification Orders. *oregon.gov/deq*.

Oregon Legislative Assembly. (2021). House Bill 2021, Enrolled. 81st Oregon Legislative Assembly, 2021 Regular Session.

Oregon Public Utility Commission. (2024). Order No. 24-002, Docket UM 2273. *apps.puc.state.or.us*.

Perez, E., et al. (2022). Red Teaming Language Models with Language Models. *arXiv preprint arXiv:2202.03286*.

Scott, J. C. (1998). *Seeing Like a State: How Certain Schemes to Improve the Human Condition Have Failed*. Yale University Press.

Silver, D., et al. (2016). Mastering the game of Go with deep neural networks and tree search. *Nature*, 529(7587), 484–489.

Sull, D., & Spinosa, C. (2007). Promise-based management: The essence of execution. *Harvard Business Review*, 85(4), 78–86.

Sweeney, L. (1997). Weaving technology and policy together to maintain confidentiality. *Journal of Law, Medicine & Ethics*, 25(2–3), 98–110.

Veličković, P., et al. (2018). Graph attention networks. *Proceedings of ICLR*.

Wei, A., et al. (2023). Jailbroken: How Does LLM Safety Training Fail? *arXiv preprint arXiv:2307.02483*.
