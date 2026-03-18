import { PersonalPromise } from "../types/personal";

/**
 * Fake promises for the clearcut time-lapse demo.
 *
 * These are NEVER persisted to localStorage and never shown in the garden
 * after the user plants their first real promise. They exist purely to drive
 * the GardenTimeLapse renderer with realistic-looking data across all five
 * domains and a variety of lifecycle states.
 *
 * Spread across all 5 domains so the renderer shows plant-type variety.
 * The time-lapse controller (GardenTimeLapse) overrides each promise's
 * `status` and `progress` fields per frame to animate growth — the values
 * below represent the "final / destination" state reached at end-of-loop.
 */

const EPOCH = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

export const demoPromises: PersonalPromise[] = [
  // ── Health (domain slot 1 of 5) ──────────────────────────────────────────
  // Fruit tree — fully grown, verified. First plant to appear.
  {
    id: "demo-1",
    body: "Exercise 3 times a week",
    domain: "health",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Work (domain slot 2 of 5) ─────────────────────────────────────────────
  // Oak — fully grown, verified.
  {
    id: "demo-2",
    body: "Ship the feature by Friday",
    domain: "work",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Relationships (domain slot 3 of 5) ───────────────────────────────────
  // Flowering plant — fully grown, verified.
  {
    id: "demo-3",
    body: "Call Mom every Sunday",
    domain: "relationships",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Creative (domain slot 4 of 5) ────────────────────────────────────────
  // Fern — still growing (declared). Enters at 5 s.
  {
    id: "demo-4",
    body: "Write 500 words every day",
    domain: "creative",
    status: "declared",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
  },

  // ── Financial (domain slot 5 of 5) ───────────────────────────────────────
  // Evergreen/pine — fully grown, verified. Enters at 5 s.
  {
    id: "demo-5",
    body: "Save $200 every month",
    domain: "financial",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Health (second plant) — stressed, shows lifecycle variety ────────────
  // Degraded — enters at 7 s, stays degraded to show that broken promises
  // still produce a living (if stressed) plant.
  {
    id: "demo-6",
    body: "Meditate 10 minutes a day",
    domain: "health",
    status: "degraded",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
  },

  // ── Work (second plant) — quickly verified ────────────────────────────────
  {
    id: "demo-7",
    body: "Review pull requests same day",
    domain: "work",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Relationships (second plant) ─────────────────────────────────────────
  {
    id: "demo-8",
    body: "Date night every week",
    domain: "relationships",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Creative (second plant) — fully grown by end ─────────────────────────
  {
    id: "demo-9",
    body: "Finish the painting",
    domain: "creative",
    status: "verified",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
    completedAt: EPOCH,
  },

  // ── Financial (second plant) — enters late, stays young ──────────────────
  {
    id: "demo-10",
    body: "Max out the Roth IRA",
    domain: "financial",
    status: "declared",
    isPersonal: true,
    promiser: "self",
    promisee: "self",
    origin: "voluntary",
    polarity: "give",
    note: "",
    verification: { method: "self-report" },
    depends_on: [],
    createdAt: EPOCH,
  },
];

/**
 * When each demo promise enters the scene (seconds into a 15s loop).
 * Promises entering late start young and stay young — that's intentional:
 * it shows natural variety without extra configuration.
 */
export const DEMO_ENTRY_TIMES: Record<string, number> = {
  "demo-1":  1.5,
  "demo-2":  3.0,
  "demo-3":  3.0,
  "demo-4":  5.0,
  "demo-5":  5.0,
  "demo-6":  7.0,
  "demo-7":  7.0,
  "demo-8":  9.0,
  "demo-9":  9.0,
  "demo-10": 11.0,
};
