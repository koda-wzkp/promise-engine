/**
 * Load empirical cascade parameters from Benthos research.
 * Source: parameters/empirical_cascade_params.json
 *
 * Eight empirical findings calibrated from 7,193 observed state transitions
 * in the MONA dataset (March 2026):
 *   1. ENAQT-calibrated coherent coupling per verification structure
 *   2. Quantum instrument transition matrix (inter-status probabilities)
 *   3. Percolation thresholds (random p_c ~0.45, targeted p_c ~0.10)
 *   4. Tensor cascade correction (~10% BFS over-prediction)
 *   5. Zeno effect (rho = -0.191, frequent observation suppresses transitions)
 *   6. Memory kernel (tau_m ~0.1, Markovian — Lindblad sufficient)
 *   7. Measurement backaction (delta_k = +0.176 for re-assessed promises)
 *   8. Bond dimension (chi = 2, pairwise correlations sufficient)
 */

import { Promise } from "../types/promise";
import empiricalParamsRaw from "@/parameters/empirical_cascade_params.json";

export interface VerificationStructureParams {
  prior_compliance: number;
  k: number;
  coupling_weight: number;
  coherent_coupling: number;
  enaqt_viable: boolean;
  optimal_review_period: number | null;
}

export interface EmpiricalParams {
  [structure: string]: VerificationStructureParams;
}

/**
 * Quantum instrument transition matrix from 7,193 observed state changes.
 *
 * P(next | current) — row = current state, column = next state.
 * Key findings:
 *   - Met with delay -> Not met at 64% (fragile fulfillment is unstable)
 *   - Not met -> Met with delay at 50% (recovery is indirect)
 *   - Declared -> Met at 54% (majority resolve successfully)
 */
export const TRANSITION_TENSOR: Record<string, Record<string, number>> = {
  'Declared':       { 'Met': 0.542, 'Met with delay': 0.119, 'Not met': 0.139, 'Declared': 0.0 },
  'Met':            { 'Declared': 0.278, 'Met with delay': 0.148, 'Not met': 0.148, 'Met': 0.0 },
  'Met with delay': { 'Declared': 0.071, 'Met': 0.143, 'Not met': 0.643, 'Met with delay': 0.0 },
  'Not met':        { 'Declared': 0.127, 'Met': 0.114, 'Met with delay': 0.500, 'Not met': 0.0 },
};

/** Map Promise status values to transition matrix keys */
export const STATUS_MAP: Record<string, string> = {
  'verified': 'Met',
  'declared': 'Declared',
  'degraded': 'Met with delay',
  'violated': 'Not met',
  'unverifiable': 'Declared',
};

/** Reverse map for converting transition matrix keys back to Promise statuses */
export const REVERSE_STATUS_MAP: Record<string, string> = {
  'Met': 'verified',
  'Declared': 'declared',
  'Met with delay': 'degraded',
  'Not met': 'violated',
};

/**
 * Load and validate empirical parameters from the JSON file.
 * Returns null if the file is missing or malformed.
 */
export function loadEmpiricalParams(): EmpiricalParams | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = empiricalParamsRaw as any;
    const params = raw.verification_structures;

    if (!params) {
      console.warn('Empirical params loaded but missing verification_structures');
      return null;
    }

    // Validate that coherent_coupling exists on at least one structure
    const firstKey = Object.keys(params)[0];
    if (firstKey && params[firstKey]?.coherent_coupling !== undefined) {
      return params as EmpiricalParams;
    }

    console.warn('Empirical params loaded but missing coherent_coupling');
    return null;
  } catch {
    return null;
  }
}

/**
 * Infer the verification structure key for a promise based on its
 * verification method. Maps to keys in empirical_cascade_params.json.
 */
export function inferVerificationStructure(promise: Promise): string {
  const method = promise.verification?.method;
  switch (method) {
    case 'filing':
    case 'audit':
    case 'sensor':
      return 'numeric_templated_periodic';
    case 'benchmark':
      return 'qualitative_judgment_periodic';
    case 'self-report':
      return 'qualitative_event_driven';
    case 'none':
    default:
      return 'none';
  }
}
