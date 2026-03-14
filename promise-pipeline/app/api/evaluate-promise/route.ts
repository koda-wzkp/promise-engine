import { NextResponse } from "next/server";
import { prefilterPromise, PrefilterResult } from "@/lib/quality/prefilter";

export async function POST(request: Request) {
  const { promise_text, domain, tier } = await request.json();

  if (!promise_text || typeof promise_text !== "string") {
    return NextResponse.json(
      { error: "promise_text is required" },
      { status: 400 },
    );
  }

  const text = promise_text.trim();
  if (text.length < 3 || text.length > 1000) {
    return NextResponse.json(
      { error: "Promise text must be between 3 and 1000 characters" },
      { status: 400 },
    );
  }

  // Run pre-filter
  const prefilter = prefilterPromise(text);

  const SKIP_LLM_ON_CLEAN = process.env.SKIP_LLM_ON_CLEAN === "true";

  if (SKIP_LLM_ON_CLEAN && !prefilter.has_flags) {
    return NextResponse.json({
      evaluation: {
        autonomous: { pass: true, reason: "Within your control." },
        observable: { pass: true, reason: "This is verifiable." },
        specific: { pass: true, reason: "Clear action with bounds." },
        affirmative: { pass: true, reason: "Framed as positive action." },
        passes_all: true,
        reframes: [],
        encouragement:
          "This is a well-formed promise. You\u2019re ready to commit.",
        evaluated_by: "rules" as const,
        evaluated_at: new Date().toISOString(),
        was_overridden: false,
        reframe_selected: null,
      },
      prefilter,
    });
  }

  // Call Claude Haiku for evaluation
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        evaluation: buildRulesOnlyEvaluation(prefilter),
        prefilter,
        fallback: true,
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: buildQualitySystemPrompt(tier || "personal", domain || null),
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              tier: tier || "personal",
              domain: domain || "general",
              promise_text: text,
              prefilter_flags: prefilter.flags,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "Claude API error:",
        response.status,
        await response.text(),
      );
      return NextResponse.json({
        evaluation: buildRulesOnlyEvaluation(prefilter),
        prefilter,
        fallback: true,
      });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? "";

    let evaluation;
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      evaluation = JSON.parse(clean);
    } catch {
      console.error("Parse error. Raw response:", rawText);
      return NextResponse.json({
        evaluation: buildRulesOnlyEvaluation(prefilter),
        prefilter,
        fallback: true,
        parse_error: true,
      });
    }

    return NextResponse.json({
      evaluation: {
        ...evaluation,
        evaluated_by: prefilter.has_flags ? "both" : "llm",
        evaluated_at: new Date().toISOString(),
        was_overridden: false,
        reframe_selected: null,
      },
      prefilter,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({
      evaluation: buildRulesOnlyEvaluation(prefilter),
      prefilter,
      fallback: true,
    });
  }
}

function buildRulesOnlyEvaluation(
  prefilter: PrefilterResult,
) {
  return {
    autonomous: {
      pass: !prefilter.flags.autonomous,
      reason: prefilter.flags.autonomous
        ? "This may depend on someone else\u2019s actions."
        : "Within your control.",
    },
    observable: {
      pass: true,
      reason:
        "Unable to fully assess \u2014 consider whether you could verify this was done.",
    },
    specific: {
      pass: !prefilter.flags.specific,
      reason: prefilter.flags.specific
        ? "This could be more specific \u2014 try adding a quantity, time, or concrete action."
        : "Has clear bounds.",
    },
    affirmative: {
      pass: !prefilter.flags.affirmative,
      reason: prefilter.flags.affirmative
        ? "This is framed as what you won\u2019t do. Try reframing as what you will do instead."
        : "Framed as positive action.",
    },
    passes_all: !prefilter.has_flags,
    reframes: [],
    encouragement: prefilter.has_flags
      ? "A few things to consider \u2014 see the suggestions below."
      : "Looks good. You\u2019re ready to commit.",
    evaluated_by: "rules" as const,
    evaluated_at: new Date().toISOString(),
    was_overridden: false,
    reframe_selected: null,
  };
}

function buildQualitySystemPrompt(
  tier: string,
  domain: string | null,
): string {
  const domainContext = domain
    ? `The user has tagged this promise with the domain "${domain}". Be domain-aware in your reframes.`
    : "";

  const domainGuidance: Record<string, string> = {
    "bfrb-recovery": `This domain involves Body-Focused Repetitive Behaviors (skin picking, hair pulling, nail biting).
Reframes should use evidence-based alternatives from Habit Reversal Training (Azrin & Nunn, 1973):
awareness logging, competing responses, stimulus control/environment design, and mindfulness-based approaches.
NEVER suggest "just stop" or willpower-based framing. The urge is not under conscious control — the RESPONSE to the urge is.
Frame reframes around: noticing the urge (awareness), doing something else with hands (competing response),
changing the environment (barrier methods, fidget tools), and self-compassion practices.`,
    mindfulness: `Reframes should be concrete sits, practices, or micro-moments with specific durations.`,
    fitness: `Reframes should include specific exercises, durations, and frequencies. Don't over-prescribe — match the user's apparent fitness level.`,
    work: `Reframes should be specific deliverables or time-boxed activities, not aspirational career goals.`,
  };

  const key = domain?.toLowerCase().replace(/\s+/g, "-") ?? "";
  const specificGuidance =
    key && domainGuidance[key]
      ? `\n\nDomain-specific guidance:\n${domainGuidance[key]}`
      : "";

  return `You are a promise quality advisor for Promise Pipeline, a commitment tracker built on Promise Theory (Mark Burgess, 2004).

The user has entered a commitment. Evaluate it against four criteria:

1. AUTONOMOUS: Within the promiser's sole control. Fails if it depends on other actors, external conditions, or urge-driven behaviors they don't fully control. Note: the RESPONSE to an urge (e.g., using a competing response) IS controllable; the urge itself is not.
2. OBSERVABLE: Verifiable — someone (including the promiser) could confirm it happened. Fails if there's no way to check.
3. SPECIFIC: Bounded in time, scope, action, AND obligation ceiling. Fails if vague, open-ended, or unbounded. "I will always be there for X" fails because it has no ceiling.
4. AFFIRMATIVE: Framed as an action the promiser WILL take. Fails if it's framed as negation (what they won't do). "I won't X" → "I will [alternative action] instead."

Context tier: ${tier}
${domainContext}
${specificGuidance}

Respond in JSON only. No preamble, no markdown fences, no explanation outside the JSON:
{
  "autonomous": { "pass": bool, "reason": "1-2 sentence explanation" },
  "observable": { "pass": bool, "reason": "1-2 sentence explanation" },
  "specific": { "pass": bool, "reason": "1-2 sentence explanation" },
  "affirmative": { "pass": bool, "reason": "1-2 sentence explanation" },
  "passes_all": bool,
  "reframes": ["reframe 1", "reframe 2", "reframe 3"],
  "encouragement": "1-2 sentence warm message"
}

Rules:
- Reframes must pass ALL four criteria.
- Reframes must be concise — one sentence each, action-oriented.
- If the original promise passes all four, return passes_all: true, empty reframes array.
- Tone: warm, collaborative, never judgmental. You are a co-author helping shape a keepable promise.
- If a pre-filter flag was a false positive (e.g., "stop attending the meeting" flagged for negation but is actually affirmative), mark the criterion as passing and explain why in the reason field.
- Generate exactly 3 reframes if the promise fails any criterion. Generate 0 if it passes all.
- Keep reasons brief. The user sees these directly.`;
}
