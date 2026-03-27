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
  | { type: "SYNC_SHARED_PLANTS"; plants: SharedPlant[] };

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
