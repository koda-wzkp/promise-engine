/**
 * Phase 2 Garden Types — NCTP + Accountability
 *
 * Extends the Phase 1 personal promise types with:
 * - Sub-promises (nesting / parent-child)
 * - Dependency edges (activated from base Promise.depends_on)
 * - Accountability partners
 * - Sensor integration
 * - Garden-level actions for the reducer
 */

import { PromiseStatus, VerificationMethod } from "./promise";
import { PersonalPromise, PersonalDomain } from "./personal";

// ─── GARDEN PROMISE (Phase 2 extension of PersonalPromise) ───────────────────

export interface GardenPromise extends PersonalPromise {
  /** Sub-promise IDs — activated in Phase 2 */
  children: string[];
  /** Parent promise ID — null for top-level promises */
  parent: string | null;

  /** Accountability partner config (optional) */
  partner?: PartnerConfig;

  /** Sensor integration config (optional) */
  sensor?: SensorConfig;

  /** Check-in schedule (e.g., "daily", "weekly", "3x/week") */
  checkInSchedule?: string;
}

// ─── PARTNER ─────────────────────────────────────────────────────────────────

export interface PartnerVisibility {
  /** Partner sees the promise text */
  showBody: boolean;
  /** Partner sees children/roots */
  showSubPromises: boolean;
}

export interface PartnerConfig {
  partnerId: string;
  partnerEmail?: string;
  partnerName?: string;
  visibility: PartnerVisibility;
  /** When the partner was added */
  connectedAt: string;
  /** Whether the partner has accepted the invite */
  accepted: boolean;
}

// ─── SENSOR ──────────────────────────────────────────────────────────────────

export type SensorType = "apple-health" | "google-fit" | "screen-time" | "calendar";

export interface SensorThreshold {
  metric: string;
  operator: ">=" | "<=" | "==" | ">" | "<";
  value: number;
  unit: string;
  period: "daily" | "weekly" | "monthly";
}

export interface SensorConfig {
  type: SensorType;
  threshold: SensorThreshold;
  /** When sensor was connected */
  connectedAt: string;
  /** Last sensor reading timestamp */
  lastReadAt?: string;
}

// ─── NOTIFICATION ────────────────────────────────────────────────────────────

export type NotificationChannel = "push" | "in-app";

export interface GardenNotification {
  id: string;
  type: GardenNotificationType;
  channel: NotificationChannel;
  recipientId: string;
  promiseId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type GardenNotificationType =
  | "shared-plant-wilting"
  | "partner-watered"
  | "partner-encouragement"
  | "check-in-due"
  | "dependency-stress"
  | "sensor-update";

// ─── ZOOM ────────────────────────────────────────────────────────────────────

export type ZoomLevel =
  | "landscape"   // All domains visible
  | "domain"      // Single domain garden
  | "plant"       // Individual plant focus
  | "roots";      // Sub-promise root system

export interface CameraState {
  zoom: number;       // 0.25 (landscape) → 4.0 (roots)
  panX: number;
  panY: number;
  focusDomain?: PersonalDomain;
  focusPromiseId?: string;
}

// ─── GARDEN STATE ────────────────────────────────────────────────────────────

export interface GardenState {
  promises: GardenPromise[];
  camera: CameraState;
  notifications: GardenNotification[];
  /** Current user ID (set when auth is active for partner features) */
  userId?: string;
  /** Partner connections where this user is the partner (not the promiser) */
  sharedWithMe: SharedPlant[];

  // Phase 3 extensions (imported from phase3.ts, stored inline for persistence)
  /** Team the user belongs to (if any) */
  team?: import("./phase3").Team;
  /** Contribution settings */
  contribution?: import("./phase3").ContributionState;
  /** Personal artifact collection */
  artifacts?: import("./phase3").Artifact[];
  /** Received gifts */
  receivedGifts?: import("./phase3").ReceivedGift[];
  /** Predictions (only for contributors) */
  predictions?: import("./phase3").Prediction[];
  /** Benchmarks (only for contributors) */
  benchmarks?: import("./phase3").Benchmark[];

  // Phase 4 extensions
  /** Org the user belongs to (if any) */
  org?: import("./phase4").Org;
  /** API keys for the org */
  apiKeys?: import("./phase4").ApiKey[];
  /** Webhook configurations */
  webhooks?: import("./phase4").WebhookConfig[];
  /** Cached org dashboard data */
  orgDashboard?: import("./phase4").OrgDashboardData;
}

export interface SharedPlant {
  promiseId: string;
  promiserId: string;
  promiserName?: string;
  domain: PersonalDomain;
  status: PromiseStatus;
  visibility: PartnerVisibility;
  lastWateredAt?: string;
}

// ─── GARDEN ACTIONS ──────────────────────────────────────────────────────────

export type GardenAction =
  // Phase 1 actions (preserved)
  | { type: "CREATE_PROMISE"; promise: GardenPromise }
  | { type: "UPDATE_STATUS"; id: string; status: PromiseStatus; reflection?: string }
  | { type: "DELETE_PROMISE"; id: string }

  // Phase 2: Sub-promises
  | { type: "CREATE_SUB_PROMISE"; parentId: string; promise: GardenPromise }
  | { type: "REMOVE_SUB_PROMISE"; parentId: string; childId: string }

  // Phase 2: Dependencies
  | { type: "ADD_DEPENDENCY"; fromId: string; toId: string }
  | { type: "REMOVE_DEPENDENCY"; fromId: string; toId: string }

