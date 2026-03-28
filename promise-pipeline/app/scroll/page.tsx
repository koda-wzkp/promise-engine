import type { Metadata } from "next";
import Link from "next/link";
import { UniversalScroller } from "@/components/hero/UniversalScroller";

export const metadata: Metadata = {
  title: "Promise — Promise Pipeline",
  description:
    "The concept of promise across 60+ languages and 20+ programming environments.",
  openGraph: {
    title: "Promise — Promise Pipeline",
    description:
      "The concept of promise across 60+ languages and 20+ programming environments.",
    url: "https://promise-engine.vercel.app/scroll",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function ScrollPage() {
  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh" }}>
      <UniversalScroller ambient={false} />

      {/* Caption strip */}
      <div
        style={{
          background: "#1a1a2e",
          borderTop: "1px solid rgba(162,180,255,0.12)",
          padding: "24px 16px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "0.68rem",
            color: "rgba(162,180,255,0.45)",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            margin: "0 0 12px",
          }}
        >
          The concept of promise — across 60+ languages and 20+ programming
          environments
        </p>
        <Link
          href="/"
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "0.68rem",
            color: "rgba(162,180,255,0.55)",
            letterSpacing: "0.06em",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          ← Promise Pipeline
        </Link>
      </div>
    </div>
  );
}
