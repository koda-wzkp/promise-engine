import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.local from promise-pipeline root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// --- Helpers ---

function genKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

// --- Markdown to Portable Text ---

interface MarkDef {
  _key: string;
  _type: string;
  href?: string;
}

interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

function parseInlineMarks(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];

  // Process inline markdown: **bold**, *italic*, `code`, [links](url)
  // Use a regex-based state machine to handle nested marks
  let remaining = text;
  let currentMarks: string[] = [];

  const pushSpan = (t: string, marks: string[]) => {
    if (t) {
      children.push({
        _type: "span",
        _key: genKey(),
        text: t,
        marks: [...marks],
      });
    }
  };

  // Simple approach: process patterns left to right
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(remaining)) !== null) {
    // Push text before this match
    if (match.index > lastIndex) {
      pushSpan(remaining.slice(lastIndex, match.index), currentMarks);
    }

    if (match[2]) {
      // **bold**
      pushSpan(match[2], [...currentMarks, "strong"]);
    } else if (match[3]) {
      // *italic*
      pushSpan(match[3], [...currentMarks, "em"]);
    } else if (match[4]) {
      // `code`
      pushSpan(match[4], [...currentMarks, "code"]);
    } else if (match[5] && match[6]) {
      // [text](url)
      const linkKey = genKey();
      markDefs.push({ _key: linkKey, _type: "link", href: match[6] });
      pushSpan(match[5], [...currentMarks, linkKey]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < remaining.length) {
    pushSpan(remaining.slice(lastIndex), currentMarks);
  }

  // If nothing was parsed, return the whole text as a single span
  if (children.length === 0) {
    pushSpan(text, []);
  }

  return { children, markDefs };
}

function markdownToPortableText(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Skip horizontal rules
    if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) {
      i++;
      continue;
    }

    // Skip image/figure placeholders
    if (line.trim().startsWith("*[Figure") || line.trim().startsWith("![")) {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const style = level === 1 ? "h2" : level === 2 ? "h2" : level === 3 ? "h3" : "h4";
      const { children, markDefs } = parseInlineMarks(headingMatch[2]);
      blocks.push({
        _type: "block",
        _key: genKey(),
        style,
        children,
        markDefs,
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      // Collect consecutive blockquote lines
      let quoteText = "";
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteText += (quoteText ? " " : "") + lines[i].replace(/^>\s*/, "");
        i++;
      }
      const { children, markDefs } = parseInlineMarks(quoteText);
      blocks.push({
        _type: "block",
        _key: genKey(),
        style: "blockquote",
        children,
        markDefs,
      });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, "");
        const { children, markDefs } = parseInlineMarks(itemText);
        blocks.push({
          _type: "block",
          _key: genKey(),
          style: "normal",
          listItem: "number",
          level: 1,
          children,
          markDefs,
        });
        i++;
      }
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line.trim()) || /^•\s/.test(line.trim())) {
      while (
        i < lines.length &&
        (/^[-*]\s/.test(lines[i].trim()) || /^•\s/.test(lines[i].trim()))
      ) {
        const itemText = lines[i].trim().replace(/^[-*•]\s+/, "");
        const { children, markDefs } = parseInlineMarks(itemText);
        blocks.push({
          _type: "block",
          _key: genKey(),
          style: "normal",
          listItem: "bullet",
          level: 1,
          children,
          markDefs,
        });
        i++;
      }
      continue;
    }

    // Normal paragraph — collect lines until blank line or special line
    let paraText = "";
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^-{3,}$/.test(lines[i].trim()) &&
      !/^\*{3,}$/.test(lines[i].trim()) &&
      !lines[i].startsWith(">") &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^[-*]\s/.test(lines[i].trim())
    ) {
      paraText += (paraText ? " " : "") + lines[i].trim();
      i++;
    }

    if (paraText) {
      const { children, markDefs } = parseInlineMarks(paraText);
      blocks.push({
        _type: "block",
        _key: genKey(),
        style: "normal",
        children,
        markDefs,
      });
    }
  }

  return blocks;
}

// --- Content file metadata ---

interface ContentMeta {
  file: string;
  id: string;
  title: string;
  excerpt: string;
  vertical: string;
  categories: string[];
  publishedAt: string;
  relatedPromises: string[];
}

