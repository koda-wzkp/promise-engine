// ─── PROMISE STARTER TEMPLATES ───
// Pre-validated promise sets for common use cases.

export interface PromiseTemplate {
  body: string;
  domain: string;
  frequency: string;
  note?: string;
}

export interface TemplateSet {
  id: string;
  name: string;
  description: string;
  citation?: string;
  templates: PromiseTemplate[];
}

export const STARTER_TEMPLATES: TemplateSet[] = [
  {
    id: "bfrb-recovery",
    name: "BFRB Recovery",
    description:
      "For skin picking, hair pulling, or nail biting. Evidence-based practices from Habit Reversal Training.",
    citation:
      "Based on Habit Reversal Training (Azrin & Nunn, 1973) and mindfulness-based relapse prevention (Woods & Miltenberger, 2001).",
    templates: [
      {
        body: "I will do a 5-minute morning intention-setting practice",
        domain: "BFRB Recovery",
        frequency: "daily",
      },
      {
        body: "I will log one awareness entry when I notice a picking/pulling urge",
        domain: "BFRB Recovery",
        frequency: "as-needed",
        note: "Awareness is the foundation. Logging the urge (not stopping it) builds the noticing muscle.",
      },
      {
        body: "I will use a competing response for 60 seconds when I notice an urge",
        domain: "BFRB Recovery",
        frequency: "as-needed",
        note: "A competing response is any action that makes the target behavior physically difficult. Clench fists, hold an object, sit on hands.",
      },
      {
        body: "I will apply lotion or barrier cream to high-risk areas before known trigger times",
        domain: "BFRB Recovery",
        frequency: "daily",
        note: "Stimulus control \u2014 change the environment to reduce the behavior\u2019s reinforcement.",
      },
      {
        body: "I will do a 5-minute RAIN check-in before bed",
        domain: "BFRB Recovery",
        frequency: "daily",
        note: "RAIN: Recognize, Allow, Investigate, Nurture. A self-compassion practice that reduces shame cycling.",
      },
    ],
  },
  {
    id: "meditation",
    name: "Meditation Practice",
    description: "Build a consistent contemplative practice.",
    templates: [
      {
        body: "I will sit for 5 minutes each morning before checking my phone",
        domain: "Contemplative Practice",
        frequency: "daily",
      },
      {
        body: "I will note three things I'm grateful for before bed",
        domain: "Contemplative Practice",
        frequency: "daily",
      },
      {
        body: "I will take three conscious breaths before each meal",
        domain: "Contemplative Practice",
        frequency: "daily",
      },
    ],
  },
  {
    id: "fitness",
    name: "Fitness Foundations",
    description: "Start or maintain a movement practice.",
    templates: [
      {
        body: "I will walk for 20 minutes after lunch on weekdays",
        domain: "Fitness",
        frequency: "weekdays",
      },
      {
        body: "I will do a 15-minute bodyweight routine 3 times per week",
        domain: "Fitness",
        frequency: "3x/week",
      },
      {
        body: "I will stretch for 10 minutes after each workout",
        domain: "Fitness",
        frequency: "3x/week",
        note: "Tied to workout days \u2014 this depends on doing the workout first.",
      },
    ],
  },
];
