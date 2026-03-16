import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import path from "path";

// Load .env.local from promise-pipeline root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// --- Seed Data ---

const authors = [
  {
    _id: "author-promise-team",
    _type: "author",
    name: "Promise Engine Team",
    slug: { _type: "slug", current: "promise-engine-team" },
    bio: "The team behind Promise Engine — universal auditing infrastructure built on Promise Theory.",
  },
];

const categories = [
  {
    _id: "category-promise-theory",
    _type: "category",
    title: "Promise Theory",
    description:
      "Foundations and applications of Promise Theory to real-world accountability.",
  },
  {
    _id: "category-case-study",
    _type: "category",
    title: "Case Study",
    description: "Deep dives into real promise tracking across verticals.",
  },
  {
    _id: "category-engineering",
    _type: "category",
    title: "Engineering",
    description: "Technical updates, architecture decisions, and changelog.",
  },
  {
    _id: "category-civic",
    _type: "category",
    title: "Civic",
    description: "Promise tracking in government and public policy.",
  },
];

// Helper to create portable text blocks
function textBlock(text: string, style = "normal"): any {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style,
    children: [
      {
        _type: "span",
        _key: Math.random().toString(36).slice(2, 10),
        text,
        marks: [],
      },
    ],
    markDefs: [],
  };
}

const posts = [
  {
    _id: "post-what-is-promise-theory",
    _type: "post",
    title: "What is Promise Theory?",
    slug: { _type: "slug", current: "what-is-promise-theory" },
    author: { _type: "reference", _ref: "author-promise-team" },
    publishedAt: "2026-03-10T12:00:00Z",
    excerpt:
      "Promise Theory gives us a rigorous framework for understanding commitments — from AI systems to legislation. Here's why it matters for accountability.",
    vertical: "general",
    categories: [
      { _type: "reference", _ref: "category-promise-theory", _key: "pt1" },
    ],
    relatedPromises: ["P001"],
    body: [
      textBlock("What is Promise Theory?", "h2"),
      textBlock(
        "Promise Theory, originally developed by Mark Burgess, models autonomous agents that make voluntary commitments. Unlike obligation-based frameworks that impose top-down rules, Promise Theory starts from what each agent can actually deliver."
      ),
      textBlock(
        "This distinction matters enormously when we try to hold AI systems, businesses, or governments accountable. You can't audit an obligation — you can only audit a promise."
      ),
      textBlock("Why Promises Beat Obligations", "h3"),
      textBlock(
        "An obligation says 'you must do X.' A promise says 'I will do X.' The difference is agency. Promises are made by the agent that will keep them, which means they carry real information about capability and intent."
      ),
      textBlock(
        "When a promise is broken, that's not just an error — it's a training signal. It tells us something about the gap between stated capability and actual performance."
      ),
      textBlock("Promises as Training Data", "h3"),
      textBlock(
        "Every promise verification generates a labeled data point: KEPT, BROKEN, PENDING, BLOCKED, or RENEGOTIATED. This is the foundation of Promise Engine — turning accountability into structured, machine-readable data."
      ),
    ],
  },
  {
    _id: "post-oregon-hb-2021",
    _type: "post",
    title: "Oregon HB 2021: 20 Promises, 5 Years Later",
    slug: { _type: "slug", current: "oregon-hb-2021-five-years" },
    author: { _type: "reference", _ref: "author-promise-team" },
    publishedAt: "2026-03-12T12:00:00Z",
    excerpt:
      "Oregon's landmark clean energy bill made 20 distinct promises. We tracked every one. Here's what we found.",
    vertical: "civic",
    categories: [
      { _type: "reference", _ref: "category-case-study", _key: "cs1" },
      { _type: "reference", _ref: "category-civic", _key: "cv1" },
    ],
    relatedPromises: ["HB2021-001", "HB2021-002", "HB2021-003"],
    body: [
      textBlock("Oregon HB 2021: 20 Promises, 5 Years Later", "h2"),
      textBlock(
        "In 2021, Oregon passed House Bill 2021, one of the most ambitious clean energy laws in the United States. It promised 100% clean electricity by 2040, with intermediate targets along the way."
      ),
      textBlock(
        "We used Promise Engine to decompose HB 2021 into 20 discrete, verifiable promises — and tracked each one against public data."
      ),
      textBlock("The Methodology", "h3"),
      textBlock(
        "Each section of the bill was analyzed for concrete commitments. Aspirational language was separated from binding promises. Each promise was assigned a schema, verification rules, and data sources."
      ),
      textBlock("Key Findings", "h3"),
      textBlock(
        "Of the 20 promises extracted, 12 are currently KEPT, 3 are BROKEN, 2 are BLOCKED, and 3 remain PENDING their target dates. The broken promises cluster around environmental justice provisions — the hardest commitments to verify and the easiest to deprioritize."
      ),
      textBlock(
        "This pattern — structural promises kept, equity promises broken — appears across civic verticals and deserves its own analysis."
      ),
    ],
  },
  {
    _id: "post-simulation-engine",
    _type: "post",
    title: "Why We Built a Simulation Engine for Promises",
    slug: { _type: "slug", current: "why-simulation-engine" },
    author: { _type: "reference", _ref: "author-promise-team" },
    publishedAt: "2026-03-14T12:00:00Z",
    excerpt:
      "Promises don't exist in isolation — they interact, conflict, and cascade. Simulation lets us see the second-order effects before they happen.",
    vertical: "ai",
    categories: [
      { _type: "reference", _ref: "category-engineering", _key: "en1" },
    ],
    relatedPromises: ["AI-001", "AI-002"],
    body: [
      textBlock("Why We Built a Simulation Engine for Promises", "h2"),
      textBlock(
        "When you track promises at scale, patterns emerge. Some promises reinforce each other. Others conflict. And some create cascading failures when broken."
      ),
      textBlock(
        "We built a simulation engine to model these interactions before they play out in the real world."
      ),
      textBlock("Promise Graphs", "h3"),
      textBlock(
        "Each promise connects to others through dependency, conflict, or reinforcement edges. An AI system promising 'fast responses' and 'thorough analysis' creates a tension that the simulation can surface before deployment."
      ),
      textBlock("Monte Carlo Promise Verification", "h3"),
      textBlock(
        "By running thousands of scenarios with varying conditions, we can estimate the probability that a promise will be kept under different circumstances. This transforms accountability from binary pass/fail into a probabilistic integrity score."
      ),
    ],
  },
  {
    _id: "post-v2-changelog",
    _type: "post",
    title: "Promise Pipeline Changelog: v2 Launch",
    slug: { _type: "slug", current: "v2-changelog" },
    author: { _type: "reference", _ref: "author-promise-team" },
    publishedAt: "2026-03-16T12:00:00Z",
    excerpt:
      "Promise Pipeline v2 is live — with Sanity CMS, vertical-specific dashboards, and a new integrity visualization engine.",
    vertical: "general",
    categories: [
      { _type: "reference", _ref: "category-engineering", _key: "en2" },
    ],
    relatedPromises: [],
    body: [
      textBlock("Promise Pipeline v2 Launch", "h2"),
      textBlock(
        "Today we're launching Promise Pipeline v2 — a major upgrade to our public-facing infrastructure for promise tracking and accountability."
      ),
      textBlock("What's New", "h3"),
      textBlock(
        "Sanity CMS integration for blog and case study content. Vertical-specific dashboards showing promise integrity across civic, AI, infrastructure, and supply chain domains. A new visualization engine for integrity scores over time."
      ),
      textBlock("What's Next", "h3"),
      textBlock(
        "Public API access for promise verification. Embeddable integrity badges. And a community-driven promise schema registry so anyone can define accountability standards for their domain."
      ),
    ],
  },
];

