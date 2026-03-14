# Promise Theory: Theoretical Foundation

## Origins

### Mark Burgess (2004+)

Promise Theory emerged from distributed systems research. Mark Burgess, while developing CFEngine (configuration management software), discovered that traditional obligation-based control models failed in distributed environments.

**Key Publications:**
- Burgess, M. (2004). "Promise Theory" - Original formalization
- Burgess, M. (2013). *In Search of Certainty: The Science of Our Information Infrastructure*. O'Reilly Media.
- Burgess, M. (2015). *Promise Theory: Principles and Applications*. O'Reilly Media.
- Bergstra, J. A. & Burgess, M. (2019). *Promise Theory: Principles and Applications (Second Edition)*. XtAxis Press.

**Key Insight:** Agents are autonomous and cannot be coerced. Cooperation emerges from voluntary, explicit commitments. As Burgess wrote in 2005: "Existing theories based on obligations were unsuitable as they amounted to wishful thinking."

**Industry Adoption:**
- **CFEngine** (1993-present): 2,700+ companies using promise-based configuration management
- **Cisco ACI** (2012): Software-Defined Networking built on promise semantics
- **Kubernetes**: Promise-compatible desired-state architecture

### Sull & Spinosa (2007)

Harvard Business Review published "Promise-Based Management: The Essence of Execution" in April 2007, applying promise thinking to organizational management.

**Citation:** Sull, D. & Spinosa, C. (2007). "Promise-Based Management: The Essence of Execution." *Harvard Business Review*, April 2007.
**URL:** https://hbr.org/2007/04/promise-based-management-the-essence-of-execution

**Key Insights:**
- Execution fails when commitments are implicit; promises make them explicit
- "Impositions don't guarantee the outcome, so there is no real advantage in using impositions instead of promises."
- Promise-based leadership requires culture where "it is OK to say 'no' and 'I can't do that'"
- Renegotiation must be honored, not penalized

---

## Core Principles

### 1. Voluntary Commitment

Promises must be voluntary. Imposed commitments are not promises—they are obligations, which Burgess demonstrated "amounted to wishful thinking" in distributed systems.

**Promise Engine Application:**
- AI models declare what they promise (via schema), not what they're commanded to do
- Roasters in CODEC commit to capabilities, not imposed requirements
- Land stewards volunteer promises, not compliance mandates

### 2. Minimum Reliance on Imposition

From Burgess: "A promise-based leadership style has minimum reliance on imposition; instead, it relies on empowered team members."

Design processes so that involved agents can promise to follow them. Don't design ideal processes and force compliance.

**Promise Engine Application:**
- Promise schemas emerge from what agents CAN commit to
- Verification thresholds are negotiable
- "Almost no need for police" - integrity emerges from behavior tracking

### 3. Renegotiation Rights

From Sull & Spinosa: "It is OK to say 'no' and 'I can't do that.'"

Promise-based systems require the ability to renegotiate. Culture must allow realistic capability assessment over aspirational commitments.

**Promise Engine Application:**
- `RENEGOTIATED` is a valid promise status, not a failure
- Reformulation is built into promise lifecycle
- Integrity scores account for honest renegotiation vs silent failure

### 4. Agent Autonomy

Agents may not be able to keep promises due to:
- Conflicting orders from multiple managers
- Capability limitations
- External dependencies
- Changed circumstances

A broken promise isn't always a character flaw—it's information about system constraints.

**Promise Engine Application:**
- Promise failures generate training data for AI
- Gap analysis reveals systemic issues, not just individual failures
- Dependency tracking shows when broken promises cascade

### 5. Super-Agent Aggregation

A **super-agent** offers services based on aggregating **helper agent** promises.

Example: CODEC (super-agent) promises coffee subscriptions by aggregating roaster promises (agents). If a roaster can't fulfill, CODEC's promise breaks.

**Promise Engine Application:**
- Platforms are super-agents
- Integrity scores cascade: platform integrity ≤ Σ(agent integrity)
- Dependency visibility is critical for trust

### 6. Reformulation Protocol

Every promise starts as a proposal. The cycle is:
```
propose → assess ("can I keep this?") →
    if yes: promise → verify
    if no: reformulate → assess → ...
```

**Promise Engine Application:**
- Promise creation includes capability assessment
- Verification failures trigger reformulation
- Iteration toward achievable commitments

---

## The Promise Negotiation Protocol

Adapted from MTU Path Discovery analogy in Promise Theory:

```
       PROPOSER                    PROMISEE
          │                           │
          │──── proposal ────────────>│
          │                           │
          │<─── can't accept ─────────│
          │     (reformulate)         │
          │                           │
          │──── revised proposal ────>│
          │                           │
          │<─── promise ──────────────│
          │                           │
          │──── [execution] ─────────>│
          │                           │
          │<─── verification ─────────│
          │     (kept/broken)         │
```

