import { supabase } from "./client";
import type { PersonalPromise, PersonalDomain, CheckInFrequency } from "../types/personal";
import type { CheckIn, CheckInResponse } from "../types/check-in";
import type { GardenState, PlantState } from "../types/garden";
import type { Summary } from "../types/garden";

// ─── PROMISES ───

export async function getPromises(userId: string): Promise<PersonalPromise[]> {
  const { data, error } = await supabase
    .from("promises")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as PromiseRow[]).map(rowToPromise);
}

export async function getActivePromises(userId: string): Promise<PersonalPromise[]> {
  const { data, error } = await supabase
    .from("promises")
    .select("*")
    .eq("user_id", userId)
    .is("completed_at", null)
    .is("abandoned_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as PromiseRow[]).map(rowToPromise);
}

export async function getDeadPromises(
  userId: string,
  domain?: PersonalDomain
): Promise<PersonalPromise[]> {
  let query = supabase
    .from("promises")
    .select("*")
    .eq("user_id", userId)
    .not("abandoned_at", "is", null)
    .is("reclaimed_by", null);

  if (domain) {
    query = query.eq("domain", domain);
  }

  const { data, error } = await query.order("abandoned_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PromiseRow[]).map(rowToPromise);
}

export async function createPromise(
  userId: string,
  promise: {
    body: string;
    domain: PersonalDomain;
    durationTier: string;
    stakesTier: string;
    checkInFrequency: CheckInFrequency;
    promisee?: string;
    targetDate?: string;
    dependsOn?: string[];
    notes?: string;
    reclaims?: string;
  }
): Promise<PersonalPromise> {
  const { data, error } = await supabase
    .from("promises")
    .insert({
      user_id: userId,
      body: promise.body,
      domain: promise.domain,
      status: "declared",
      duration_tier: promise.durationTier,
      stakes_tier: promise.stakesTier,
      check_in_frequency: promise.checkInFrequency,
      promisee: promise.promisee ?? "Self",
      target_date: promise.targetDate ?? null,
      depends_on: promise.dependsOn ?? [],
      notes: promise.notes ?? null,
      reclaims: promise.reclaims ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const row = data as PromiseRow;

  // If reclaiming a stump, update the old promise
  if (promise.reclaims) {
    await supabase
      .from("promises")
      .update({ reclaimed_by: row.id })
      .eq("id", promise.reclaims);
  }

  return rowToPromise(row);
}

export async function updatePromise(
  id: string,
  updates: {
    body?: string;
    status?: string;
    reflection?: string;
    renegotiatedFrom?: string;
    renegotiatedAt?: string;
    completedAt?: string;
    abandonedAt?: string;
  }
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.body !== undefined) row.body = updates.body;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.reflection !== undefined) row.reflection = updates.reflection;
  if (updates.renegotiatedFrom !== undefined) row.renegotiated_from = updates.renegotiatedFrom;
  if (updates.renegotiatedAt !== undefined) row.renegotiated_at = updates.renegotiatedAt;
  if (updates.completedAt !== undefined) row.completed_at = updates.completedAt;
  if (updates.abandonedAt !== undefined) row.abandoned_at = updates.abandonedAt;

  const { error } = await supabase.from("promises").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── CHECK-INS ───

export async function getCheckIns(
  userId: string,
  promiseId?: string,
  startDate?: string,
  endDate?: string
): Promise<CheckIn[]> {
  let query = supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId);

  if (promiseId) query = query.eq("promise_id", promiseId);
  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  const { data, error } = await query.order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as CheckInRow[]).map(rowToCheckIn);
}

export async function upsertCheckIn(
  userId: string,
  promiseId: string,
  date: string,
  response: CheckInResponse,
  reflection?: string
): Promise<CheckIn> {
  const { data, error } = await supabase
    .from("check_ins")
    .upsert(
      {
        promise_id: promiseId,
        user_id: userId,
        date,
        response,
        reflection: reflection ?? null,
      },
      { onConflict: "promise_id,date" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToCheckIn(data as CheckInRow);
}

// ─── GARDEN STATE ───

interface GardenStateRow {
  user_id: string;
  plants: PlantState[];
  wildlife: string[];
  landscape: GardenState["landscape"];
  last_computed_at: string;
}

export async function getGardenState(userId: string): Promise<GardenState | null> {
  const { data, error } = await supabase
    .from("garden_state")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!data) return null;

  const row = data as GardenStateRow;
  return {
    userId: row.user_id,
    plants: row.plants,
    wildlife: row.wildlife,
    landscape: row.landscape,
    lastComputedAt: row.last_computed_at,
  };
}

export async function saveGardenState(state: GardenState): Promise<void> {
  const { error } = await supabase.from("garden_state").upsert({
    user_id: state.userId,
    plants: state.plants,
    wildlife: state.wildlife,
    landscape: state.landscape,
    last_computed_at: state.lastComputedAt,
  });

  if (error) throw new Error(error.message);
}

// ─── SUMMARIES ───

export async function getSummaries(
  userId: string,
  type?: "weekly" | "monthly"
): Promise<Summary[]> {
  let query = supabase
    .from("summaries")
    .select("*")
    .eq("user_id", userId);

  if (type) query = query.eq("type", type);

  const { data, error } = await query.order("period_end", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as SummaryRow[]).map(rowToSummary);
}

export async function createSummary(
  userId: string,
  summary: Omit<Summary, "id" | "userId" | "createdAt">
): Promise<Summary> {
  const { data, error } = await supabase
    .from("summaries")
    .insert({
      user_id: userId,
      type: summary.type,
      period_start: summary.periodStart,
      period_end: summary.periodEnd,
      reliability_by_domain: summary.reliabilityByDomain,
      overall_reliability: summary.overallReliability,
      wildlife_changes: summary.wildlifeChanges ?? null,
      landscape_changes: summary.landscapeChanges ?? null,
      dependency_insights: summary.dependencyInsights ?? null,
      narrative: summary.narrative ?? null,
      user_reflection: summary.userReflection ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToSummary(data as SummaryRow);
}

// ─── ROW MAPPERS ───

// Supabase returns untyped rows; type assertion at the data boundary.
interface PromiseRow {
  id: string; user_id: string; promisee: string; body: string;
  domain: string; status: string; notes: string | null;
  depends_on: string[] | null; duration_tier: string; stakes_tier: string;
  check_in_frequency: { type: string; days?: number[]; day?: number };
  reflection: string | null; renegotiated_from: string | null;
  renegotiated_at: string | null; completed_at: string | null;
  abandoned_at: string | null; reclaimed_by: string | null;
  reclaims: string | null; target_date: string | null;
  created_at: string; updated_at: string;
}

interface CheckInRow {
  id: string; promise_id: string; user_id: string;
  date: string; response: string; reflection: string | null;
  created_at: string;
}

interface SummaryRow {
  id: string; user_id: string; type: string;
  period_start: string; period_end: string;
  reliability_by_domain: Record<string, number>;
  overall_reliability: number | null;
  wildlife_changes: { gained: string[]; lost: string[] } | null;
  landscape_changes: string[] | null;
  dependency_insights: string[] | null;
  narrative: string | null;
  user_reflection: string | null;
  created_at: string;
}

function rowToPromise(row: PromiseRow): PersonalPromise {
  return {
    id: row.id,
    isPersonal: true,
    promiser: row.user_id,
    promisee: row.promisee,
    body: row.body,
    domain: row.domain as PersonalDomain,
    status: row.status as PersonalPromise["status"],
    note: row.notes ?? "",
    verification: { method: "self-report" },
    depends_on: row.depends_on ?? [],
    durationTier: row.duration_tier as PersonalPromise["durationTier"],
    stakesTier: row.stakes_tier as PersonalPromise["stakesTier"],
    checkInFrequency: row.check_in_frequency as PersonalPromise["checkInFrequency"],
    reflection: row.reflection ?? undefined,
    renegotiatedFrom: row.renegotiated_from ?? undefined,
    renegotiatedAt: row.renegotiated_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    abandonedAt: row.abandoned_at ?? undefined,
    reclaimedBy: row.reclaimed_by ?? undefined,
    reclaims: row.reclaims ?? undefined,
    notes: row.notes ?? undefined,
    targetDate: row.target_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCheckIn(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    promiseId: row.promise_id,
    userId: row.user_id,
    date: row.date,
    response: row.response as CheckInResponse,
    reflection: row.reflection ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToSummary(row: SummaryRow): Summary {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as Summary["type"],
    periodStart: row.period_start,
    periodEnd: row.period_end,
    reliabilityByDomain: row.reliability_by_domain,
    overallReliability: row.overall_reliability ? Number(row.overall_reliability) : 0,
    wildlifeChanges: row.wildlife_changes ?? undefined,
    landscapeChanges: row.landscape_changes ?? undefined,
    dependencyInsights: row.dependency_insights ?? undefined,
    narrative: row.narrative ?? undefined,
    userReflection: row.user_reflection ?? undefined,
    createdAt: row.created_at,
  };
}