const caseStudies = [
  {
    _id: "case-study-hb2021",
    _type: "caseStudy",
    title: "Oregon HB 2021 Clean Energy Accountability",
    slug: { _type: "slug", current: "oregon-hb-2021" },
    vertical: "civic",
    promiseCount: 20,
    agentCount: 5,
    domainCount: 3,
    keyFinding:
      "Structural promises (grid targets, timelines) are largely kept. Equity and environmental justice promises show the highest breakage rate — suggesting accountability gaps in harder-to-measure commitments.",
    publishedAt: "2026-03-12T12:00:00Z",
    body: [
      textBlock("Oregon HB 2021: Full Case Study", "h2"),
      textBlock(
        "This case study tracks 20 promises extracted from Oregon's House Bill 2021, covering clean energy targets, environmental justice provisions, and utility compliance requirements."
      ),
    ],
  },
];

// --- Import Logic ---

async function importDocuments(
  label: string,
  docs: any[]
): Promise<number> {
  let count = 0;
  for (const doc of docs) {
    try {
      await client.createOrReplace(doc);
      console.log(`  + ${label}: ${doc.title || doc.name || doc._id}`);
      count++;
    } catch (err: any) {
      console.error(
        `  ! Failed ${label}: ${doc._id} — ${err.message}`
      );
    }
  }
  return count;
}

async function main() {
  console.log(`\nImporting content to Sanity...`);
  console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}\n`);

  let total = 0;
  total += await importDocuments("Author", authors);
  total += await importDocuments("Category", categories);
  total += await importDocuments("Post", posts);
  total += await importDocuments("Case Study", caseStudies);

  console.log(`\nDone! Imported ${total} documents.\n`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
