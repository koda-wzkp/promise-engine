# The Anakin Cascade: A Promise Theory Analysis of the Fall of the Galactic Republic

**By Conor Nolan-Finkel | Promise Pipeline**
**Vertical: General | Category: Case Study, Promise Theory**

-----

*Every accountability failure is a cascade. The question is whether you saw the dependency graph before the network collapsed.*

-----

## The Setup

Promise Pipeline applies Promise Theory — a framework developed by Mark Burgess for reasoning about autonomous agents and their voluntary commitments — to accountability tracking and simulation. We've used it to analyze Oregon climate legislation, AI safety commitments, and organizational health. The framework is domain-general: the same schema that decomposes a state climate bill decomposes any network of interdependent commitments.

Including fictional ones.

The Star Wars prequel trilogy is, structurally, a cascade failure across a promise network. The fall of the Galactic Republic is not a story about one bad decision. It is a story about interdependent commitments failing in sequence, where each failure propagates through dependency edges to collapse downstream promises. The dependency graph makes the structural relationships visible — and reveals patterns that map directly to real-world accountability failures we've documented in civic legislation and AI safety.

This is not a joke post. The structural analysis is real. The patterns transfer. And it's more fun to explain verification gaps with lightsabers.

-----

## The Promise Network

We identified 13 discrete promises across 9 agents and 6 domains in the prequel trilogy's narrative. Each promise was annotated with the standard Promise Pipeline schema: promiser, promisee, body, domain, status, verification method, and dependency edges.

**Network Health Score: 12/100. Grade: F.**

For comparison, Oregon HB 2021 — a real piece of climate legislation with real compliance failures — scores 46. The Galactic Republic's promise network is structurally worse, and the reasons why are instructive.

### The Agents

The network includes Anakin Skywalker, Obi-Wan Kenobi, Sheev Palpatine, Padmé Amidala, Yoda, the Jedi Council, Qui-Gon Jinn, the Clone Army, and one unattributable agent: whoever — or whatever — originated the Chosen One prophecy. That ninth agent matters. A commitment with no identifiable promiser is a structural anomaly the schema makes visible by requiring the field to exist.

### The Domains

Six domains organize the promises: Training, Conduct, Romance, Mentorship, Protection, Loyalty, Military, Safety, and Destiny. The domain distribution is itself revealing — Romance and Protection are overrepresented relative to their verification infrastructure, while Conduct (the domain most critical to institutional integrity) relies entirely on self-report.

-----

## The Promises

### SW-001: "I will train the boy" (Qui-Gon → Anakin)

Status: Violated. The promiser died before fulfillment. The promise was transferred to Obi-Wan without Anakin's consent — a forced renegotiation with no succession clause. In organizational terms: a leadership transition where commitments transfer without stakeholder input. The new promiser's capacity, relationship, and commitment quality may differ from the original. In this case, they did.

### SW-002: "I will train him, as I promised" (Obi-Wan → Anakin)

Status: Degraded. Obi-Wan kept the letter of the promise but the promisee-side experience was degraded. Anakin consistently reported feeling held back and distrusted. "Visible confusion" is not a verification method. This illustrates the gap between promiser-side fulfillment ("I trained him") and promisee-side verification ("I was held back"). Promise Theory is explicit: the promisee is better positioned to evaluate the promise than the promiser.

### SW-003: Jedi Code — No Attachments (Anakin → Jedi Council)

Status: Violated. Violated immediately on Naboo. The Jedi's entire conduct compliance system relies on the honor system — pure self-report, no promisee-side verification. This is the Jedi Equity Verification Gap: the domain with the most institutional significance has the weakest verification infrastructure.

### SW-004: "I don't like sand. Here everything's soft and smooth." (Anakin → Padmé)

Status: Declared. What does "soft and smooth" mean as a measurable commitment? No target, no metric, no threshold. The most famous degraded-quality promise declaration in cinema. And yet — it worked. Padmé accepted the promise. This illustrates something the framework captures: promise quality and promise effectiveness are not the same variable. A poorly specified promise can still create a binding commitment if the promisee accepts it.

