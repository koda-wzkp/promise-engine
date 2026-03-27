/**
 * Phase 3 — Artifact Gifting types.
 *
 * A gift is a COPY of a kept-promise artifact sent to an accountability
 * partner or promisee. The original stays in the giver's Collection.
 *
 * Anti-market rules (enforced at the data layer):
 * - No re-gifting mechanism (recipients cannot gift what they receive)
 * - No monetary value
 * - No artificial scarcity
 * - Giftable only to the promise's accountability partner or explicit promisee
 */

import type { Artifact } from "./personal";

// ─── GIFT OPTIONS ─────────────────────────────────────────────────────────────

export interface GiftOptions {
  /** Whether to include the promise body text in the gift */
  includeBody: boolean;
}

// ─── GIFT RECORD (Supabase) ───────────────────────────────────────────────────

export interface GiftRecord {
  id: string;
  /** ID of the source artifact */
  artifact_id: string;
  /** Supabase user ID of the giver */
  from_user: string;
  /** Supabase user ID of the recipient */
  to_user: string;
  /** Domain label only — not the full artifact data */
  promise_domain: string;
  /** Whether the promise body text is included */
  include_body: boolean;
  /** The promise body, only present when include_body === true */
  promise_body: string | null;
  /** ISO timestamp */
  gifted_at: string;
}

// ─── RECEIVED GIFT (local state) ─────────────────────────────────────────────

/**
 * A gift received from another user, stored locally on the recipient's device.
 * The artifact visual data is a copy — the original remains with the giver.
 */
export interface ReceivedGift {
  id: string;
  /** Display name of the giver */
  fromName: string;
  /** The copied artifact — visual + domain, no personal metadata */
  artifact: Pick<Artifact, "id" | "visual" | "generatedFrom">;
  /** Promise body, only present when the giver opted to include it */
  promiseBody: string | null;
  /** ISO timestamp */
  receivedAt: string;
}
