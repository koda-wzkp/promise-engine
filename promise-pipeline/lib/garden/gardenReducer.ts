/**
 * Garden state reducer — Phase 2.
 *
 * Manages the full garden state: promises (with nesting), camera/zoom,
 * notifications, partner invites, and shared plants.
 *
 * Phase 1 compatibility: Phase 1 PersonalPromises are auto-upgraded to
 * GardenPromises via toGardenPromise() on load.
 */

import {
  GardenState,
  GardenAction,
  GardenPromise,
  CameraState,
  computeParentStatus,
} from "@/lib/types/garden-phase2";
import { PromiseStatus } from "@/lib/types/promise";

// ─── Default State ─────────────────────────────────────────────────────────

export const DEFAULT_CAMERA: CameraState = {
  zoomLevel: "domain",
  zoom: 0.5,
  centerX: 0,
  centerY: 0,
};

export const DEFAULT_GARDEN_STATE: GardenState = {
  promises: [],
  camera: DEFAULT_CAMERA,
  notifications: [],
  partnerInvites: [],
  sharedPlants: [],
};

// ─── Reducer ───────────────────────────────────────────────────────────────

export function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "CREATE_SUB_PROMISE": {
      const { parentId, promise } = action;
      const subPromise: GardenPromise = {
        ...promise,
        parent: parentId,
      };

      // Add child ID to parent
      const promises = state.promises.map((p) =>
        p.id === parentId
          ? { ...p, children: [...p.children, subPromise.id] }
          : p
      );

      return { ...state, promises: [...promises, subPromise] };
    }

    case "ADD_DEPENDENCY": {
      const { fromId, toId } = action;
      if (fromId === toId) return state;
      const promises = state.promises.map((p) => {
        if (p.id !== fromId) return p;
        if (p.depends_on.includes(toId)) return p;
        return { ...p, depends_on: [...p.depends_on, toId] };
      });
      return { ...state, promises };
    }

    case "REMOVE_DEPENDENCY": {
      const { fromId, toId } = action;
      const promises = state.promises.map((p) => {
        if (p.id !== fromId) return p;
        return { ...p, depends_on: p.depends_on.filter((d) => d !== toId) };
      });
      return { ...state, promises };
    }

    case "SET_PARTNER": {
      const { promiseId, partnerId, visibility } = action;
      const promises = state.promises.map((p) =>
        p.id === promiseId
          ? { ...p, partnerId, partnerVisibility: visibility }
          : p
      );
      return { ...state, promises };
    }

    case "REMOVE_PARTNER": {
      const { promiseId } = action;
      const promises = state.promises.map((p) =>
        p.id === promiseId
          ? { ...p, partnerId: undefined, partnerVisibility: undefined }
          : p
      );
      return { ...state, promises };
    }

    case "PARTNER_WATER": {
      // Partner watering shifts verification to physics k regime
      const { promiseId } = action;
      const now = new Date().toISOString();
      const promises = state.promises.map((p) =>
        p.id === promiseId
          ? {
              ...p,
              verification: { ...p.verification, method: "sensor" as const },
            }
          : p
      );
      const notification = {
        id: `notif-${Date.now()}`,
        type: "partner-watered" as const,
        promiseId,
        message: "Your accountability partner confirmed your check-in",
        timestamp: now,
        read: false,
        channel: "in-app" as const,
      };
      return {
        ...state,
        promises,
        notifications: [...state.notifications, notification],
      };
    }

    case "CONNECT_SENSOR": {
      const { promiseId, sensorType, threshold, metric } = action;
      const promises = state.promises.map((p) =>
        p.id === promiseId
          ? {
              ...p,
              sensor: { type: sensorType, metric, threshold, connected: true },
              verification: { ...p.verification, method: "sensor" as const },
            }
          : p
      );
      return { ...state, promises };
    }

    case "DISCONNECT_SENSOR": {
      const { promiseId } = action;
      const promises = state.promises.map((p) =>
        p.id === promiseId
          ? {
              ...p,
              sensor: undefined,
              verification: { ...p.verification, method: "self-report" as const },
            }
          : p
      );
      return { ...state, promises };
    }

    case "SENSOR_UPDATE": {
      const { promiseId, newStatus } = action;
      return updatePromiseAndCascade(state, promiseId, newStatus);
    }

    case "SET_ZOOM": {
      return {
        ...state,
        camera: { ...state.camera, ...action.camera },
      };
    }

    case "ADD_NOTIFICATION": {
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      };
    }

    case "MARK_NOTIFICATION_READ": {
      const notifications = state.notifications.map((n) =>
        n.id === action.notificationId ? { ...n, read: true } : n
      );
      return { ...state, notifications };
    }

    case "UPDATE_PROMISE_STATUS": {
      const { promiseId, status, reflection } = action;
      return updatePromiseAndCascade(state, promiseId, status, reflection);
    }

    default:
      return state;
  }
}

// ─── Cascade Helpers ───────────────────────────────────────────────────────

/**
 * Update a promise's status and propagate parent status computation upward.
 * Also sets completedAt for terminal statuses.
 */
function updatePromiseAndCascade(
  state: GardenState,
  promiseId: string,
  newStatus: PromiseStatus,
  reflection?: string
): GardenState {
  let promises = state.promises.map((p) => {
    if (p.id !== promiseId) return p;
    return {
      ...p,
      status: newStatus,
      reflection: reflection || p.reflection,
      completedAt:
        newStatus === "verified" || newStatus === "violated"
          ? new Date().toISOString()
          : p.completedAt,
    };
  });

  // Propagate upward: recompute parent statuses
  promises = recomputeParentChain(promises, promiseId);

  return { ...state, promises };
}

/**
 * Walk up the parent chain from a changed promise, recomputing each
 * ancestor's status from its children.
 */
function recomputeParentChain(promises: GardenPromise[], changedId: string): GardenPromise[] {
  const byId = new Map(promises.map((p) => [p.id, p]));
  let current = byId.get(changedId);

  while (current?.parent) {
    const parent = byId.get(current.parent);
    if (!parent) break;

    const childStatuses = parent.children
      .map((cid) => byId.get(cid)?.status)
      .filter((s): s is PromiseStatus => s !== undefined);

    const newParentStatus = computeParentStatus(childStatuses);

    if (newParentStatus !== parent.status) {
      const updated = {
        ...parent,
        status: newParentStatus,
        completedAt:
          newParentStatus === "verified" || newParentStatus === "violated"
            ? new Date().toISOString()
            : parent.completedAt,
      };
      byId.set(parent.id, updated);
    }

    current = parent;
  }

  return Array.from(byId.values());
}
