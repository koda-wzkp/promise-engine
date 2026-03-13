import {
  PromiseNetwork,
  ActivityEntry,
  PromiseCreateInput,
  AppSettings,
  PromiseNetworkExport,
} from "../types/network";

// ─── STORAGE KEYS ───

const KEYS = {
  networks: "pp_networks",
  network: (id: string) => `pp_net_${id}`,
  activity: (id: string) => `pp_net_${id}_activity`,
  draft: (id: string) => `pp_draft_${id}`,
  appSettings: "pp_app_settings",
} as const;

const CURRENT_SCHEMA_VERSION = 1;
const MAX_ACTIVITY_ENTRIES = 500;

// ─── STORAGE ENGINE ───

export interface StorageEngine {
  listNetworks: () => string[];
  getNetwork: (id: string) => PromiseNetwork | null;
  saveNetwork: (network: PromiseNetwork) => boolean;
  deleteNetwork: (id: string) => void;

  getActivity: (networkId: string) => ActivityEntry[];
  appendActivity: (networkId: string, entry: ActivityEntry) => void;
  trimActivity: (networkId: string, keepLast: number) => void;

  getDraft: (networkId: string) => Partial<PromiseCreateInput> | null;
  saveDraft: (networkId: string, draft: Partial<PromiseCreateInput>) => void;
  clearDraft: (networkId: string) => void;

  getAppSettings: () => AppSettings;
  saveAppSettings: (settings: AppSettings) => void;

  exportAll: () => string;
  importAll: (json: string) => { success: boolean; error?: string; networksImported: number };
  exportNetwork: (id: string) => PromiseNetworkExport | null;
  importNetwork: (data: PromiseNetworkExport) => { success: boolean; error?: string };

  getUsage: () => { used: number; limit: number; byNetwork: Record<string, number> };
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  recentNetworks: [],
  theme: "light",
  reducedMotion: false,
};