### SW-005: Secret Marriage on Naboo (Anakin ↔ Padmé)

Status: Verified — but hidden from the network. This is a shadow node: a real, verified promise that is invisible to the broader promise graph. The Jedi Council's model of the commitment network is incomplete. They cannot cascade-check against a promise they don't know exists. Every promise graph is only as good as its coverage. Hidden promises are the dark matter of commitment networks — they affect everything but appear nowhere in the model.

A note on modeling: SW-005 *conflicts* with SW-003 (the Jedi Code), but it does not *depend* on it. The marriage doesn't require the no-attachments code to succeed — it violates it. This distinction matters in the graph. A dependency edge means "this promise requires that promise to succeed first." A conflict is a structural tension between two promises that cannot both be kept. The promise graph must model both relationships, but they propagate differently: dependencies cascade failure downward, while conflicts surface as insights about the network's internal contradictions.

### SW-006: "We will watch your career with great interest" (Palpatine → Anakin)

Status: Verified. The most reliably kept promise in the entire network. Palpatine's actor reliability score for promises made to Anakin is 100%. Every mentorship commitment, every political favor, every expression of trust — delivered. The problem: every promise he keeps serves a cascading violation elsewhere. This is the reliability scoring problem: high reliability on malicious promises is worse than low reliability on benign ones. Actor reliability scoring without intent modeling is dangerous.

### SW-007: "I promise I will not let that happen again" (Anakin → self)

Status: Violated. After Shmi's death, Anakin makes an unbounded protection promise. Scope: unlimited. Target: undefined. Verification: impossible. This creates infinite downstream obligation — every future threat to anyone Anakin cares about becomes a test case. Unbounded promises always cascade into violations because reality will eventually exceed any agent's capacity.

### SW-008: "I can save her" (Palpatine → Anakin)

Status: **Unverifiable. CASCADE SOURCE.**

This is the promise that collapses the network. Palpatine promises that the dark side can prevent Padmé's death. There is no evidence the power exists. No precedent. No mechanism. No independent verification of any kind. Palpatine himself later admits the power was achieved by "only one" — someone else — and even that claim is unverifiable.

The promiser cannot demonstrate the capability he is promising. The promisee cannot verify it before acting on it. And the promisee has an unbounded need (SW-007) that makes him uniquely vulnerable to accepting an unverifiable offer. This is the structural vulnerability: an unbounded promise (SW-007) meets an unverifiable promise (SW-008), and the result is catastrophic action taken on the basis of zero evidence.

In every domain Promise Pipeline analyzes, the highest-stakes promises are the ones with the weakest verification. In HB 2021, equity promises to environmental justice communities have no verification mechanism. In AI safety, the most consequential behavioral commitments are self-assessed. In the Galactic Republic, the promise that determines whether the entire network collapses has no verification at all.

### SW-009: Oath to the Jedi Order (Anakin → Jedi Council)

Status: Violated. Cascaded from SW-008. Once Anakin accepts Palpatine's unverifiable promise, this oath immediately violates. A structural conflict: you cannot keep your oath AND pursue the dark side offer. The cascade is instantaneous — no gradual degradation, no early warning.

### SW-010: Order 66 (Clone Army → Palpatine)

Status: Verified. The only fully automated, sensor-verified promise in the network. The inhibitor chip IS the verification mechanism — compliance without the agent's consent. This is the dark mirror of automated promisee-side verification: the technology exists to verify promises without relying on self-report, but the implementation serves the network's most destructive actor. The technology is neutral. The architecture determines the outcome.

### SW-011: "It's over, Anakin. I have the high ground." (Obi-Wan → Anakin)

Status: Verified. A conditional warning promise: "if you do X, Y will happen." Verification occurs only when the condition is triggered. Obi-Wan declared the consequence, Anakin ignored the warning. Promisee-side verification was available in real time and the promisee rejected it. The promise was verified exactly as stated. The promisee's refusal to accept the verification data is itself a data point about information asymmetry under stress.

