import { NextRequest } from "next/server";
import {
  buildExtractionSystemPrompt,
  chunkBillText,
  deduplicateCandidates,
} from "@/lib/annotation/prompt";
import { PromiseCandidate, BillMeta } from "@/lib/types/annotation";

interface ExtractRequest {
  billText: string;
  billMeta: BillMeta;
}

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

function parseCandidates(rawText: string): PromiseCandidate[] {
  const clean = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  try {
    const { billText, billMeta } = (await req.json()) as ExtractRequest;

    if (!billText || !billMeta) {
      return Response.json(
        { error: "billText and billMeta required" },
        { status: 400 }
      );
    }

    const systemPrompt = buildExtractionSystemPrompt();
    const chunks = chunkBillText(billText);
    const allCandidates: PromiseCandidate[] = [];

    // Process chunks sequentially to avoid rate limits
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const userMessage = `Extract all promises from this legislation. Return ONLY a JSON array with no preamble, markdown, or explanation.\n\n${chunks[chunkIndex]}`;

      const rawText = await callClaude(systemPrompt, userMessage);

      let chunkCandidates: PromiseCandidate[];
      try {
        chunkCandidates = parseCandidates(rawText);
      } catch {
        return Response.json(
          { error: "parse_failed", rawText, chunkIndex },
          { status: 422 }
        );
      }

      // Assign chunk-aware IDs
      chunkCandidates = chunkCandidates.map((c, localIndex) => ({
        ...c,
        id: `CANDIDATE-${chunkIndex}-${String(localIndex).padStart(3, "0")}`,
        status: "declared" as const,
      }));

      allCandidates.push(...chunkCandidates);
    }

    // Deduplicate across chunks
    const deduplicated = deduplicateCandidates(allCandidates);

    // Attempt dependency linking pass
    if (deduplicated.length > 1) {
      try {
        const depPrompt = `Review these promise candidates. For each, populate depends_on with the IDs of other candidates that this promise structurally requires to succeed first. Return ONLY a JSON object mapping candidate IDs to their depends_on arrays. Example: { "CANDIDATE-0-001": ["CANDIDATE-0-000"], "CANDIDATE-0-002": [] }`;

        const candidateSummary = deduplicated.map((c) => ({
          id: c.id,
          body: c.body,
          promiser: c.promiser,
          domain: c.domain,
        }));

        const depRaw = await callClaude(
          "You are a dependency analysis engine. Given a list of promise candidates, determine which promises depend on other promises. Return only valid JSON.",
          `${depPrompt}\n\n${JSON.stringify(candidateSummary, null, 2)}`
        );

        const depClean = depRaw.replace(/```json|```/g, "").trim();
        const depMap: Record<string, string[]> = JSON.parse(depClean);

        for (const candidate of deduplicated) {
          if (depMap[candidate.id] && Array.isArray(depMap[candidate.id])) {
            candidate.depends_on = depMap[candidate.id];
          }
        }
      } catch {
        // Dependency linking failed — proceed with empty depends_on
      }
    }

    return Response.json({ candidates: deduplicated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
