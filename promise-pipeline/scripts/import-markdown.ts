import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

/**
 * Import markdown files as Sanity blog posts.
 *
 * Usage:
 *   npx tsx scripts/import-markdown.ts [directory]
 *
 * Default directory: ../studio/posts/
 *
 * Each .md file should have YAML frontmatter:
 * ---
 * title: "Post Title"
 * slug: post-slug
 * excerpt: "Short description"
 * publishedAt: 2026-03-10
 * vertical: civic | ai | infrastructure | supply-chain | teams | general
 * author: Author Name
 * categories:
 *   - Promise Theory
 *   - Case Study
 * relatedPromises:
 *   - P001
 *   - HB2021-001
 * ---
 *
 * Markdown body follows the frontmatter.
 *
 * Requires SANITY_API_TOKEN in .env.local (create one at sanity.io/manage)
 */

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cwvex1ty";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error(
    "Missing SANITY_API_TOKEN in .env.local\n" +
      "Create a token at: https://www.sanity.io/manage/project/" +
      projectId +
      "/api#tokens"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// --- Frontmatter parser ---

interface Frontmatter {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  vertical?: string;
  author?: string;
  categories?: string[];
  relatedPromises?: string[];
}

function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error("No frontmatter found. Files must start with ---");
  }

  const yamlStr = match[1];
  const body = match[2];

  const fm: Record<string, any> = {};
  let currentKey = "";
  let inArray = false;

  for (const line of yamlStr.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Array item
    if (trimmed.startsWith("- ") && inArray && currentKey) {
      if (!fm[currentKey]) fm[currentKey] = [];
      fm[currentKey].push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    // Key-value pair
    const kvMatch = trimmed.match(/^(\w+):\s*(.*)?$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2]?.trim();
      if (!value) {
        // Might be array start
        inArray = true;
        fm[currentKey] = [];
      } else {
        inArray = false;
        fm[currentKey] = value.replace(/^["']|["']$/g, "");
      }
    }
  }

  if (!fm.title) throw new Error("Frontmatter must include 'title'");
  if (!fm.slug) {
    fm.slug = fm.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return { frontmatter: fm as Frontmatter, body };
}

// --- Markdown to Portable Text ---

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function parseInlineMarks(
  text: string
): { spans: any[]; markDefs: any[] } {
  const spans: any[] = [];
  const markDefs: any[] = [];
  let remaining = text;

  // Process inline marks: **bold**, *italic*, `code`, [link](url)
  const regex =
    /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(remaining)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: remaining.slice(lastIndex, match.index),
        marks: [],
      });
    }

    if (match[2]) {
      // **bold**
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[2],
        marks: ["strong"],
      });
    } else if (match[3]) {
      // *italic*
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[3],
        marks: ["em"],
      });
    } else if (match[4]) {
      // `code`
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[4],
        marks: ["code"],
      });
    } else if (match[5] && match[6]) {
      // [text](url)
      const linkKey = generateKey();
      markDefs.push({
        _type: "link",
        _key: linkKey,
        href: match[6],
      });
      spans.push({
        _type: "span",
        _key: generateKey(),
        text: match[5],
        marks: [linkKey],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < remaining.length) {
    spans.push({
      _type: "span",
      _key: generateKey(),
      text: remaining.slice(lastIndex),
      marks: [],
    });
  }

  // If no spans were created, use the full text
  if (spans.length === 0) {
    spans.push({
      _type: "span",
      _key: generateKey(),
      text,
      marks: [],
    });
  }

  return { spans, markDefs };
}

function markdownToPortableText(md: string): any[] {
  const blocks: any[] = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        _type: "code",
        _key: generateKey(),
        language: lang || "text",
        code: codeLines.join("\n"),
      });
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const style =
        level === 1 ? "h2" : level === 2 ? "h2" : level === 3 ? "h3" : "h4";
      const { spans, markDefs } = parseInlineMarks(headingMatch[2]);
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style,
        children: spans,
        markDefs,
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      const text = quoteLines.join(" ");
      const { spans, markDefs } = parseInlineMarks(text);
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style: "blockquote",
        children: spans,
        markDefs,
      });
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*]\s+/)) {
      const listItems: any[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, "");
        const { spans, markDefs } = parseInlineMarks(itemText);
        listItems.push({
          _type: "block",
          _key: generateKey(),
          style: "normal",
          listItem: "bullet",
          level: 1,
          children: spans,
          markDefs,
        });
        i++;
      }
      blocks.push(...listItems);
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const listItems: any[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, "");
        const { spans, markDefs } = parseInlineMarks(itemText);
        listItems.push({
          _type: "block",
          _key: generateKey(),
          style: "normal",
          listItem: "number",
          level: 1,
          children: spans,
          markDefs,
        });
        i++;
      }
      blocks.push(...listItems);
      continue;
    }

    // Normal paragraph — collect contiguous non-empty lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("> ") &&
      !lines[i].match(/^\s*[-*]\s+/) &&
      !lines[i].match(/^\s*\d+\.\s+/)
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      const text = paraLines.join(" ");
      const { spans, markDefs } = parseInlineMarks(text);
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style: "normal",
        children: spans,
        markDefs,
      });
    }
  }

  return blocks;
}

