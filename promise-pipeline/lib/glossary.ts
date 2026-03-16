/**
 * Promise Engine Glossary — formal terminology for promise network analysis.
 *
 * Terms marked [PE] are original to Promise Engine / Promise Pipeline.
 * Others are drawn from Promise Theory (Mark Burgess) or network science.
 */

export interface GlossaryEntry {
  term: string;
  tag: "PE" | "PT" | "NS"; // Promise Engine, Promise Theory, Network Science
  firstIdentified?: string;
  definition: string;
  architecturalImplication?: string;
}

export const glossary: GlossaryEntry[] = [
  {
    term: "Verification Dependency Chain",
    tag: "PE",
    firstIdentified: "JCPOA analysis (IAEA verification → Additional Protocol → sanctions relief)",
    definition:
      "A sequence of promises where each link enables the verification of downstream promises. When any link in the chain fails, verification capability propagates downward: every promise verified by the broken link loses its verification mechanism, even if its compliance status hasn't changed. Distinguished from a standard dependency edge: dependency edges propagate status changes, verification dependency chains propagate certainty changes. In the JCPOA, the verification dependency chain ran: sanctions relief → cooperation (Additional Protocol) → IAEA monitoring → enrichment verification. When sanctions relief collapsed, the entire chain failed, and the international community lost the ability to verify any of Iran's nuclear commitments.",
    architecturalImplication:
      "Verification infrastructure is a node in the promise graph, not external to it. Any promise that enables verification should be identified and tracked with the same rigor as the promises it verifies.",
  },
  {
    term: "Shallow Enforcement Floor",
    tag: "PE",
    firstIdentified: "JCPOA analysis ('political commitments' framing)",
    definition:
      "A property of a promise network where the promises lack binding enforcement mechanisms — the entire network rests on voluntary cooperation with no legal recourse for non-compliance. The JCPOA was explicitly characterized by the U.S. State Department as 'political commitments,' not a binding treaty. This created a structural vulnerability: any party could withdraw without legal consequence, and one party's withdrawal triggered cascading non-compliance by others. Distinguished from a verification gap: a verification gap means you can't tell whether promises are being kept. A shallow enforcement floor means you can't compel them to be kept even when you know they're being broken.",
  },
  {
    term: "Certainty Cascade",
    tag: "PE",
    firstIdentified: "JCPOA analysis (AP suspension → verification collapse)",
    definition:
      "The propagation of uncertainty through a promise network when verification infrastructure fails. Distinguished from a status cascade: in a status cascade, a violated promise causes dependent promises to degrade. In a certainty cascade, a failed verification mechanism causes verified promises to become uncertain — their status label may not change, but the confidence in that label drops. A promise can be simultaneously 'violated' and 'certain' (evidence confirms the violation) or 'violated' and 'uncertain' (the violation was confirmed by a mechanism that no longer functions). The distinction matters for intervention targeting: status cascades tell you what's broken, certainty cascades tell you what you can no longer see.",
  },
  {
    term: "Promise Factory",
    tag: "PE",
    firstIdentified: "Paris Agreement analysis (March 2026)",
    definition:
      "A commitment whose primary function is to generate, escalate, and track child promises rather than be directly verifiable itself. The factory's status is computed from its children's statuses — the factory never has its own check-in or verification event. It is fulfilled when enough of its children are fulfilled, according to a completion condition (all, threshold, or weighted). Distinguished from a direct promise by the absence of a directly verifiable body. 'Reduce emissions 80% by 2030' is a direct promise. 'Lose 30 pounds' is a promise factory that generates direct promises (exercise, diet, sleep habits). 'Each Party shall prepare nationally determined contributions' is a promise factory that generates sovereign commitments. The concept operates identically across scales: the Paris Agreement is a promise factory that produces national climate commitments. A quarterly OKR is a promise factory that produces key results. A personal goal is a promise factory that produces daily habits. The same PromiseFactory type, the same computed status logic, the same cascade propagation — through the NCTP composable primitive. Factory cascades propagate upward: when child promises fail, the factory degrades. This is the inverse of the standard downward cascade (upstream failure → downstream degradation). The dependency graph encodes both directions: the factory's depends_on includes its children, so child failure cascades to the factory. But children do not depend on the factory — a goal failing doesn't make the habits fail; the habits failing makes the goal fail.",
    architecturalImplication:
      "Promise factories are promises, not a separate entity. The PromiseFactory interface extends Promise. This means every analysis module (epidemiology, reliability, information, strategy, probabilistic) works on factories without modification — the factory is just a node in the graph with depends_on edges pointing to its children.",
  },
  {
    term: "Upward Cascade",
    tag: "PE",
    firstIdentified: "Promise Factory analysis (March 2026)",
    definition:
      "The propagation of child promise failure to a parent promise factory. In standard cascade propagation, upstream failure degrades downstream dependents (downward cascade). In a promise factory, child failure degrades the factory (upward cascade). Both use the same graph traversal mechanism — the direction is encoded in the depends_on edges, not in special cascade logic.",
    architecturalImplication:
      "No new cascade logic is needed. The factory's depends_on array includes its children, so the existing BFS propagation handles upward cascade automatically. The only addition is narrative generation that recognizes factory nodes and adjusts language accordingly.",
  },
  {
    term: "Completion Condition",
    tag: "PE",
    firstIdentified: "Promise Factory analysis (March 2026)",
    definition:
      "The rule by which a promise factory's status is computed from its children. Three types: 'all' (every child must be verified), 'threshold' (a fraction of children must be verified — e.g., 70%), 'weighted' (children have different importance weights; the weighted average determines status). Threshold completion is the most common at personal scale (you can miss some gym days and still lose weight). Weighted completion is most common at civic and team scale (China's NDC matters more than Luxembourg's for the global temperature target).",
  },
];