const contentFiles: ContentMeta[] = [
  {
    file: "welcome.md",
    id: "post-welcome",
    title: "Welcome to the Promise Pipeline Blog",
    excerpt:
      "Dashboards show you what's broken. Promise graphs show you what breaks next and why. The simulation engine lets you ask 'what if' before anything breaks at all.",
    vertical: "general",
    categories: ["category-engineering"],
    publishedAt: "2026-03-01T12:00:00Z",
    relatedPromises: [],
  },
  {
    file: "trust-primitive.md",
    id: "post-trust-primitive",
    title: "The Trust Primitive: What It Means for Commitments to Nest, Compose, and Scale",
    excerpt:
      "Every institution runs on promises. Promise Pipeline treats the promise as a trust primitive — a basic building block that nests, composes, and scales.",
    vertical: "general",
    categories: ["category-promise-theory"],
    publishedAt: "2026-03-04T12:00:00Z",
    relatedPromises: ["P001"],
  },
  {
    file: "entropy-problem.md",
    id: "post-entropy-problem",
    title: "Your Promise Network Has an Entropy Problem",
    excerpt:
      "Two networks can have the same health score but completely different epistemic situations. Network entropy tells you how much you should trust the assessment.",
    vertical: "general",
    categories: ["category-promise-theory", "category-engineering"],
    publishedAt: "2026-03-06T12:00:00Z",
    relatedPromises: [],
  },
  {
    file: "agents-break-promises.md",
    id: "post-agents-break-promises",
    title: "When Agents Break Promises Nobody Made",
    excerpt:
      "Truffle Security found Claude agents autonomously exploiting SQL injection to complete research tasks. Five implicit promises, zero verification. A Promise Theory analysis.",
    vertical: "ai",
    categories: ["category-case-study", "category-promise-theory"],
    publishedAt: "2026-03-08T12:00:00Z",
    relatedPromises: ["P-SAFETY-001", "P-BOUND-002", "P-VERIFY-003"],
  },
  {
    file: "aca-hb2021-analysis.md",
    id: "post-aca-hb2021",
    title: "Did They Keep Their Promises? The ACA and Oregon HB 2021",
    excerpt:
      "Two laws, two scales, one framework. We applied Promise Pipeline to the Affordable Care Act and Oregon HB 2021 — both are experiencing active cascades right now.",
    vertical: "civic",
    categories: ["category-case-study", "category-civic"],
    publishedAt: "2026-03-10T12:00:00Z",
    relatedPromises: ["P-ACA-001", "HB2021-001"],
  },
  {
    file: "jcpoa-promise-network.md",
    id: "post-jcpoa",
    title: "The JCPOA Promise Network: When Verification Is a Promise That Can Break",
    excerpt:
      "22 promises. 11 agents. 8 domains. The most precisely specified multinational promise network in modern diplomatic history — and what happened when the cascade source was pulled.",
    vertical: "general",
    categories: ["category-case-study", "category-promise-theory"],
    publishedAt: "2026-03-12T12:00:00Z",
    relatedPromises: ["JCPOA-001", "JCPOA-011"],
  },
  {
    file: "anakin-cascade-v2.md",
    id: "post-anakin-cascade",
    title: "The Anakin Cascade: A Promise Theory Analysis of the Fall of the Galactic Republic",
    excerpt:
      "The Star Wars prequel trilogy is, structurally, a cascade failure across a promise network. 13 promises, 9 agents, network health score 12/100.",
    vertical: "general",
    categories: ["category-case-study", "category-promise-theory"],
    publishedAt: "2026-03-14T12:00:00Z",
    relatedPromises: [],
  },
];

// --- Seed Data (authors, categories) ---

const authors = [
  {
    _id: "author-conor",
    _type: "author",
    name: "Conor Nolan-Finkel",
    slug: { _type: "slug", current: "conor-nolan-finkel" },
    bio: "Creator of Promise Pipeline. Applies Promise Theory to civic accountability, AI safety, and organizational health.",
  },
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

// --- Build posts from markdown files ---

function buildPostsFromMarkdown(): any[] {
  const contentDir = path.resolve(__dirname, "../../content");
  const posts: any[] = [];

  for (const meta of contentFiles) {
    const filePath = path.join(contentDir, meta.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ! File not found: ${meta.file}, skipping`);
      continue;
    }

    const markdown = fs.readFileSync(filePath, "utf-8");
    const body = markdownToPortableText(markdown);

    posts.push({
      _id: meta.id,
      _type: "post",
      title: meta.title,
      slug: { _type: "slug", current: slugify(meta.title) },
      author: { _type: "reference", _ref: "author-conor" },
      publishedAt: meta.publishedAt,
      excerpt: meta.excerpt,
      vertical: meta.vertical,
      categories: meta.categories.map((catId, i) => ({
        _type: "reference",
        _ref: catId,
        _key: `cat${i}`,
      })),
      relatedPromises: meta.relatedPromises,
      body,
    });
  }

  return posts;
}

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

  if (!process.env.SANITY_API_TOKEN) {
    console.error("Error: SANITY_API_TOKEN is required in .env.local");
    console.error("Get a token at: https://www.sanity.io/manage/project/cwvex1ty/api#tokens");
    process.exit(1);
  }

  const posts = buildPostsFromMarkdown();
  console.log(`Found ${posts.length} markdown articles to import.\n`);

  let total = 0;
  total += await importDocuments("Author", authors);
  total += await importDocuments("Category", categories);
  total += await importDocuments("Post", posts);

  console.log(`\nDone! Imported ${total} documents.\n`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
