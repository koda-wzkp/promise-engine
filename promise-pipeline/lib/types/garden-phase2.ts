/**
 * Phase 2 type extensions for Promise Garden.
 *
 * NCTP network types: sub-promises, dependencies, accountability partners,
 * sensor integration, and garden state management.
 *
 * These EXTEND Phase 1 types — nothing from Phase 1 is modified.
 */

import { PersonalPromise, PersonalDomain } from "./personal";
import { PromiseStatus } from "./promise";

// ─── Sub-Promise & Nesting ─────────────────────────────────────────────────

/** Phase 2 extension of PersonalPromise with nesting + partner + sensor fields */
export interface GardenPromise extends PersonalPromise {
  /** Sub-promise IDs */
  children: string[];
  /** Parent promise ID (null for top-level promises) */
  parent: string | null;
  /** Accountability partner ID (if set) */
  partnerId?: string;
  /** What the partner can see */
  partnerVisibility?: PartnerVisibility;
  /** Sensor configuration (if connected) */
  sensor?: SensorConfig;
  /** Check-in schedule (cron-like string or human-readable) */
  checkInSchedule?: string;
}

// ─── Partner Visibility ────────────────────────────────────────────────────

export interface PartnerVisibility {
  /** Partner sees the promise text */
  showBody: boolean;
  /** Partner sees children/roots */
  showSubPromises: boolean;
}

// ─── Sensor Integration ────────────────────────────────────────────────────

export type SensorType = "apple-health" | "google-fit" | "screen-time" | "calendar";

export interface SensorThreshold {
  operator: "<=" | ">=" | "==" | "<" | ">";
  value: number;
  unit: string;
  period?: "day" | "week" | "month";
}

export interface SensorConfig {
  type: SensorType;
  metric: string;
  threshold: SensorThreshold;
  /** Last reading timestamp */
  lastSync?: string;
  /** Whether the sensor is currently connected */
  connected: boolean;
}

// ─── Accountability Partner ────────────────────────────────────────────────

export type PartnerInviteStatus = "pending" | "accepted" | "declined";

export interface PartnerInvite {
  id: string;
  promiseId: string;
  fromUserId: string;
  toEmail: string;
  status: PartnerInviteStatus;
  createdAt: string;
}

export interface SharedPlant {
  promiseId: string;
  domain: PersonalDomain;
  status: PromiseStatus;
  /** Partner sees body only if partnerVisibility.showBody === true */
  body?: string;
  /** Partner sees sub-promises only if partnerVisibility.showSubPromises === true */
  childStatuses?: PromiseStatus[];
  /** Timestamp of last watering */
  lastWatered?: string;
}

// ─── Zoom Levels ───────────────────────────────────────────────────────────

export type ZoomLevel =
  | "landscape"    // All domains visible, labels only
  | "domain"       // Single domain garden
  | "plant"        // Individual plant details
  | "roots";       // Sub-promise root system

export interface CameraState {
  zoomLevel: ZoomLevel;
  /** Continuous zoom factor (0 = most zoomed out, 1 = most zoomed in) */
  zoom: number;
  /** Camera center position */
  centerX: number;
  centerY: number;
  /** Target domain when zoomed to domain level */
  focusDomain?: PersonalDomain;
  /** Target promise ID when zoomed to plant/roots level */
  focusPromiseId?: string;
}

// ─── Notification Types ────────────────────────────────────────────────────

export type NotificationType =
  | "plant-wilting"         // Partner: shared plant is degrading
  | "partner-watered"       // Promiser: partner confirmed check-in
  | "partner-encouragement" // Promiser: partner sent encouragement
  | "check-in-due";         // Promiser: time for self-check-in

export interface GardenNotification {
  id: string;
  type: NotificationType;
  promiseId: string;
  message: string;
  timestamp: string;
  read: boolean;
  /** 'push' or 'in-app' */
  channel: "push" | "in-app";
}

// ─── Garden State & Actions ────────────────────────────────────────────────

export interface GardenState {
  promises: GardenPromise[];
  camera: CameraState;
  notifications: GardenNotification[];
  /** Partner invites received */
  partnerInvites: PartnerInvite[];
  /** Shared plants from others (accountability) */
  sharedPlants: SharedPlant[];
}

/** Phase 2 garden actions (Phase 1 actions are handled separately in page.tsx) */
export type GardenAction =
  | { type: "CREATE_SUB_PROMISE"; parentId: string; promise: GardenPromise }
  | { type: "ADD_DEPENDENCY"; fromId: string; toId: string }
  | { type: "REMOVE_DEPENDENCY"; fromId: string; toId: string }
  | { type: "SET_PARTNER"; promiseId: string; partnerId: string; visibility: PartnerVisibility }
  | { type: "REMOVE_PARTNER"; promiseId: string }
  | { type: "PARTNER_WATER"; promiseId: string }
  | { type: "CONNECT_SENSOR"; promiseId: string; sensorType: SensorType; threshold: SensorThreshold; metric: string }
  | { type: "DISCONNECT_SENSOR"; promiseId: string }
  | { type: "SENSOR_UPDATE"; promiseId: string; newStatus: PromiseStatus }
  | { type: "SET_ZOOM"; camera: Partial<CameraState> }
  | { type: "ADD_NOTIFICATION"; notification: GardenNotification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "UPDATE_PROMISE_STATUS"; promiseId: string; status: PromiseStatus; reflection?: string };

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Convert a Phase 1 PersonalPromise to a Phase 2 GardenPromise (backward compat) */
export function toGardenPromise(p: PersonalPromise): GardenPromise {
  return {
    ...p,
    children: (p as any).children ?? [],
    parent: (p as any).parent ?? null,
  };
}

/**
 * Compute parent status from children statuses.
 * - All children verified → parent verified
 * - Any child degraded → parent degraded
 * - Any child violated → parent degraded (partial failure)
 * - All children violated → parent violated
 */
export function computeParentStatus(childStatuses: PromiseStatus[]): PromiseStatus {
  if (childStatuses.length === 0) return "declared";

  const allVerified = childStatuses.every((s) => s === "verified");
  if (allVerified) return "verified";

  const allViolated = childStatuses.every((s) => s === "violated");
  if (allViolated) return "violated";

  const anyViolated = childStatuses.some((s) => s === "violated");
  const anyDegraded = childStatuses.some((s) => s === "degraded");
  if (anyViolated || anyDegraded) return "degraded";

  return "declared";
}
