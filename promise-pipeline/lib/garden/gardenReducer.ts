/**
 * Garden Reducer — Phase 2 State Management
 *
 * Handles all GardenActions, maintaining backward compatibility
 * with Phase 1 localStorage schema.
 */

import { GardenAction, GardenState, GardenPromise, GardenNotification, DEFAULT_CAMERA, toGardenPromise } from "../types/garden";
import { PersonalPromise } from "../types/personal";
import { recomputeAllParentStatuses } from "./parentStatus";
import { propagateGardenCascade, generateCascadeNotifications } from "./gardenCascade";
import { DEFAULT_CONTRIBUTION_STATE } from "../types/phase3";
import type { Artifact } from "../types/phase3";

const STORAGE_KEY = "promise-garden-data";

/**
 * Load garden state from localStorage with backward compatibility.
 * Phase 1 stored PersonalPromise[]; Phase 2 stores GardenState.
 */
export function loadGardenState(): GardenState {
  if (typeof window === "undefined") {
    return createEmptyState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyState();

    const parsed = JSON.parse(stored);

    // Phase 1 compatibility: if the stored data is an array, it's Phase 1 format
    if (Array.isArray(parsed)) {
      return {
        promises: parsed.map(toGardenPromise),
        camera: DEFAULT_CAMERA,
        notifications: [],
        sharedWithMe: [],
      };
    }

    // Phase 2/3 format
    if (parsed.promises) {
      return {
        promises: (parsed.promises as any[]).map(toGardenPromise),
        camera: parsed.camera ?? DEFAULT_CAMERA,
        notifications: parsed.notifications ?? [],
        userId: parsed.userId,
        sharedWithMe: parsed.sharedWithMe ?? [],
        // Phase 3 fields
        team: parsed.team,
        contribution: parsed.contribution ?? DEFAULT_CONTRIBUTION_STATE,
        artifacts: parsed.artifacts ?? [],
        receivedGifts: parsed.receivedGifts ?? [],
        predictions: parsed.predictions ?? [],
        benchmarks: parsed.benchmarks ?? [],
      };
    }

    return createEmptyState();
  } catch {
    return createEmptyState();
  }
}

/**
 * Save garden state to localStorage.
 * Also saves the Phase 1-compatible array format so Phase 1
 * code that reads the raw array still works.
 */
