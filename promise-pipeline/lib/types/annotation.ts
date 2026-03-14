import { Promise as PromiseType, VerificationMethod } from "./promise";

// ─── BILL METADATA ───
export interface BillMeta {
  slug: string;
  name: string;
  citation: string;
  jurisdiction: string;
  year: number;
  fetchedAt: string;
}

// ─── PROMISE CANDIDATE (from Claude extraction) ───
export interface PromiseCandidate {
  id: string;
  ref: string;
  promiser: string;
  promisee: string;
  body: string;
  domain: string;
  status: "declared";
  target: string | null;
  progress: number | null;
  required: number | null;
  note: string;
  verification: {
    method: VerificationMethod;
    source: string | null;
    metric: string | null;
    frequency: string | null;
  };
  depends_on: string[];
  sourceText: string;
  confidence: number;
  extractionNotes: string;
}

// ─── ANNOTATED PROMISE (after human review) ───
export interface AnnotatedPromise extends PromiseType {
  _annotation: {
    billSlug: string;
    billName: string;
    jurisdiction: string;
    annotatedAt: string;
    annotationStatus: "accepted" | "rejected" | "skipped";
    wasEdited: boolean;
    originalExtraction: Partial<PromiseCandidate>;
    sourceText: string;
    confidence: number;
    claudeNotes: string;
  };
}

// ─── BILL TRAINING DATA FILE ───
export interface BillTrainingData {
  bill: BillMeta;
  stats: {
    totalCandidates: number;
    accepted: number;
    edited: number;
    rejected: number;
    skipped: number;
  };
  promises: AnnotatedPromise[];
}

// ─── MANIFEST ───
export interface ManifestEntry {
  slug: string;
  name: string;
  jurisdiction: string;
  status: "in-progress" | "complete";
  promiseCount: number;
  source?: string;
  lastAnnotatedAt?: string;
}

export interface TrainingManifest {
  lastUpdated: string;
  totalVerifiedPromises: number;
  bills: ManifestEntry[];
}

// ─── STATE MANAGEMENT ───
export type AnnotationPhase = "search" | "extracting" | "annotating" | "complete" | "error";

export interface AnnotationState {
  phase: AnnotationPhase;
  bill: BillMeta | null;
  billText: string;
  candidates: PromiseCandidate[];
  currentIndex: number;
  decisions: Record<string, "accepted" | "rejected" | "skipped">;
  edits: Record<string, Partial<PromiseCandidate>>;
  extractionError: { type: "parse_failed"; rawText: string } | null;
}

export type AnnotationAction =
  | { type: "BILL_LOADED"; bill: BillMeta; text: string }
  | { type: "EXTRACTION_COMPLETE"; candidates: PromiseCandidate[] }
  | { type: "EXTRACTION_FAILED"; error: { type: "parse_failed"; rawText: string } }
  | { type: "ACCEPT"; id: string; edits?: Partial<PromiseCandidate> }
  | { type: "REJECT"; id: string }
  | { type: "SKIP"; id: string }
  | { type: "PREVIOUS" }
  | { type: "RESET" };
