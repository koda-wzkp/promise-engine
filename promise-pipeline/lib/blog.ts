import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  author: string | null;
  publishedAt: string | null;
  excerpt: string | null;
  vertical: string | null;
  body: string;
}

const CONTENT_DIR = path.resolve(process.cwd(), "../content");

/**
 * Extract metadata from a markdown file that lacks YAML frontmatter.
 * Parses the first heading as title, looks for author/date lines,
 * and uses the first paragraph as excerpt.
 */
function parseMarkdown(raw: string, filename: string): BlogPost {
  const lines = raw.split("\n");
  let title = "";
  let author: string | null = null;
  let publishedAt: string | null = null;
  let vertical: string | null = null;
  let excerpt: string | null = null;
  let bodyStartIndex = 0;

  // Extract title from first # heading
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^#\s+(.+)$/);
    if (match) {
      title = match[1];
      bodyStartIndex = i + 1;
      break;
    }
  }

  // Look for author/date/vertical in the lines following the title
  for (let i = bodyStartIndex; i < Math.min(bodyStartIndex + 10, lines.length); i++) {
    const line = lines[i].trim();

    // Match "**Author Name · Date**" or "**Author · Org · Type**"
    const authorMatch = line.match(
      /^\*\*(.+?)\*\*\s*$/
    );
    if (authorMatch && !author) {
      const parts = authorMatch[1].split("·").map((s) => s.trim());
      author = parts[0] || null;
      // Check for vertical hint
      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower === "case study" || lower === "civic" || lower === "ai") {
          vertical = lower;
        }
      }
    }

    // Match "By Author | Org" pattern
    const byMatch = line.match(/^\*\*By\s+(.+?)(?:\s*\|.*?)?\*\*$/);
    if (byMatch && !author) {
      author = byMatch[1].trim();
    }

    // Extract date from "Month YYYY" or "YYYY" patterns
    const dateMatch = line.match(
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/
    );
    if (dateMatch && !publishedAt) {
      const d = new Date(dateMatch[0] + " 01");
      if (!isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    }
  }

  // Extract excerpt: first non-empty, non-heading, non-metadata paragraph
  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      !line ||
      line.startsWith("#") ||
      line.startsWith("**") ||
      line.startsWith("*") ||
      line === "-----" ||
      line === "---"
    ) {
      continue;
    }
    // Found a content paragraph
    if (line.startsWith(">")) {
      excerpt = line.replace(/^>\s*/, "").slice(0, 200);
    } else {
      excerpt = line.slice(0, 200);
    }
    break;
  }

  const slug = filename.replace(/\.md$/, "");
  const body = lines.slice(bodyStartIndex).join("\n");

  return { slug, title, author, publishedAt, vertical, excerpt, body };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    return parseMarkdown(raw, file);
  });

  // Sort by publishedAt descending, posts without dates last
  posts.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return parseMarkdown(raw, `${slug}.md`);
}
