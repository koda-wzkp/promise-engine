import { HB2021_PROMISES } from "@/lib/data/hb2021";
import { Promise as PromiseType } from "@/lib/types/promise";

/**
 * Select 5 representative few-shot examples spanning different domains,
 * verification methods, and structural patterns.
 */
function selectFewShotExamples(allPromises: PromiseType[]): PromiseType[] {
  // P001: quantified emissions target (degraded, audit verification)
  // P010: verification/regulatory (verified, filing)
  // P002: sequential dependency (declared, future target)
  // P016: affordability with rate threshold (degraded, metric-based)
  // P018: tribal/equity with no verification (unverifiable, none)
  const targetIds = ["P001", "P010", "P002", "P016", "P018"];
  return targetIds
    .map((id) => allPromises.find((p) => p.id === id))
    .filter((p): p is PromiseType => p !== undefined);
}

export function buildExtractionSystemPrompt(): string {
  const examples = selectFewShotExamples(HB2021_PROMISES);
  const examplesJson = JSON.stringify(examples, null, 2);

  return `You are a promise extraction engine for Promise Pipeline, a civic accountability platform that applies Promise Theory to legislative analysis.

Your task: read a piece of legislation and extract every discrete promise it contains. A promise is a commitment made by a specific agent to a specific beneficiary, with a verifiable body and (where specified) a deadline and verification mechanism.

## Promise Schema

Every promise you extract must conform to this TypeScript type:

\`\`\`typescript
interface PromiseCandidate {
  id: string;              // Generated as "CANDIDATE-{chunkIndex}-{localIndex}"
  ref: string;             // Statutory reference in the jurisdiction's native format
  promiser: string;        // The agent making the commitment (specific name, not generic)
  promisee: string;        // The agent receiving the commitment
  body: string;            // The specific commitment, stated precisely and concisely
  domain: string;          // Emissions | Planning | Verification | Equity | Affordability | Tribal | Workforce | Safety | Transparency | Other
  status: "declared";      // Always "declared" for newly extracted legislative promises
  target: string | null;   // Deadline in ISO format (YYYY-MM-DD) or null
  progress: number | null; // Quantitative progress (0-100) or null
  required: number | null; // Target level (0-100) or null
  note: string;            // Brief explanation of the promise and its significance
  verification: {
    method: "filing" | "audit" | "self-report" | "sensor" | "benchmark" | "none";
    source: string | null;
    metric: string | null;
    frequency: string | null;
  };
  depends_on: string[];    // Leave empty — dependency linking is handled in a second pass
  sourceText: string;      // The exact sentence(s) from the bill this promise comes from
  confidence: number;      // 0.0-1.0
  extractionNotes: string; // Uncertainty, ambiguity, or flags for the human annotator
}
\`\`\`

## Extraction Rules

1. **Be specific.** Each promise is atomic — one commitment, one promiser, one deadline where specified. If a section contains three separate commitments, extract three promises.

2. **Promiser precision.** Name the actual agent: "Portland General Electric", "Oregon PUC", "Virginia SCC" — not generic terms like "the utility" or "the state".

3. **Status is always "declared".** Legislative promises are declarations. Status gets updated by the human annotator based on compliance data.

4. **Target dates.** Convert "by 2030" to "2030-12-31". Convert "by January 1, 2025" to "2025-01-01". If a section says "within 180 days of enactment" and the enactment date is known, calculate it. Otherwise use null.

5. **Verification method.** Infer from context: regulatory filing requirements -> "filing", DEQ/EPA/third-party audit involvement -> "audit", utility self-assessment -> "self-report", no mechanism specified -> "none". Do NOT invent verification mechanisms absent from the text. The absence of verification (especially for equity promises) is an important training signal.

6. **Confidence calibration.** Use 0.9+ for clear, specific, verifiable commitments. Use 0.6-0.8 for ambiguous or aspirational language. Use below 0.5 for things that might be promises but you're uncertain — always include these, the human annotator decides.

7. **Source text.** Always include the exact sentence(s) from the bill from which you extracted the promise.

8. **Statutory references.** Use the citation format native to the jurisdiction: Oregon uses \u00A73(1)(a), Washington uses RCW 19.405.020(1), Virginia uses \u00A756-585.1, federal bills use \u00A77(b). Do not normalize to a single format.

9. **Leave depends_on empty.** Dependency edges are resolved in a separate pass after all chunks are processed. Do not attempt to reference other CANDIDATE IDs.

10. **If no promises found, return [].** Do not return an error or explanation.

## Schema Notes on Emerging Commitment Types

The existing domain taxonomy covers most legislative promises. Some bill types contain commitment structures that don't fit cleanly. When you encounter these, extract using the closest domain but flag in extractionNotes:

- **Capacity mandates** (e.g., "utility must maintain X MW of dispatchable capacity"): use domain "Planning", add extractionNotes: "commitment_type: capacity_mandate"
- **Plant closure commitments** (e.g., "coal plant must retire by YYYY"): use domain "Emissions", add extractionNotes: "commitment_type: plant_closure"
- **Funding allocations** (e.g., "agency must appropriate $X for Y"): use domain closest to the purpose, add extractionNotes: "commitment_type: funding_allocation"

Do NOT invent new domain values. The human annotator handles schema extension decisions.

## Few-Shot Examples (from Oregon HB 2021 — use these as your calibration)

${examplesJson}

## Output Format

Return ONLY a JSON array. If the text contains no promises, return []. No preamble, no explanation, no markdown fences.`;
}

/**
 * Chunk bill text with overlap to catch promises spanning boundaries.
 */
export function chunkBillText(text: string): string[] {
  const CHUNK_SIZE = 10000;
  const OVERLAP = 800;
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - OVERLAP;
  }
  return chunks;
}

/**
 * Deduplicate candidates by comparing sourceText word overlap.
 * If two candidates share >60% words, keep the higher-confidence one.
 */
export function deduplicateCandidates(
  candidates: PromiseCandidate[]
): PromiseCandidate[] {
  // Import type inline to avoid circular deps
  type PC = typeof candidates[number];

  function getWords(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
  }

  function wordOverlap(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let overlap = 0;
    a.forEach((word) => {
      if (b.has(word)) overlap++;
    });
    const minSize = Math.min(a.size, b.size);
    return minSize === 0 ? 0 : overlap / minSize;
  }

  const removed = new Set<number>();
  const wordSets = candidates.map((c) => getWords(c.sourceText));

  for (let i = 0; i < candidates.length; i++) {
    if (removed.has(i)) continue;
    for (let j = i + 1; j < candidates.length; j++) {
      if (removed.has(j)) continue;
      if (wordOverlap(wordSets[i], wordSets[j]) > 0.6) {
        // Keep higher confidence
        if (candidates[i].confidence >= candidates[j].confidence) {
          removed.add(j);
        } else {
          removed.add(i);
          break;
        }
      }
    }
  }

  return candidates.filter((_, idx) => !removed.has(idx));
}

// Re-export the type for use in this module
import { PromiseCandidate } from "@/lib/types/annotation";
