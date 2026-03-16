"use client";

import Link from "next/link";

/**
 * Renders raw markdown as styled HTML for blog posts loaded from local files.
 * Handles headings, bold, italic, code, links, lists, blockquotes, and hr.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function processInline(text: string): string {
  let result = escapeHtml(text);
  // Links: [text](url)
  result = result.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Inline code: `text`
  result = result.replace(
    /`(.+?)`/g,
    '<code class="bg-gray-100 text-sm px-1.5 py-0.5 rounded font-mono">$1</code>'
  );
  return result;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule
    if (trimmed === "-----" || trimmed === "---" || trimmed === "***") {
      elements.push(
        <hr key={key++} className="my-8 border-gray-200" />
      );
      i++;
      continue;
    }

    // Code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={key++}
          className="bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto"
        >
          {lang && (
            <div className="text-xs text-gray-400 mb-2">{lang}</div>
          )}
          <code className="text-sm font-mono">{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = `h${Math.min(level + 1, 4)}` as keyof JSX.IntrinsicElements;
      const classes =
        level <= 2
          ? "font-serif text-2xl font-bold text-gray-900 mt-8 mb-3"
          : level === 3
          ? "font-serif text-xl font-semibold text-gray-900 mt-6 mb-2"
          : "font-serif text-lg font-semibold text-gray-800 mt-4 mb-2";
      elements.push(
        <Tag
          key={key++}
          className={classes}
          dangerouslySetInnerHTML={{ __html: processInline(text) }}
        />
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={key++}
          className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
          dangerouslySetInnerHTML={{
            __html: processInline(quoteLines.join(" ")),
          }}
        />
      );
      continue;
    }

    // Unordered list
    if (trimmed.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
          {items.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{ __html: processInline(item) }}
            />
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (trimmed.match(/^\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol
          key={key++}
          className="list-decimal pl-6 mb-4 space-y-1 text-gray-700"
        >
          {items.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{ __html: processInline(item) }}
            />
          ))}
        </ol>
      );
      continue;
    }

    // Figure/image descriptions in brackets (from the content's placeholder figures)
    if (trimmed.startsWith("*[") && trimmed.endsWith("]*")) {
      elements.push(
        <div
          key={key++}
          className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 italic"
        >
          {trimmed.slice(2, -2)}
        </div>
      );
      i++;
      continue;
    }

    // Normal paragraph — collect contiguous lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("> ") &&
      !lines[i].trim().match(/^[-*]\s+/) &&
      !lines[i].trim().match(/^\d+\.\s+/) &&
      lines[i].trim() !== "-----" &&
      lines[i].trim() !== "---"
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p
          key={key++}
          className="text-gray-700 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: processInline(paraLines.join(" ")),
          }}
        />
      );
    }
  }

  return <>{elements}</>;
}
