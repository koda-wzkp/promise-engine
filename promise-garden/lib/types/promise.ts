// Core Promise type — shared with Promise Pipeline.
// This file re-exports and extends the Promise Pipeline types for garden use.
// Promise Garden uses the same Promise interface; PersonalPromise extends it.

// ─── STATUS ───
export type PromiseStatus =
  | "verified"
  | "declared"
  | "degraded"
  | "violated"
  | "unverifiable"
  | "kept"
  | "broken"
  | "partial"
  | "delayed"
  | "modified"
  | "legally_challenged"
  | "repealed";

// ─── VERIFICATION ───
export type VerificationMethod =
  | "filing"
  | "audit"
  | "self-report"
  | "sensor"
  | "benchmark"
  | "none"
  | "data"
  | "legal";

export interface VerificationSource {
  method: VerificationMethod;
  source?: string;
  endpoint?: string;
  metric?: string;
  threshold?: {
    operator: "<=" | ">=" | "==" | "<" | ">";
    value: number;
  };
  frequency?: string;
}

// ─── PROMISE ───
export interface Promise {
  id: string;
  ref?: string;
  promiser: string;
  promisee: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  target?: string;
  progress?: number;
  required?: number;
  note: string;
  verification: VerificationSource;
  depends_on: string[];
  effectiveDate?: string;
  nodeType?: "promise" | "modifier";
}