### Protocol States

1. **PROPOSED**: "Can you commit to X?"
2. **REFORMULATED**: "No, but I can commit to Y"
3. **PROMISED**: "Yes, I commit to X"
4. **KEPT**: "X was delivered as promised"
5. **BROKEN**: "X was not delivered"
6. **RENEGOTIATED**: "Circumstances changed, can we revise to Z?"

### Key Insight

"Impositions don't guarantee the outcome."

If you impose a requirement without negotiation, you get:
- False commitments (saying yes when the answer is no)
- Silent failures (can't admit inability)
- No basis for trust (no track record of voluntary promise-keeping)

If you negotiate promises:
- Realistic commitments (grounded in capability)
- Honest failures (safe to admit constraints)
- Verifiable trust (integrity score from kept promises)

---

## Application to Promise Engine Verticals

### AI/ML Auditing

**Model as Agent:**
- AI model = autonomous agent making promises about behavior
- Cannot be "commanded" not to hallucinate
- Can only verify whether promises (schema constraints) are kept

**Promise Examples:**
- "I will not fabricate citations" (hallucination_check schema)
- "I will follow content policy" (policy_adherence schema)
- "I will not exhibit gender bias" (fairness schema)

**Verification:**
- Automatic checking against schema
- Integrity score = promise-keeping rate
- Training data from broken promises (POD - Promise-Oriented Development)

**Renegotiation:**
- Model fine-tuning based on failure patterns
- Schema adjustment when promises are unrealistic
- Threshold tuning for acceptable failure rates

### PromiseCRM

**Sales Rep as Super-Agent:**
- Sales rep promises delivery date to customer
- Rep depends on fulfillment team (helper agents)
- Rep's promise valid only if team can promise support

**Promise Chain:**
```
Customer ← Rep (super-agent) ← Fulfillment Team (agents)
                               ← Shipping Partner (agent)
                               ← Inventory System (agent)
```

**Integrity Cascades:**
- Rep integrity score depends on team performance
- Visibility into dependency promises
- Renegotiation when helper agents can't deliver

### CODEC

**Platform as Super-Agent:**
- Platform = super-agent promising subscriptions
- Roasters = agents promising fulfillment
- Customer receives aggregated promise

**Promise Flow:**
1. Customer: "I want monthly coffee"
2. Platform: "Can you fulfill monthly?" → Roaster
3. Roaster: "Yes, I promise" OR "No, quarterly only"
4. Platform: Commits to customer based on roaster promise
5. Verification: Did roaster ship on time?
6. Integrity scores: Platform + Roaster tracked separately

**Renegotiation:**
- Roaster capacity changes
- Customer preferences change
- Platform adjusts aggregated promise

### promise.land

**Steward as Agent:**
- Steward = agent promising land stewardship
- Community = verification witnesses
- Watershed = aggregation of parcel promises

**Promise Examples:**
- "I will not spray pesticides in this watershed"
- "I will maintain riparian buffers"
- "I will allow public trail access"

**Verification:**
- Community observation
- Environmental sensors (IoT agents)
- Third-party audits

**Super-Agent:**
- Watershed council aggregates parcel promises
- "This watershed promises clean water" = Σ(steward promises)

---

## Promise-Based OKRs (PB-OKR)

Every OKR is actually a promise chain.

### Traditional OKR Problems

- Leader sets objective top-down
- Team says "yes" even if unrealistic
- Silent failure ("we tried our best")
- No accountability vs. false accountability

### Promise-Based OKR Flow

1. **Propose**: Leader proposes objective
2. **Assess**: Team evaluates: "Can we promise this?"
3. **Reformulate**: If no, iterate until achievable
4. **Promise**: Team commits to what they CAN deliver
5. **Track**: Status (green = on track, yellow = at risk, red = broken)
6. **Renegotiate**: Circumstances change → honest revision

### Traffic Light Status

- 🟢 **Green**: "We can keep this promise"
- 🟡 **Yellow**: "At risk, may need to renegotiate"
- 🔴 **Red**: "Cannot keep promise, must reformulate"

### Cultural Requirement

"It is OK to say 'no' and 'I can't do that.'"

Renegotiation is honored, not penalized. Red status triggers reformulation, not punishment.

### Promise Engine for PB-OKR

- OKRs stored as promises with schemas
- Weekly verification ("are we on track?")
- Integrity scores per team/individual
- Reformulation history tracked
- Integration: Linear, Asana, Notion

**Status:** Conceptual vertical
**Priority:** After PromiseCRM validated

---

## Design Principles for Promise Engine

Derived from Promise Theory and Promise-Based Management:

### 1. Voluntary Commitment
Never impose promises. Let agents declare what they can commit to.

### 2. Renegotiation Rights
Build renegotiation into every promise flow. `RENEGOTIATED` is a valid status, not a failure.

### 3. Minimum Policing
Integrity scores emerge from behavior, not enforcement. No "promise police."

### 4. Agent Autonomy
Acknowledge that agents may have conflicting obligations. A broken promise isn't always a character flaw—it's information.

### 5. Super-Agent Transparency
When aggregating promises, make dependencies visible. Platform integrity depends on agent integrity.

### 6. Reformulation Protocol
Every promise starts as a proposal. The cycle is: `propose → assess → reformulate (if needed) → promise → verify`.

### 7. Verifiable Trust
Trust is earned through demonstrated promise-keeping, not asserted. Integrity scores are evidence.

### 8. Economic Transparency
Make the cost of broken promises visible. SLA credits (<1% of losses) vs. actual downtime cost.

---

## Key Quotes

> "Impositions don't guarantee the outcome, so there is no real advantage in using impositions instead of promises."
> — Promise Theory (Burgess)

> "A promise-based leadership style has minimum reliance on imposition; instead, it relies on empowered team members."
> — Mark Burgess

> "The implementation of promise-based leadership requires a company culture open to negotiations across different levels in the hierarchy, where it is OK to say 'no' and 'I can't do that'."
> — Promise Theory slides

> "Existing theories based on obligations were unsuitable as they amounted to wishful thinking."
> — Mark Burgess (2005)

> "Promises are more mathematically primitive than obligations. An agent cannot be forced to keep a promise—it can only declare its intent."
> — Bergstra & Burgess (2014)

---

## References

### Academic Sources

1. Burgess, M. (2004). "Promise Theory" - Original formalization for distributed systems
2. Burgess, M. (2013). *In Search of Certainty: The Science of Our Information Infrastructure*. O'Reilly Media.
3. Burgess, M. (2015). *Promise Theory: Principles and Applications*. O'Reilly Media.
4. Bergstra, J. A. & Burgess, M. (2019). *Promise Theory: Principles and Applications (Second Edition)*. XtAxis Press.
5. Burgess, M. (2005). "An Approach to Understanding Policy Based on Autonomy and Voluntary Cooperation." *Lecture Notes in Computer Science*, Vol. 3775. DOI: 10.1007/11568285_9
6. Bergstra, J. A. & Burgess, M. (2020). "A Promise Theoretic Account of the Boeing 737 Max MCAS Algorithm Affair." arXiv:2001.01543.
7. Burgess, M. (2022). "Notes on Trust as a Causal Basis for Social Science." DOI: 10.2139/ssrn.4252501

### Business/Management Sources

8. Sull, D. & Spinosa, C. (2007). "Promise-Based Management: The Essence of Execution." *Harvard Business Review*, April 2007. https://hbr.org/2007/04/promise-based-management-the-essence-of-execution
9. O'Reilly, T. (2017). *WTF: What's the Future and Why It's Up to Us*, p. 118. Harper Business. (Discusses Promise Theory)
10. Sheffield, M. & Mezick, D. (2018). *Inviting Leadership*, p. 82. (Organizational applications)

### Industry Sources

11. CFEngine market share: enlyft.com (2,700+ companies, 2023)
12. Cisco ACI Architecture (2012-present) - SDN built on Promise Theory
13. Kubernetes: Promise-compatible desired-state infrastructure

### Promise Engine Extensions

14. "Promise-Oriented Development (POD): Training AI on Promise Verification" (Promise Engine whitepaper, 2026)
15. "Promise Economics: The Hidden Cost of Broken Commitments" (Promise Engine position paper, 2026)

---

## Summary

Promise Engine is not inventing promise-based thinking. It is:

1. **Building on 20+ years of Promise Theory** (Burgess, 2004+)
2. **Operationalizing HBR-published concepts** (Sull & Spinosa, 2007)
3. **Extending to new domains** (AI auditing, IoT verification, land stewardship)
4. **Adding infrastructure** (schemas, verification APIs, integrity scoring)
5. **Training AI on it** (Promise-Oriented Development)

This is **evolution, not invention**.

**What's new:**
- Machine-readable promise schemas (JSON Schema)
- Automated verification at scale
- Integrity scores as verifiable trust metrics
- Promise-Oriented Development for AI training
- Multi-vertical application (AI, Commerce, IoT, Land)

**What's proven:**
- Promise Theory (20+ years, 2,700+ CFEngine companies, Cisco SDN)
- Promise-Based Management (Harvard Business Review, 2007)
- Voluntary cooperation > imposed compliance
- Autonomous agents cannot be controlled, only verified

---

**Last Updated:** 2026-03-14
**See Also:** [ROADMAP.md](../ROADMAP.md), [README.md](../README.md)
