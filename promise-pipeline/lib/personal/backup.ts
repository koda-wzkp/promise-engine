// ─── PERSONAL DATA BACKUP ───
// Export, import, validation, and reminder logic for the personal tracker.

const PERSONAL_NETWORK_ID = "net-personal-default";

// Storage keys (mirrored from lib/storage/local.ts)
const STORAGE_KEYS = {
  networks: "pp_networks",
  network: `pp_net_${PERSONAL_NETWORK_ID}`,
  activity: `pp_net_${PERSONAL_NETWORK_ID}_activity`,
  draft: `pp_draft_${PERSONAL_NETWORK_ID}`,
  appSettings: "pp_app_settings",
};

export const LAST_BACKUP_KEY = "pp-last-backup";
export const LAST_CHANGE_KEY = "pp-last-data-change";
const DISMISSED_KEY = "pp-backup-reminder-dismissed";

// ─── EXPORT FORMAT ───

export interface PersonalDataExport {
  _meta: {
    version: 1;
    exported_at: string;
    app_version: string;
    promise_count: number;
    source: "promise-pipeline-personal";
  };
  network: unknown;
  activity: unknown;
  draft: unknown;
  settings: unknown;
}

// ─── EXPORT ───

export function exportPersonalData(): PersonalDataExport | null {
  if (typeof window === "undefined") return null;

  const network = readKey(STORAGE_KEYS.network);
  const activity = readKey(STORAGE_KEYS.activity);
  const draft = readKey(STORAGE_KEYS.draft);
  const settings = readKey(STORAGE_KEYS.appSettings);

  const promises = network?.promises;
  const promiseCount = Array.isArray(promises) ? promises.length : 0;

  return {
    _meta: {
      version: 1,
      exported_at: new Date().toISOString(),
      app_version: "2.0",
      promise_count: promiseCount,
      source: "promise-pipeline-personal",
    },
    network,
    activity,
    draft,
    settings,
  };
}

export function downloadPersonalBackup(): void {
  const data = exportPersonalData();
  if (!data) return;

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `promise-pipeline-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Record backup timestamp
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

// ─── IMPORT / VALIDATION ───

export function validateImport(data: unknown): data is PersonalDataExport {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  const meta = obj._meta as Record<string, unknown> | undefined;
  if (!meta) return false;
  if (meta.source !== "promise-pipeline-personal") return false;
  if (meta.version !== 1) return false;

  // Must have network data (the core payload)
  if (!obj.network || typeof obj.network !== "object") return false;

  return true;
}

export type ImportError = "invalid_json" | "not_a_backup" | "version_mismatch";

export interface ImportResult {
  success: boolean;
  error?: ImportError;
  errorMessage?: string;
  promiseCount?: number;
  exportedAt?: string;
}

export function parseImportFile(text: string): ImportResult & { data?: PersonalDataExport } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      success: false,
      error: "invalid_json",
      errorMessage: "This file couldn't be read. Make sure it's a Promise Pipeline backup file (.json).",
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      success: false,
      error: "not_a_backup",
      errorMessage: "This doesn't look like a Promise Pipeline backup. It may be from a different app or an older version.",
    };
  }

  const meta = (parsed as Record<string, unknown>)._meta as Record<string, unknown> | undefined;

  // Check if it's a PP export but wrong version
  if (meta?.source === "promise-pipeline-personal" && meta.version !== 1) {
    return {
      success: false,
      error: "version_mismatch",
      errorMessage: "This backup is from a newer version of Promise Pipeline. Please update the app first.",
    };
  }

  if (!validateImport(parsed)) {
    return {
      success: false,
      error: "not_a_backup",
      errorMessage: "This doesn't look like a Promise Pipeline backup. It may be from a different app or an older version.",
    };
  }

  return {
    success: true,
    data: parsed,
    promiseCount: parsed._meta.promise_count,
    exportedAt: parsed._meta.exported_at,
  };
}

export function applyImport(data: PersonalDataExport): void {
  if (typeof window === "undefined") return;

  // Write all keys back to localStorage
  if (data.network) {
    localStorage.setItem(STORAGE_KEYS.network, JSON.stringify(data.network));
  }
  if (data.activity) {
    localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(data.activity));
  }
  if (data.draft) {
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(data.draft));
  }
  if (data.settings) {
    localStorage.setItem(STORAGE_KEYS.appSettings, JSON.stringify(data.settings));
  }

  // Ensure network is in the index
  const ids = readKey(STORAGE_KEYS.networks);
  const networkIds: string[] = Array.isArray(ids) ? ids : [];
  if (!networkIds.includes(PERSONAL_NETWORK_ID)) {
    networkIds.push(PERSONAL_NETWORK_ID);
    localStorage.setItem(STORAGE_KEYS.networks, JSON.stringify(networkIds));
  }

  // Update backup timestamp
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

// ─── BACKUP REMINDER ───

export function recordDataChange(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_CHANGE_KEY, new Date().toISOString());
}

export interface BackupReminderState {
  show: boolean;
  variant: "first-time" | "returning";
  lastBackupDate?: string;
  isSafariIOS: boolean;
}

export function getBackupReminderState(): BackupReminderState {
  if (typeof window === "undefined") {
    return { show: false, variant: "first-time", isSafariIOS: false };
  }

  const isSafariIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /WebKit/.test(navigator.userAgent) &&
    !/(CriOS|FxiOS|OPiOS)/.test(navigator.userAgent);

  // Check if there are any promises
  const network = readKey(STORAGE_KEYS.network);
  const promises = network?.promises;
  if (!Array.isArray(promises) || promises.length === 0) {
    return { show: false, variant: "first-time", isSafariIOS };
  }

  // Check if dismissed this session
  const dismissed = sessionStorage.getItem(DISMISSED_KEY);
  if (dismissed === "true") {
    return { show: false, variant: "first-time", isSafariIOS };
  }

  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  const lastChange = localStorage.getItem(LAST_CHANGE_KEY);

  // Never backed up — show first-time
  if (!lastBackup) {
    return { show: true, variant: "first-time", isSafariIOS };
  }

  // No changes since last backup — no reminder
  if (lastChange && new Date(lastChange) <= new Date(lastBackup)) {
    return { show: false, variant: "returning", lastBackupDate: lastBackup, isSafariIOS };
  }

  // Changes exist — check if 7+ days
  const daysSinceBackup = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceBackup >= 7) {
    return { show: true, variant: "returning", lastBackupDate: lastBackup, isSafariIOS };
  }

  return { show: false, variant: "returning", lastBackupDate: lastBackup, isSafariIOS };
}

export function dismissBackupReminder(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DISMISSED_KEY, "true");
}

// ─── HELPERS ───

function readKey(key: string): Record<string, unknown> | unknown[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
