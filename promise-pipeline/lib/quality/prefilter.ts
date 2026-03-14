// ─── PROMISE QUALITY PRE-FILTER ───
// Rules-based surface-level evaluation. Catches obvious failures fast, without an API call.

export interface PrefilterResult {
  flags: {
    affirmative: boolean;
    specific: boolean;
    autonomous: boolean;
    observable: boolean;
  };
  has_flags: boolean;
  patterns_matched: string[];
}

// ─── NEGATION PATTERNS (AFFIRMATIVE flag) ───

const NEGATION_PATTERNS = [
  /\bwon'?t\b/i,
  /\bwill\s+not\b/i,
  /\bdon'?t\b/i,
  /\bdo\s+not\b/i,
  /\bstop\s+\w+ing\b/i,
  /\bquit\s+\w+ing\b/i,
  /\bavoid\b/i,
  /\bnever\b/i,
  /\bno\s+more\b/i,
  /\brefrain\b/i,
  /\babstain\b/i,
  /\bgive\s+up\b/i,
  /\bcut\s+out\b/i,
];

// ─── VAGUENESS PATTERNS (SPECIFIC flag) ───

const VAGUENESS_PATTERNS = [
  /\btry\s+(to|and|harder)\b/i,
  /\bmore\s+\w+\b/i,
  /\bbetter\b/i,
  /\bimprove\b/i,
  /\bwork\s+on\b/i,
  /\bfocus\s+on\b/i,
  /\bbe\s+more\b/i,
  /\bdo\s+better\b/i,
  /\bget\s+better\s+at\b/i,
];

const HAS_QUANTITY = /\d+|daily|weekly|every|each|once|twice|three|four|five/i;
const HAS_TIME_BOUND =
  /\bby\b|\bbefore\b|\bafter\b|\beach\s+(morning|evening|day|week|month)\b|\bam\b|\bpm\b|\bo'?clock\b/i;
const HAS_CONCRETE_VERB =
  /\bwrite\b|\bread\b|\bwalk\b|\brun\b|\bcall\b|\bsend\b|\bcomplete\b|\bsubmit\b|\blog\b|\bpractice\b|\bsit\b|\bmeditate\b|\bcook\b|\bclean\b|\bstretch\b|\blift\b/i;

// ─── DEPENDENCY PATTERNS (AUTONOMOUS flag) ───

const DEPENDENCY_PATTERNS = [
  /\bmake\s+(them|him|her|my\s+\w+)\b/i,
  /\bget\s+(them|him|her|my\s+\w+)\s+to\b/i,
  /\bensure\s+that\s+\w+\b/i,
  /\bhold\s+\w+\s+accountable\b/i,
  /\bconvince\b/i,
  /\bpersuade\b/i,
  /\bmake\s+sure\s+(they|he|she)\b/i,
];

// ─── PRE-FILTER ───

export function prefilterPromise(text: string): PrefilterResult {
  const flags = {
    affirmative: false,
    specific: false,
    autonomous: false,
    observable: false, // Never flagged by pre-filter
  };
  const patterns_matched: string[] = [];

  // Check negation
  for (const pattern of NEGATION_PATTERNS) {
    if (pattern.test(text)) {
      flags.affirmative = true;
      patterns_matched.push(`negation:${pattern.source}`);
      break;
    }
  }

  // Check vagueness
  let vague_keyword = false;
  for (const pattern of VAGUENESS_PATTERNS) {
    if (pattern.test(text)) {
      vague_keyword = true;
      patterns_matched.push(`vague:${pattern.source}`);
      break;
    }
  }

  const has_quantity = HAS_QUANTITY.test(text);
  const has_time = HAS_TIME_BOUND.test(text);
  const has_verb = HAS_CONCRETE_VERB.test(text);

  if (vague_keyword || (!has_quantity && !has_time && !has_verb)) {
    flags.specific = true;
    if (!has_quantity) patterns_matched.push("no_quantity");
    if (!has_time) patterns_matched.push("no_time_bound");
    if (!has_verb) patterns_matched.push("no_concrete_verb");
  }

  // Check dependency
  for (const pattern of DEPENDENCY_PATTERNS) {
    if (pattern.test(text)) {
      flags.autonomous = true;
      patterns_matched.push(`dependency:${pattern.source}`);
      break;
    }
  }

  return {
    flags,
    has_flags: flags.affirmative || flags.specific || flags.autonomous,
    patterns_matched,
  };
}