  // Phase 2: Accountability Partner
  | { type: "SET_PARTNER"; promiseId: string; partnerId: string; visibility: PartnerVisibility }
  | { type: "REMOVE_PARTNER"; promiseId: string }
  | { type: "PARTNER_WATER"; promiseId: string }
  | { type: "PARTNER_ENCOURAGE"; promiseId: string; message: string }

  // Phase 2: Sensor
  | { type: "CONNECT_SENSOR"; promiseId: string; sensorType: SensorType; threshold: SensorThreshold }
  | { type: "DISCONNECT_SENSOR"; promiseId: string }
  | { type: "SENSOR_UPDATE"; promiseId: string; newStatus: PromiseStatus }

  // Phase 2: Camera / Zoom
  | { type: "SET_CAMERA"; camera: Partial<CameraState> }
  | { type: "ZOOM_TO_PROMISE"; promiseId: string }
  | { type: "ZOOM_TO_DOMAIN"; domain: PersonalDomain }
  | { type: "ZOOM_TO_LANDSCAPE" }

  // Phase 2: Notifications
  | { type: "ADD_NOTIFICATION"; notification: GardenNotification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }

  // Phase 2: Auth (for partner features only)
  | { type: "SET_USER_ID"; userId: string }

  // Phase 2: Shared plants (partner's perspective)
  | { type: "SYNC_SHARED_PLANTS"; plants: SharedPlant[] }

  // Phase 3: Team
  | { type: "TEAM_PROMISE_RECEIVED"; teamPromise: import("./phase3").TeamGardenPromise; teamId: string }
  | { type: "CREATE_TEAM_SUB_PROMISE"; teamPromiseId: string; subPromise: GardenPromise }
  | { type: "TEAM_STATUS_UPDATE"; promiseId: string; newStatus: PromiseStatus }
  | { type: "SET_TEAM"; team: import("./phase3").Team }
  | { type: "LEAVE_TEAM" }

  // Phase 3: Contribution
  | { type: "ENABLE_CONTRIBUTION"; level: import("./phase3").ContributionLevel }
  | { type: "DISABLE_CONTRIBUTION" }
  | { type: "CONTRIBUTION_SENT"; batchId: string }
  | { type: "UPGRADE_CONTRIBUTION_LEVEL"; level: import("./phase3").ContributionLevel }
  | { type: "SYNC_PREDICTIONS"; predictions: import("./phase3").Prediction[] }
  | { type: "SYNC_BENCHMARKS"; benchmarks: import("./phase3").Benchmark[] }

  // Phase 3: Gifting
  | { type: "MINT_ARTIFACT"; promiseId: string }
  | { type: "GIFT_ARTIFACT"; artifactId: string; toUserId: string; options: import("./phase3").GiftOptions }
  | { type: "RECEIVE_GIFT"; gift: import("./phase3").ReceivedGift }

  // Phase 4: Org
  | { type: "CREATE_ORG"; org: import("./phase4").Org }
  | { type: "JOIN_ORG"; orgId: string }
  | { type: "LEAVE_ORG" }
  | { type: "SET_ORG"; org: import("./phase4").Org }
  | { type: "CREATE_ORG_PROMISE"; promise: import("./phase4").OrgPromise }
  | { type: "UPDATE_ORG_PROMISE_STATUS"; promiseId: string; newStatus: PromiseStatus }

  // Phase 4: External dependencies
  | { type: "ADD_EXTERNAL_DEPENDENCY"; promiseId: string; dep: import("./phase4").ExternalDependency }
  | { type: "REMOVE_EXTERNAL_DEPENDENCY"; promiseId: string; depLabel: string }
  | { type: "CIVIC_STATUS_UPDATE"; civicPromiseId: string; civicDashboard: string; newStatus: PromiseStatus }

  // Phase 4: Cross-team
  | { type: "CROSS_TEAM_DEPENDENCY"; fromPromiseId: string; toPromiseId: string }
  | { type: "ORG_CASCADE"; result: import("./simulation").CascadeResult }

  // Phase 4: API management
  | { type: "ADD_API_KEY"; key: import("./phase4").ApiKey }
  | { type: "REVOKE_API_KEY"; keyId: string }
  | { type: "ADD_WEBHOOK"; webhook: import("./phase4").WebhookConfig }
  | { type: "REMOVE_WEBHOOK"; webhookId: string }
  | { type: "UPDATE_WEBHOOK"; webhookId: string; updates: Partial<import("./phase4").WebhookConfig> }

  // Phase 4: Dashboard
  | { type: "SYNC_ORG_DASHBOARD"; dashboard: import("./phase4").OrgDashboardData };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Convert a Phase 1 PersonalPromise to a Phase 2 GardenPromise */
export function toGardenPromise(p: PersonalPromise): GardenPromise {
  return {
    ...p,
    children: (p as any).children ?? [],
    parent: (p as any).parent ?? null,
  };
}

/** Check if a promise has sub-promises */
export function hasChildren(p: GardenPromise): boolean {
  return p.children.length > 0;
}

/** Check if a promise is a sub-promise */
export function isSubPromise(p: GardenPromise): boolean {
  return p.parent !== null;
}

/** Get the zoom level from a numeric zoom value */
export function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom <= 0.5) return "landscape";
  if (zoom <= 1.2) return "domain";
  if (zoom <= 2.5) return "plant";
  return "roots";
}

/** Default camera state */
export const DEFAULT_CAMERA: CameraState = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
};
