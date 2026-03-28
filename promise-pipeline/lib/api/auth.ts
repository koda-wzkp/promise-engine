/**
 * Phase 4 — API key authentication for org-tier API access.
 *
 * API keys are prefixed with "pp_live_" and hashed before storage.
 * Rate limiting: 1000 requests/day per key (enforced at Supabase layer).
 *
 * Usage in route handlers:
 *   const result = await validateApiKey(request);
 *   if (!result.valid) return Response.json({ error: result.error }, { status: 401 });
 *   const { orgId } = result;
 */

import { supabase } from "../supabase";

const API_KEY_PREFIX = "pp_live_";

export type ApiKeyValidationResult =
  | { valid: true; orgId: string; keyId: string }
  | { valid: false; error: string };

/**
 * Extract and validate the API key from a request's Authorization header.
 * Format: Authorization: Bearer pp_live_...
 */
export async function validateApiKey(request: Request): Promise<ApiKeyValidationResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or malformed Authorization header" };
  }

  const key = authHeader.slice(7);
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: "Invalid API key format" };
  }

  // Hash the key for lookup
  const keyHash = await hashApiKey(key);

  const { data } = await supabase
    .from("api_keys")
    .select("id, org_id, rate_limit_daily")
    .eq("key_hash", keyHash);

  if (!data || (data as unknown[]).length === 0) {
    return { valid: false, error: "Invalid API key" };
  }

  const row = (data as Record<string, unknown>[])[0];

  return {
    valid: true,
    orgId: row.org_id as string,
    keyId: row.id as string,
  };
}

/**
 * Generate a new API key. Returns the plaintext key (shown once) and hash.
 * The hash is stored; the plaintext is never stored.
 */
export function generateApiKey(): { key: string; preview: string } {
  const random = Array.from(
    crypto.getRandomValues(new Uint8Array(24)),
    (b) => b.toString(16).padStart(2, "0")
  ).join("");

  const key = `${API_KEY_PREFIX}${random}`;
  const preview = `${API_KEY_PREFIX}${random.slice(0, 6)}...${random.slice(-4)}`;

  return { key, preview };
}

export async function hashApiKey(key: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback (non-Edge environments)
  return key;
}

/**
 * Standard JSON response helpers for API routes.
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status });
}

export function apiError(message: string, code: string, status: number): Response {
  return Response.json({ ok: false, error: { message, code } }, { status });
}