### SW-012: The Chosen One Prophecy (Unknown → Jedi Council)

Status: Violated. This is an unattributable promise — a commitment with no identifiable promiser. "The Chosen One will bring balance to the Force" is the body. The Jedi Council organized their entire strategic posture around it. They recruited Anakin because of it. They tolerated his behavioral violations because of it. They built an institutional strategy on a promise that no accountable agent had ever made.

The promise graph makes this structurally visible. The schema requires a promiser field. When that field reads "Unknown," the graph is flagging a structural anomaly: you are building dependencies on a commitment that no one has agreed to support. A prophecy is not a promise. It has no promiser to hold accountable, no verification mechanism to test, and no renegotiation pathway when it fails.

This pattern appears wherever institutions build strategy on commitments that no agent actually made. "The market will correct itself" is a prophecy, not a promise — no agent is committed to making it happen. "Moore's Law will continue" is a prophecy. "AI capabilities will plateau before they become dangerous" is a prophecy. In every case, the institution acts as if the commitment exists, builds dependencies on it, and has no recourse when it fails because there is no promiser to hold accountable.

### SW-013: "Hello there." (Obi-Wan → everyone)

Status: Verified. 100% fulfillment rate across all observed encounters. This is the structural counterpoint to every failure in the network: actor reliability is built on small, repeated, observable behavioral commitments. Not grand declarations. Not unbounded promises. Not prophecies. Small promises, kept consistently, verified by the people they're made to. The greeting is trivial. The pattern it demonstrates is the foundation of trust infrastructure.

-----

## The Cascade

The full cascade reads as a dependency chain:

```
SW-012 (Prophecy — unattributable)
  → Jedi Council recruits and tolerates Anakin
    SW-001 (Qui-Gon's training promise) VIOLATED — promiser dies
      → SW-002 (Obi-Wan's forced renegotiation) DEGRADED
        → SW-003 (Jedi Code) VIOLATED — no verification catches it
          ↔ SW-005 (Secret marriage — shadow node, conflict with SW-003)
    SW-007 (Unbounded protection promise) VIOLATED — creates vulnerability
      → SW-008 (Palpatine's unverifiable offer) UNVERIFIABLE — CASCADE SOURCE
        → SW-009 (Jedi oath) VIOLATED — instant cascade
          → SW-010 (Order 66) VERIFIED — automated execution
          → SW-011 (High ground) VERIFIED — conditional warning fulfilled
          → SW-012 (Prophecy) VIOLATED — the foundation crumbles
```

The Republic fell because an institution organized its strategy around an unattributable prophecy, trained its key agent through a forced renegotiation, failed to verify a single conduct violation for over a decade, and then lost that agent to an unverifiable promise that exploited an unbounded commitment — all while the most reliable promise-keeper in the network was the agent engineering the collapse.

-----

## The Structural Analysis Battery

The promise-by-promise walkthrough tells the narrative. But Promise Pipeline doesn't stop at narrative. We ran the same structural analysis battery on the Anakin Cascade that we run on real legislative and organizational commitment networks — twelve metrics across network science, game theory, and ecological resilience theory. Here's what the numbers say.

### Percolation: Where Does the Network Shatter?

Percolation theory asks: if you remove nodes from a network one at a time, at what point does the network fragment — losing its structural coherence in a phase transition rather than degrading gradually?

We removed promises from both the Anakin Cascade and HB 2021 in worst-first order (violated and unverifiable first) and tracked the size of the largest connected component at each step.

