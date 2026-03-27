/**
 * POST /api/contribute
 *
 * Receives locally-computed contribution data.
 * Level C: aggregate JSON (monthly)
 * Level A: schema transition records (batched 50+)
 *
 * No PII. No promise text. No user identification beyond opaque contributor ID.
 */

import { NextRequest, NextResponse } from "next/server";

interface ContributePayload {
  level: "C" | "A";
  contributorId: string; // opaque, non-reversible
  data: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContributePayload;

    if (!body.level || !body.contributorId || !body.data) {
      return NextResponse.json(
        { error: "Missing required fields: level, contributorId, data" },
        { status: 400 }
      );
    }

    if (body.level !== "C" && body.level !== "A") {
      return NextResponse.json(
        { error: "Invalid contribution level. Must be 'C' or 'A'" },
        { status: 400 }
      );
    }

    // Level A requires at least 50 transitions
    if (body.level === "A") {
      const transitions = (body.data as any).transitions;
      if (!Array.isArray(transitions) || transitions.length < 50) {
        return NextResponse.json(
          { error: "Level A requires at least 50 transition records" },
          { status: 400 }
        );
      }

      // Validate each transition has exactly 5 fields
      for (const t of transitions) {
        const keys = Object.keys(t);
        const required = ["domain", "verification_method", "dwell_time_days", "status_transition", "k_regime"];
        const valid = required.every((k) => keys.includes(k));
        if (!valid) {
          return NextResponse.json(
            { error: "Each transition must have: domain, verification_method, dwell_time_days, status_transition, k_regime" },
            { status: 400 }
          );
        }
      }
    }

    // In production, this would store to a dedicated contributions table.
    // For now, acknowledge receipt and return predictions/benchmarks if available.
    const batchId = body.level === "C"
      ? (body.data as any).batch_id ?? `C-${Date.now()}`
      : (body.data as any).batch_id ?? `A-${Date.now()}`;

    return NextResponse.json({
      success: true,
      batchId,
      message: `Level ${body.level} contribution received`,
      // Reciprocal value: predictions and benchmarks returned to contributors
      predictions: [],
      benchmarks: [],
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