// --- Ensure author and categories exist ---

async function ensureAuthor(name: string): Promise<string> {
  const id = `author-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  await client.createIfNotExists({
    _id: id,
    _type: "author",
    name,
    slug: { _type: "slug", current: slug },
  });

  return id;
}

async function ensureCategory(title: string): Promise<string> {
  const id = `category-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  await client.createIfNotExists({
    _id: id,
    _type: "category",
    title,
  });

  return id;
}

// --- Main import ---

async function importFile(filePath: string): Promise<boolean> {
  const content = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);

  console.log(`  Processing: ${frontmatter.title}`);

  const portableText = markdownToPortableText(body);
  const postId = `post-${frontmatter.slug}`;

  // Ensure author exists
  let authorRef: any = undefined;
  if (frontmatter.author) {
    const authorId = await ensureAuthor(frontmatter.author);
    authorRef = { _type: "reference", _ref: authorId };
  }

  // Ensure categories exist
  let categoryRefs: any[] = [];
  if (frontmatter.categories) {
    for (const cat of frontmatter.categories) {
      const catId = await ensureCategory(cat);
      categoryRefs.push({
        _type: "reference",
        _ref: catId,
        _key: generateKey(),
      });
    }
  }

  const doc: Record<string, any> = {
    _id: postId,
    _type: "post",
    title: frontmatter.title,
    slug: { _type: "slug", current: frontmatter.slug },
    body: portableText,
  };

  if (frontmatter.excerpt) doc.excerpt = frontmatter.excerpt;
  if (frontmatter.publishedAt)
    doc.publishedAt = new Date(frontmatter.publishedAt).toISOString();
  if (frontmatter.vertical) doc.vertical = frontmatter.vertical;
  if (authorRef) doc.author = authorRef;
  if (categoryRefs.length > 0) doc.categories = categoryRefs;
  if (frontmatter.relatedPromises)
    doc.relatedPromises = frontmatter.relatedPromises;

  try {
    await client.createOrReplace(doc);
    console.log(`  + Imported: ${frontmatter.title}`);
    return true;
  } catch (err: any) {
    console.error(`  ! Failed: ${frontmatter.title} — ${err.message}`);
    return false;
  }
}

async function main() {
  const dir = process.argv[2] || path.resolve(__dirname, "../../studio/posts");

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    console.error(
      `\nCreate markdown files in studio/posts/ with frontmatter, then run again.`
    );
    console.error(`Or specify a directory: npx tsx scripts/import-markdown.ts /path/to/posts`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f));

  if (files.length === 0) {
    console.error(`No .md files found in ${dir}`);
    process.exit(1);
  }

  console.log(`\nImporting ${files.length} markdown files to Sanity...`);
  console.log(`Project: ${projectId}`);
  console.log(`Dataset: ${dataset}\n`);

  let success = 0;
  for (const file of files) {
    const ok = await importFile(file);
    if (ok) success++;
  }

  console.log(`\nDone! Imported ${success}/${files.length} posts.\n`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
