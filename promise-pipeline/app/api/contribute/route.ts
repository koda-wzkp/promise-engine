/**
 * POST /api/contribute
 *
 * Receives anonymous contribution data from opted-in garden users.
 * No auth required. No user identity accepted or stored.
 *
 * Validates shape, strips any extraneous fields, stores to Supabase.
 * Returns { ok: true } on success.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  isAggregateContribution,
  isSchemaContribution,
} from "@/lib/types/contribution";
import type {
  AggregateContribution,
  SchemaContribution,
  TransitionRecord,
} from "@/lib/types/contribution";

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function validateAggregateContribution(data: unknown): AggregateContribution | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;

  if (
    typeof d.batch_id !== "string" ||
    typeof d.period_month !== "string" ||
    typeof d.promise_count !== "number" ||
    !Array.isArray(d.k_distribution) ||
    typeof d.fulfillment_rate !== "number" ||
    typeof d.mean_dwell_days !== "number" ||
    typeof d.verification_mix !== "object" ||
    typeof d.domain_mix !== "object"
  ) {
    return null;
  }

  // Sanity bounds
  if (d.fulfillment_rate < 0 || d.fulfillment_rate > 1) return null;
  if (d.promise_count < 0 || d.promise_count > 10_000) return null;
  if (!/^\d{4}-\d{2}$/.test(d.period_month as string)) return null;

  return {
    batch_id: d.batch_id as string,
    period_month: d.period_month as string,
    promise_count: d.promise_count as number,
    k_distribution: (d.k_distribution as unknown[]).filter(
      (v) => typeof v === "number"
    ) as number[],
    fulfillment_rate: d.fulfillment_rate as number,
    mean_dwell_days: d.mean_dwell_days as number,
    verification_mix: d.verification_mix as Record<string, number>,
    domain_mix: d.domain_mix as Record<string, number>,
  };
}

function validateTransitionRecord(r: unknown): TransitionRecord | null {
  if (typeof r !== "object" || r === null) return null;
  const rec = r as Record<string, unknown>;
  if (
    typeof rec.domain !== "string" ||
    typeof rec.verification_method !== "string" ||
    typeof rec.dwell_time_days !== "number" ||
    typeof rec.status_transition !== "string" ||
    typeof rec.k_regime !== "string"
  ) {
    return null;
  }
  return {
    domain: rec.domain as string,
    verification_method: rec.verification_method as string,
    dwell_time_days: rec.dwell_time_days as number,
    status_transition: rec.status_transition as string,
    k_regime: rec.k_regime as string,
  };
}

function validateSchemaContribution(data: unknown): SchemaContribution | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;

  if (typeof d.batch_id !== "string" || !Array.isArray(d.transitions)) {
    return null;
  }

  // Privacy minimum: reject batches smaller than 50
  if (d.transitions.length < 50) return null;

  const transitions = (d.transitions as unknown[])
    .map(validateTransitionRecord)
    .filter((r): r is TransitionRecord => r !== null);

  if (transitions.length < 50) return null;

  return {
    batch_id: d.batch_id as string,
    transitions,
  };
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid_shape" }, { status: 400 });
  }

  // Determine contribution type and validate
  if (isAggregateContribution(body as never)) {
    const clean = validateAggregateContribution(body);
    if (!clean) {
      return NextResponse.json({ error: "invalid_aggregate" }, { status: 400 });
    }

    const { error } = await supabase
      .from("contributions_aggregate")
      .insert(clean);

    if (error) {
      // Log server-side but never expose internal errors to client
      console.error("[contribute] aggregate insert error:", error.message);
      return NextResponse.json({ error: "storage_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (isSchemaContribution(body as never)) {
    const clean = validateSchemaContribution(body);
    if (!clean) {
      return NextResponse.json({ error: "invalid_schema" }, { status: 400 });
    }

    const { error } = await supabase
      .from("contributions_schema")
      .insert({
        batch_id: clean.batch_id,
        transitions: clean.transitions,
        received_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[contribute] schema insert error:", error.message);
      return NextResponse.json({ error: "storage_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_type" }, { status: 400 });
}