// ─── HELPERS ───

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[storage] Failed to parse ${key}`);
    return null;
  }
}

function writeJSON(key: string, data: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.warn("[storage] localStorage quota exceeded");
    }
    return false;
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function estimateSize(key: string): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(key);
  return val ? key.length + val.length : 0;
}

// ─── MIGRATION REGISTRY ───

interface VersionedData {
  _schemaVersion?: number;
}

const migrations: Record<number, (data: VersionedData) => VersionedData> = {
  // Future: 1 → 2 migration
};

function migrateNetwork(data: VersionedData, from: number, to: number): PromiseNetwork {
  let current = data;
  for (let v = from; v < to; v++) {
    if (migrations[v]) {
      current = migrations[v](current);
    }
  }
  (current as VersionedData)._schemaVersion = to;
  return current as unknown as PromiseNetwork;
}

// ─── CREATE ENGINE ───

export function createStorageEngine(): StorageEngine {
  return {
    // ─── NETWORK CRUD ───

    listNetworks(): string[] {
      return readJSON<string[]>(KEYS.networks) ?? [];
    },

    getNetwork(id: string): PromiseNetwork | null {
      const data = readJSON<VersionedData & PromiseNetwork>(KEYS.network(id));
      if (!data) return null;

      const version = data._schemaVersion ?? 0;
      if (version < CURRENT_SCHEMA_VERSION) {
        const migrated = migrateNetwork(data, version, CURRENT_SCHEMA_VERSION);
        writeJSON(KEYS.network(id), migrated);
        return migrated;
      }

      return data;
    },

    saveNetwork(network: PromiseNetwork): boolean {
      const toSave = {
        ...network,
        updatedAt: new Date().toISOString(),
        _schemaVersion: CURRENT_SCHEMA_VERSION,
      };

      const success = writeJSON(KEYS.network(network.id), toSave);
      if (!success) return false;

      // Ensure network is in the index
      const ids = readJSON<string[]>(KEYS.networks) ?? [];
      if (!ids.includes(network.id)) {
        ids.push(network.id);
        writeJSON(KEYS.networks, ids);
      }

      return true;
    },

    deleteNetwork(id: string): void {
      removeKey(KEYS.network(id));
      removeKey(KEYS.activity(id));
      removeKey(KEYS.draft(id));

      const ids = readJSON<string[]>(KEYS.networks) ?? [];
      const updated = ids.filter((nid) => nid !== id);
      writeJSON(KEYS.networks, updated);
    },

    // ─── ACTIVITY ───

    getActivity(networkId: string): ActivityEntry[] {
      return readJSON<ActivityEntry[]>(KEYS.activity(networkId)) ?? [];
    },

    appendActivity(networkId: string, entry: ActivityEntry): void {
      const entries = readJSON<ActivityEntry[]>(KEYS.activity(networkId)) ?? [];
      entries.unshift(entry);
      // Auto-trim if over limit
      if (entries.length > MAX_ACTIVITY_ENTRIES) {
        entries.length = MAX_ACTIVITY_ENTRIES;
      }
      writeJSON(KEYS.activity(networkId), entries);
    },

    trimActivity(networkId: string, keepLast: number): void {
      const entries = readJSON<ActivityEntry[]>(KEYS.activity(networkId)) ?? [];
      if (entries.length > keepLast) {
        entries.length = keepLast;
        writeJSON(KEYS.activity(networkId), entries);
      }
    },

    // ─── DRAFTS ───

    getDraft(networkId: string): Partial<PromiseCreateInput> | null {
      return readJSON<Partial<PromiseCreateInput>>(KEYS.draft(networkId));
    },

    saveDraft(networkId: string, draft: Partial<PromiseCreateInput>): void {
      writeJSON(KEYS.draft(networkId), draft);
    },

    clearDraft(networkId: string): void {
      removeKey(KEYS.draft(networkId));
    },

    // ─── APP SETTINGS ───

    getAppSettings(): AppSettings {
      return readJSON<AppSettings>(KEYS.appSettings) ?? { ...DEFAULT_APP_SETTINGS };
    },

    saveAppSettings(settings: AppSettings): void {
      writeJSON(KEYS.appSettings, settings);
    },

    // ─── DATA PORTABILITY ───

    exportAll(): string {
      const ids = readJSON<string[]>(KEYS.networks) ?? [];
      const exports: PromiseNetworkExport[] = [];

      for (const id of ids) {
        const network = this.getNetwork(id);
        if (network) {
          exports.push({
            format: "promise-network-export",
            version: 1,
            exportedAt: new Date().toISOString(),
            network,
            activity: this.getActivity(id),
          });
        }
      }

      return JSON.stringify({
        format: "promise-network-full-backup",
        version: 1,
        exportedAt: new Date().toISOString(),
        networks: exports,
        settings: this.getAppSettings(),
      }, null, 2);
    },

    importAll(json: string): { success: boolean; error?: string; networksImported: number } {
      try {
        const data = JSON.parse(json);
        if (!data.networks || !Array.isArray(data.networks)) {
          return { success: false, error: "Invalid backup format", networksImported: 0 };
        }

        let imported = 0;
        for (const exp of data.networks) {
          const result = this.importNetwork(exp);
          if (result.success) imported++;
        }

        if (data.settings) {
          this.saveAppSettings(data.settings);
        }

        return { success: true, networksImported: imported };
      } catch (err) {
        return { success: false, error: "Failed to parse backup JSON", networksImported: 0 };
      }
    },

    exportNetwork(id: string): PromiseNetworkExport | null {
      const network = this.getNetwork(id);
      if (!network) return null;

      return {
        format: "promise-network-export",
        version: 1,
        exportedAt: new Date().toISOString(),
        network,
        activity: this.getActivity(id),
      };
    },

    importNetwork(data: PromiseNetworkExport): { success: boolean; error?: string } {
      if (data.format !== "promise-network-export" || !data.network) {
        return { success: false, error: "Invalid export format" };
      }

      const success = this.saveNetwork(data.network);
      if (!success) {
        return { success: false, error: "Failed to save network (storage full?)" };
      }

      if (data.activity && Array.isArray(data.activity)) {
        writeJSON(KEYS.activity(data.network.id), data.activity);
      }

      return { success: true };
    },

    // ─── DIAGNOSTICS ───

    getUsage(): { used: number; limit: number; byNetwork: Record<string, number> } {
      const byNetwork: Record<string, number> = {};
      let used = 0;

      if (typeof window === "undefined") {
        return { used: 0, limit: 5 * 1024 * 1024, byNetwork };
      }

      const ids = readJSON<string[]>(KEYS.networks) ?? [];
      for (const id of ids) {
        const networkSize = estimateSize(KEYS.network(id));
        const activitySize = estimateSize(KEYS.activity(id));
        const draftSize = estimateSize(KEYS.draft(id));
        byNetwork[id] = networkSize + activitySize + draftSize;
        used += byNetwork[id];
      }

      // Add settings and index size
      used += estimateSize(KEYS.networks);
      used += estimateSize(KEYS.appSettings);

      return { used, limit: 5 * 1024 * 1024, byNetwork };
    },
  };
}