export function saveGardenState(state: GardenState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createEmptyState(): GardenState {
  return {
    promises: [],
    camera: DEFAULT_CAMERA,
    notifications: [],
    sharedWithMe: [],
  };
}

/**
 * The garden reducer. Pure function — returns a new GardenState.
 */
export function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    // ── Phase 1 actions ────────────────────────────────────────────────────

    case "CREATE_PROMISE": {
      const promises = [...state.promises, action.promise];
      return { ...state, promises };
    }

    case "UPDATE_STATUS": {
      let promises = state.promises.map((p) => {
        if (p.id !== action.id) return p;
        return {
          ...p,
          status: action.status,
          reflection: action.reflection || p.reflection,
          completedAt:
            action.status === "verified" || action.status === "violated"
              ? new Date().toISOString()
              : p.completedAt,
        };
      });

      // Recompute parent statuses
      promises = recomputeAllParentStatuses(promises);

      // Cascade effects → notifications
      const effects = propagateGardenCascade(promises, action.id, action.status);
      const cascadeNotifs = generateCascadeNotifications(effects, promises);

      return {
        ...state,
        promises,
        notifications: [...state.notifications, ...cascadeNotifs],
      };
    }

    case "DELETE_PROMISE": {
      const toDelete = state.promises.find((p) => p.id === action.id);
      let promises = state.promises.filter((p) => p.id !== action.id);

      // Remove from parent's children list
      if (toDelete?.parent) {
        promises = promises.map((p) => {
          if (p.id !== toDelete.parent) return p;
          return { ...p, children: p.children.filter((c) => c !== action.id) };
        });
      }

      // Remove children recursively
      if (toDelete && toDelete.children.length > 0) {
        const childIds = new Set(collectDescendants(toDelete.id, state.promises));
        promises = promises.filter((p) => !childIds.has(p.id));
      }

      // Remove from dependency lists
      promises = promises.map((p) => ({
        ...p,
        depends_on: p.depends_on.filter((d) => d !== action.id),
      }));

      promises = recomputeAllParentStatuses(promises);
      return { ...state, promises };
    }

    // ── Phase 2: Sub-promises ──────────────────────────────────────────────

    case "CREATE_SUB_PROMISE": {
      const subPromise: GardenPromise = {
        ...action.promise,
        parent: action.parentId,
      };

      let promises = [...state.promises, subPromise];

      // Add child ID to parent
      promises = promises.map((p) => {
        if (p.id !== action.parentId) return p;
        return { ...p, children: [...p.children, subPromise.id] };
      });

      promises = recomputeAllParentStatuses(promises);
      return { ...state, promises };
    }

    case "REMOVE_SUB_PROMISE": {
      let promises = state.promises.filter((p) => p.id !== action.childId);

      // Remove from parent's children list
      promises = promises.map((p) => {
        if (p.id !== action.parentId) return p;
        return { ...p, children: p.children.filter((c) => c !== action.childId) };
      });

      promises = recomputeAllParentStatuses(promises);
      return { ...state, promises };
    }

    // ── Phase 2: Dependencies ──────────────────────────────────────────────

    case "ADD_DEPENDENCY": {
      // fromId depends on toId
      const promises = state.promises.map((p) => {
        if (p.id !== action.fromId) return p;
        if (p.depends_on.includes(action.toId)) return p;
        return { ...p, depends_on: [...p.depends_on, action.toId] };
      });
      return { ...state, promises };
    }

    case "REMOVE_DEPENDENCY": {
      const promises = state.promises.map((p) => {
        if (p.id !== action.fromId) return p;
        return { ...p, depends_on: p.depends_on.filter((d) => d !== action.toId) };
      });
      return { ...state, promises };
    }

    // ── Phase 2: Accountability Partner ────────────────────────────────────

    case "SET_PARTNER": {
      const promises = state.promises.map((p) => {
        if (p.id !== action.promiseId) return p;
        return {
          ...p,
          partner: {
            partnerId: action.partnerId,
            visibility: action.visibility,
            connectedAt: new Date().toISOString(),
            accepted: false,
          },
        };
      });
      return { ...state, promises };
    }

    case "REMOVE_PARTNER": {
      const promises = state.promises.map((p) => {
        if (p.id !== action.promiseId) return p;
        const { partner: _, ...rest } = p;
        return { ...rest, children: p.children, parent: p.parent } as GardenPromise;
      });
      return { ...state, promises };
    }

    case "PARTNER_WATER": {
      // Partner "waters" a plant — acts as promisee-side verification confirmation
      const promise = state.promises.find((p) => p.id === action.promiseId);
      if (!promise) return state;

      const notification: GardenNotification = {
        id: `notif-water-${Date.now()}`,
        type: "partner-watered",
        channel: "in-app",
        recipientId: "self",
        promiseId: action.promiseId,
        message: `${promise.partner?.partnerName ?? "Your partner"} watered your ${promise.domain} plant`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      return {
        ...state,
        notifications: [...state.notifications, notification],
      };
    }

    case "PARTNER_ENCOURAGE": {
      const promise = state.promises.find((p) => p.id === action.promiseId);
      if (!promise) return state;

      const notification: GardenNotification = {
        id: `notif-encourage-${Date.now()}`,
        type: "partner-encouragement",
        channel: "push",
        recipientId: "self",
        promiseId: action.promiseId,
        message: action.message || `${promise.partner?.partnerName ?? "Someone"} is thinking about your ${promise.domain} garden`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      return {
        ...state,
        notifications: [...state.notifications, notification],
      };
    }

    // ── Phase 2: Sensor ────────────────────────────────────────────────────

    case "CONNECT_SENSOR": {
      const promises = state.promises.map((p) => {
        if (p.id !== action.promiseId) return p;
        return {
          ...p,
          sensor: {
            type: action.sensorType,
            threshold: action.threshold,
            connectedAt: new Date().toISOString(),
          },
          verification: {
            ...p.verification,
            method: "sensor" as const,
          },
        };
      });
      return { ...state, promises };
    }

    case "DISCONNECT_SENSOR": {
      const promises = state.promises.map((p) => {
        if (p.id !== action.promiseId) return p;
        const { sensor: _, ...rest } = p;
        return {
          ...rest,
          children: p.children,
          parent: p.parent,
          verification: { ...p.verification, method: "self-report" as const },
        } as GardenPromise;
      });
      return { ...state, promises };
    }

    case "SENSOR_UPDATE": {
      let promises = state.promises.map((p) => {
        if (p.id !== action.promiseId) return p;
        return {
          ...p,
          status: action.newStatus,
          sensor: p.sensor
            ? { ...p.sensor, lastReadAt: new Date().toISOString() }
            : p.sensor,
        };
      });

      promises = recomputeAllParentStatuses(promises);

      return { ...state, promises };
    }

    // ── Phase 2: Camera / Zoom ─────────────────────────────────────────────

    case "SET_CAMERA": {
      return {
        ...state,
        camera: { ...state.camera, ...action.camera },
      };
    }

    case "ZOOM_TO_PROMISE": {
      const promise = state.promises.find((p) => p.id === action.promiseId);
      if (!promise) return state;
      return {
        ...state,
        camera: {
          ...state.camera,
          zoom: promise.children.length > 0 ? 2.0 : 3.0,
          focusPromiseId: action.promiseId,
          focusDomain: promise.domain as any,
        },
      };
    }

    case "ZOOM_TO_DOMAIN": {
      return {
        ...state,
        camera: {
          ...state.camera,
          zoom: 0.8,
          focusDomain: action.domain,
          focusPromiseId: undefined,
        },
      };
    }

    case "ZOOM_TO_LANDSCAPE": {
      return {
        ...state,
        camera: {
          ...DEFAULT_CAMERA,
          zoom: 0.35,
        },
      };
    }

    // ── Phase 2: Notifications ─────────────────────────────────────────────

    case "ADD_NOTIFICATION": {
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      };
    }

    case "MARK_NOTIFICATION_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };
    }

    // ── Phase 2: Auth ──────────────────────────────────────────────────────

    case "SET_USER_ID": {
      return { ...state, userId: action.userId };
    }

    // ── Phase 2: Shared plants ─────────────────────────────────────────────

    case "SYNC_SHARED_PLANTS": {
      return { ...state, sharedWithMe: action.plants };
    }

    // ── Phase 3: Team ──────────────────────────────────────────────────────

    case "SET_TEAM": {
      return { ...state, team: action.team };
    }

    case "LEAVE_TEAM": {
      // Remove team-linked promises from personal garden
      const promises = state.promises.filter(
        (p) => !(p as any).teamPromiseId
      );
      return { ...state, team: undefined, promises };
    }

    case "TEAM_PROMISE_RECEIVED": {
      // Create a personal-garden proxy for the team promise
      const proxy: GardenPromise = {
        id: `PG-team-${action.teamPromise.id}`,
        isPersonal: true,
        promiser: "self",
        promisee: "team",
        body: action.teamPromise.body,
        domain: action.teamPromise.domain,
        status: "declared",
        note: "",
        verification: action.teamPromise.verification ?? { method: "self-report" },
        depends_on: [],
        polarity: "give",
        origin: "voluntary",
        createdAt: new Date().toISOString(),
        children: [],
        parent: null,
      };
      // Tag with team metadata (stored as extra fields)
      (proxy as any).teamPromiseId = action.teamPromise.id;
      (proxy as any).teamId = action.teamId;
      (proxy as any).teamSynced = true;

      return {
        ...state,
        promises: [...state.promises, proxy],
      };
    }

    case "CREATE_TEAM_SUB_PROMISE": {
      // Find the personal proxy for the team promise
      const proxyId = state.promises.find(
        (p) => (p as any).teamPromiseId === action.teamPromiseId
      )?.id;
      if (!proxyId) return state;

      const sub: GardenPromise = {
        ...action.subPromise,
        parent: proxyId,
      };

      let promises = [...state.promises, sub];
      promises = promises.map((p) => {
        if (p.id !== proxyId) return p;
        return { ...p, children: [...p.children, sub.id] };
      });

      promises = recomputeAllParentStatuses(promises);
      return { ...state, promises };
    }

    case "TEAM_STATUS_UPDATE": {
      // Sync status from team (e.g., team lead changes status)
      const promises = state.promises.map((p) => {
        if ((p as any).teamPromiseId !== action.promiseId) return p;
        return { ...p, status: action.newStatus };
      });
      return { ...state, promises };
    }

    // ── Phase 3: Contribution ──────────────────────────────────────────────

    case "ENABLE_CONTRIBUTION": {
      return {
        ...state,
        contribution: {
          ...(state.contribution ?? DEFAULT_CONTRIBUTION_STATE),
          enabled: true,
          level: action.level,
          enabledAt: new Date().toISOString(),
        },
      };
    }

    case "DISABLE_CONTRIBUTION": {
      return {
        ...state,
        contribution: {
          ...(state.contribution ?? DEFAULT_CONTRIBUTION_STATE),
          enabled: false,
        },
        predictions: [],
        benchmarks: [],
      };
    }

    case "CONTRIBUTION_SENT": {
      const contribution = state.contribution ?? DEFAULT_CONTRIBUTION_STATE;
      return {
        ...state,
        contribution: {
          ...contribution,
          lastSentAt: new Date().toISOString(),
          batchesSent: contribution.batchesSent + 1,
        },
      };
    }

    case "UPGRADE_CONTRIBUTION_LEVEL": {
      return {
        ...state,
        contribution: {
          ...(state.contribution ?? DEFAULT_CONTRIBUTION_STATE),
          level: action.level,
          levelAUnlockedAt:
            action.level === "A" ? new Date().toISOString() : undefined,
        },
      };
    }

    case "SYNC_PREDICTIONS": {
      return { ...state, predictions: action.predictions };
    }

    case "SYNC_BENCHMARKS": {
      return { ...state, benchmarks: action.benchmarks };
    }

    // ── Phase 3: Gifting ───────────────────────────────────────────────────

    case "MINT_ARTIFACT": {
      const promise = state.promises.find((p) => p.id === action.promiseId);
      if (!promise || promise.status !== "verified") return state;

      const dwellDays = promise.completedAt && promise.createdAt
        ? Math.round(
            (new Date(promise.completedAt).getTime() -
              new Date(promise.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      const kRegime = promise.sensor ? "physics" : "ecological";
      const material: Artifact["material"] =
        kRegime === "physics" ? "crystalline" : "organic";

      const artifact: Artifact = {
        id: `ART-${Date.now()}-${promise.id}`,
        generatedFrom: {
          promiseId: promise.id,
          domain: promise.domain as any,
          body: promise.body,
          durationTier: "medium",
          stakesTier: "medium",
          verificationMethod: promise.verification.method,
          kRegime,
        },
        formSeed: promise.id,
        material,
        dwellDays,
        mintedAt: new Date().toISOString(),
      };

      return {
        ...state,
        artifacts: [...(state.artifacts ?? []), artifact],
      };
    }

    case "GIFT_ARTIFACT": {
      const artifacts = (state.artifacts ?? []).map((a) =>
        a.id === action.artifactId ? { ...a, gifted: true } : a
      );

      const notification: GardenNotification = {
        id: `notif-gift-sent-${Date.now()}`,
        type: "partner-encouragement",
        channel: "in-app",
        recipientId: "self",
        promiseId: "",
        message: `Artifact gifted successfully`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      return {
        ...state,
        artifacts,
        notifications: [...state.notifications, notification],
      };
    }

    case "RECEIVE_GIFT": {
      return {
        ...state,
        receivedGifts: [...(state.receivedGifts ?? []), action.gift],
      };
    }

    default:
      return state;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Collect all descendant IDs of a promise (recursive children). */
function collectDescendants(id: string, promises: GardenPromise[]): string[] {
  const parent = promises.find((p) => p.id === id);
  if (!parent || parent.children.length === 0) return [];

  const result: string[] = [];
  for (const childId of parent.children) {
    result.push(childId);
    result.push(...collectDescendants(childId, promises));
  }
  return result;
}