**The Anakin Cascade has a clear phase transition.** When SW-009 (Anakin's Jedi oath) is removed at step 4, the largest connected component drops 30.8% in a single step — from 46% to 15% of the network. That's not gradual degradation. The network structurally fragments. One promise removal shatters the network into 7 disconnected pieces.

**HB 2021 has a delayed but real inflection.** Under worst-first removal, the network degrades gradually through 8 steps, then P001 (PGE emissions reduction) is removed at step 9 and the LCC drops 15% — from 30% to 15%. The inflection is real but later and less dramatic.

**Under targeted attack (removing highest-degree nodes first), HB 2021 fragments at step 4 with only 4 promises removed** — the network is at 80% capacity but already structurally broken. Under random removal, it survives until step 14. That's a 3.5x difference in resilience. This is Barabási's finding in *Network Science* (2016): scale-free networks are robust to random failure but fragile to targeted attack on hubs. Promise networks behave the same way.

The current health score (47 for Anakin, 46 for HB 2021) treats them as roughly equivalent. The percolation analysis shows they're structurally different. The Anakin network is more fragile — it fragments with fewer removals and has a sharper phase transition. A health score alone doesn't capture this. What you'd want to show is: "Your network health is 46, but removing P001 alone would fragment the network. P001 is your critical threshold node."

### Betweenness Centrality: Finding the Bridges

Degree counts connections. Betweenness centrality counts how many shortest paths between other nodes pass through a given node. A promise with high betweenness is a bridge — remove it and you sever pathways between entire domains (Freeman, 1977).

In the Anakin Cascade, the critical bridge is **SW-009** (Anakin's Jedi oath) at BC = 0.333 — the highest betweenness centrality in either network. It connects the training lineage upstream (SW-001, SW-002) to Order 66 and the prophecy downstream. This is consistent with the percolation finding: SW-009 is the keystone whose removal shatters the network.

But betweenness reveals something percolation doesn't: **SW-010** (Order 66) has a centrality of 0.182, making it the third-highest bridge despite being a "verified" promise. Its structural importance comes from its position — it's the junction between the cascade source (SW-008) and the downstream consequences. Verified promises can be critical bridges. Status and structural importance are independent variables.

In HB 2021, by comparison, the critical bridge is P001 (PGE emissions) at BC = 0.208, followed by P002 (PGE planning, BC = 0.156) and P018 (workforce development, BC = 0.136). In both networks, 3–4 nodes carry essentially all the bridging function. The remaining nodes are leaves or isolates with zero betweenness.

### Clustering Coefficient: Do Alternative Paths Exist?

The clustering coefficient measures how interconnected a node's neighbors are. If promise A depends on B and C, and B also depends on C, there's a triangle — an alternative path if one edge fails (Watts & Strogatz, 1998).

**The Anakin Cascade's average clustering is 0.179. HB 2021's is 0.108.** Both are low. But the real finding is *where* the clustering exists and where it doesn't.

In HB 2021, the only non-zero clustering is in the Workforce domain. P018, P019, and P020 form a triangle — internal redundancy means if one workforce promise fails, the others aren't immediately orphaned. No other domain has this property. The Equity domain has zero clustering. Each equity promise connects only to P001. If P001 fails, each equity promise becomes an isolated island with no structural support.

The promises made to the most vulnerable stakeholders are not only the least verified (as documented in the whitepaper) but also the least structurally resilient. They have no redundant dependency paths. This isn't a coincidence. The equity provisions were added as downstream beneficiaries of the emissions transition, not as structurally integrated commitments with their own support infrastructure.

### Small-World Analysis: How Fast Do Cascades Spread?

Small-world networks have high clustering and short path lengths — meaning information (and failure) propagates unusually fast (Watts & Strogatz, 1998). We compute sigma = (C/C_random) / (L/L_random), where sigma > 1 suggests small-world properties.

**The Anakin Cascade has a sigma of 3.98.** HB 2021's is 1.70. Both are above 1, confirming small-world structure. But the Anakin network's dramatically higher sigma explains something about the narrative that the narrative itself doesn't articulate: why the entire Republic can collapse from a single promise failure. Every node is only 2–3 hops from every other node. A cascade that starts at SW-008 reaches SW-010 (Order 66) in two steps. There's no buffer. No firewall. No domain isolation that could contain the failure.

### Assortativity: Do Hubs Connect to Hubs?

Degree assortativity measures whether high-degree nodes tend to connect to other high-degree nodes (assortative) or to low-degree nodes (disassortative). Disassortative networks are the worst topology for resilience — hub failure directly orphans leaf nodes with no alternative (Barabási, 2016).

**Both networks are disassortative.** HB 2021: r = -0.34. Anakin: r = -0.41. Hubs connect to leaves, not to other hubs. When P001 fails in HB 2021, it doesn't take down another hub that has its own support structure — it takes down the equity promises (P010, P011, P012) that have no alternative connections. This is the structural reason the equity promises are so vulnerable, expressed as a single number.

### Verification-Status Correlation: Is This a Monitoring Problem or a Structural Problem?

This is the finding that changes the diagnosis.

We scored each verification method (sensor = 4, audit = 3, filing = 2, benchmark = 2, self-report = 1, none = 0) and each status (verified = 4, declared = 3, degraded = 2, violated = 1, unverifiable = 0), then computed the Pearson correlation.

**In the Anakin Cascade, the correlation between verification strength and promise status is 0.881** — near-perfect. Better-verified promises are kept. Poorly-verified ones fail. The mechanism design failure is the root cause. Fix the monitoring and the network improves.

**In HB 2021, the correlation is 0.251** — weak. Verification strength barely predicts whether a promise is kept. Some well-verified promises are degraded (P001 has audit verification but is degraded). Some poorly-verified promises are in acceptable states. The failures are driven by structural and political factors that verification alone can't address.

This is a concrete, quantitative statement about intervention strategy. The Anakin Cascade is a verification problem: build better monitoring and the network stabilizes. HB 2021 is a structural problem: the commitments themselves are architecturally unsound, and better monitoring won't fix that. The intervention strategy differs completely — and the correlation coefficient tells you which one you're dealing with.

### Shadow Node Detection: What Can't the Network See?

The analysis flagged verified promises that exist outside the main connected component — structurally invisible to observers who only see the primary network.

In the Anakin Cascade, three shadow nodes were detected: **SW-005** (the secret marriage), **SW-006** (Palpatine's mentorship), and **SW-013** ("Hello there"). The secret marriage is the canonical example — a verified promise the Jedi Council doesn't know about, creating a hidden dependency that enables the cascade. SW-006 is equally important: Palpatine's mentorship is verified and structurally disconnected from the Jedi network, which means the Council can't see the trust relationship being built between Palpatine and Anakin.

In HB 2021, P009 (utility self-reporting) and P014 (the cost cap) appeared as shadow nodes. The cost cap being structurally disconnected from the main network is a finding about the law's architecture — the affordability mechanism exists in its own island, disconnected from emissions, equity, and workforce. The affordability-emissions conflict documented in the whitepaper isn't just a policy tension. It's structural isolation. The two domains literally cannot cascade-support or cascade-harm each other through the dependency graph.

### Actor Reliability Under Strategic Analysis: The Palpatine Problem

Standard reliability scoring computes kept/total for each agent. Palpatine scores 100% — every promise to Anakin delivered. This is the naive metric, and it produces a dangerously misleading trust signal.

The strategic analysis adds a second dimension: the network health impact of the promises being kept. An agent with 100% reliability on promises that damage the network is more dangerous than an agent with 50% reliability on benign promises. The analysis flags perfect reliability alongside negative network health contribution to detect strategic misalignment.

This has direct implications for scoring architecture. If actor reliability is just a fulfillment rate, a bad-faith actor with a perfect score breaks the model. The scoring system must weight the network health impact of fulfillment, not just whether fulfillment occurred.

### Ecological Resilience: Where Is This Network in Its Lifecycle?

C. S. Holling's adaptive cycle (1973) describes how complex systems move through four phases: exploitation (rapid growth), conservation (rigidity builds), release (collapse), and reorganization (rebuilding).

**The Anakin Cascade classifies as RELEASE.** 38% of promises violated, active cascade in progress, the network is in structural collapse. This is the phase where triage matters more than optimization.

**HB 2021 classifies as MIXED** — no clear single phase. Different domains are in different lifecycle phases simultaneously. Emissions is in conservation (rigidifying around existing structures). Equity is stuck in exploitation (promises declared but never established). Workforce is in early reorganization. The mixed classification is the most interesting result: it suggests the law isn't failing in one direction — it's fragmenting along domain lines, with each domain on its own trajectory.

Gunderson and Holling's panarchy framework (2002) extends this to nested adaptive cycles at different scales: municipal within state within federal within international. This is the theoretical foundation for the composable trust primitive argument — nested promise graphs across organizational scales, each with its own adaptive cycle, where collapses at one level trigger reorganization at others.

### Domain Integration: Are Domains Supporting Each Other?

The domain integration score measures the fraction of dependency edges that cross domain boundaries. High integration means domains are interdependent — failure in one propagates to others, but strength in one also supports others. Low integration means domains are siloed.

The Anakin Cascade has moderate integration — the Training → Loyalty → Military pathway crosses domains, which is precisely why the cascade propagates so broadly. HB 2021 has lower integration, with Affordability showing zero cross-domain edges. An isolated domain is structurally on its own — it can't cascade-harm other domains, but it also can't cascade-support them. The cost cap's structural isolation means that even if affordability promises are perfectly kept, they contribute nothing to the health of the rest of the network.

-----

## Seven Structural Patterns

The analysis surfaced seven patterns that appear in both the Galactic Republic and in every real-world commitment network we've studied:

### 1. The Verification Gap

The highest-stakes promises have the weakest verification. In the Republic, the promise that collapses the network (SW-008) has no verification at all. In HB 2021, equity promises to environmental justice communities are unverifiable. In AI safety, the most consequential behavioral commitments are self-assessed. The pattern is structural, not accidental: the promises that matter most to the people who have the least power are the ones nobody built monitoring infrastructure for.

### 2. The Self-Report Failure

The Jedi Council's conduct compliance system is entirely self-report — SW-003 was violated for over a decade without detection. This is not unique to fictional institutions. Corporate ESG self-assessment, AI provider self-evaluated safety benchmarks, utility-submitted emissions data — the same architecture, the same blind spot.

### 3. The Shadow Network

Verified promises that are invisible to the official model create unaccounted dependencies. The secret marriage (SW-005) enables the cascade by creating a hidden emotional dependency that the Council's model doesn't include. In organizational terms: side agreements, informal commitments, political bargains that don't appear in statutory text, undocumented team agreements.

### 4. Reliability Without Intent

Palpatine's 100% reliability score is the strongest argument against naive fulfillment-rate metrics. High reliability on strategically malicious promises produces worse network outcomes than low reliability on benign ones. Scoring systems that measure fulfillment without modeling network impact are structurally dangerous. The scoring model must include the second variable: what happens to the network when this promise is kept?

### 5. The Unbounded Promise

"I will not let that happen again" has no scope, no target, no verification criteria, and no ceiling. It creates infinite downstream liability. Every future circumstance that touches the promise's domain becomes a test case. Unbounded promises always cascade into violations because reality will exceed any agent's capacity. They also create vulnerability vectors: the promiser becomes susceptible to any offer that claims to satisfy the unbounded need, regardless of evidence. "We'll do whatever it takes." "Failure is not an option." "The customer always comes first." These sound like strength. They are structural weaknesses.

### 6. The Unattributable Foundation

The Chosen One prophecy has no promiser, no verification mechanism, and no renegotiation pathway. The Jedi Council built their institutional strategy on it — recruitment decisions, tolerance for behavioral violations, resource allocation. When it collapsed, it took the entire structure with it.

This pattern appears wherever institutions build strategy on commitments that no agent actually made. "The market will correct itself" is a prophecy, not a promise. "AI capabilities will plateau before they become dangerous" is a prophecy. The promise graph makes this visible by requiring a promiser field. When the field reads "Unknown," that is the signal: you are building on a foundation that no one has agreed to support.

### 7. The Phase Transition

Promise networks don't degrade smoothly. They fragment at threshold points — the percolation finding. A network at 80% capacity can already be structurally broken if the right hub fails. The health score says 80. The dependency graph says the next failure is catastrophic. The Anakin Cascade demonstrates this in compressed narrative time: SW-009's violation doesn't degrade the network gradually. It shatters it. A 30.8% loss of structural coherence in a single step.

-----

## Why This Matters

This analysis is funny. It's also structurally real.

The same cascade patterns that destroy the Galactic Republic appear in every domain Promise Pipeline analyzes. The verification gaps, the self-report failures, the shadow nodes, the reliability-without-intent problem, the unbounded promises, the unattributable foundations, the phase transitions — these are not narrative devices. They are structural properties of commitment networks that produce predictable failure modes.

The structural analysis battery — percolation, centrality, clustering, small-world analysis, verification correlation, shadow node detection, ecological phase classification — transforms the promise graph from a visualization into a diagnostic instrument. Two networks can score identically on health and have completely different structural profiles: one is a verification problem (fix the monitoring), the other is an architectural problem (redesign the dependencies). The battery tells you which.

Promise Pipeline exists to make these structures visible before they cascade. The dependency graph doesn't tell you what to do. It tells you what breaks next and why. Whether the network is a state climate bill, an AI safety commitment framework, a team's operational promises, or a galaxy far, far away.

The infrastructure for seeing the cascade before it happens is the same in every case. The promise graph is the trust primitive. The simulation engine is the intervention model. The structural analysis battery is the diagnostic.

And Obi-Wan's "Hello there" — a small, consistent, observable behavioral promise with a 100% fulfillment rate — remains the best example of how actor reliability is actually built: not through grand declarations, but through small commitments, kept consistently, verified by the people they're made to.

-----

*Promise Pipeline is an open-source civic accountability platform. The interactive Anakin Cascade promise graph is available at promisepipeline.com/demo/anakin.*

*Related promises: SW-001 through SW-013*
*Vertical: General*

-----

### References

Barabási, A.-L. (2016). *Network Science*. Cambridge University Press.

Burgess, M. (2004). An approach to understanding policy based on autonomy and voluntary cooperation. *Proceedings of the 5th IFIP/IEEE International Workshop on Distributed Systems*.

Burgess, M., & Siri, J. (2014). *Thinking in Promises: Designing Systems for Cooperation*. O'Reilly Media.

Freeman, L. C. (1977). A set of measures of centrality based on betweenness. *Sociometry*, 40(1), 35–41.

Gunderson, L. H., & Holling, C. S. (2002). *Panarchy: Understanding Transformations in Human and Natural Systems*. Island Press.

Holling, C. S. (1973). Resilience and stability of ecological systems. *Annual Review of Ecology and Systematics*, 4, 1–23.

Hurwicz, L. (1960). Optimality and informational efficiency in resource allocation processes. In K. Arrow, S. Karlin, & P. Suppes (Eds.), *Mathematical Methods in the Social Sciences*. Stanford University Press.

Nolan-Finkel, C. (2026). Promise Pipeline: A Trust Primitive for Commitment Networks. Version 4.0.

Scott, J. C. (1998). *Seeing Like a State: How Certain Schemes to Improve the Human Condition Have Failed*. Yale University Press.

Stauffer, D., & Aharony, A. (1994). *Introduction to Percolation Theory* (2nd ed.). Taylor & Francis.

Sull, D., & Spinosa, C. (2007). Promise-based management: The essence of execution. *Harvard Business Review*, 85(4), 78–86.

Watts, D. J., & Strogatz, S. H. (1998). Collective dynamics of 'small-world' networks. *Nature*, 393(6684), 440–442.
