"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studioModules, type StudioModule } from "@/lib/data/studio-curriculum";

const VERIFICATION_COLORS: Record<
  string,
  { color: string; bg: string }
> = {
  "self-report": { color: "#5b21b6", bg: "#f5f3ff" },
  audit: { color: "#1e40af", bg: "#eff6ff" },
  sensor: { color: "#1a5f4a", bg: "#ecfdf5" },
};

export default function ModuleContent({ mod }: { mod: StudioModule }) {
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  const prevModule = studioModules.find((m) => m.number === mod.number - 1);
  const nextModule = studioModules.find((m) => m.number === mod.number + 1);
  const verificationStyle = VERIFICATION_COLORS[mod.verification.method] ?? {
    color: "#6b7280",
    bg: "#f3f4f6",
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
        <Link href="/learn" style={{ color: "#1e40af", textDecoration: "none" }}>
          Learn
        </Link>
        {" > "}Module {mod.number}: {mod.shortTitle}
      </div>

      {/* Meta line */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          Module {mod.number} · {mod.time} min
        </span>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 4,
            background: verificationStyle.bg,
            color: verificationStyle.color,
            fontFamily: "IBM Plex Mono, monospace",
          }}
        >
          {mod.verification.method}
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "IBM Plex Serif, Georgia, serif",
          fontSize: 28,
          fontWeight: 600,
          color: "#1a1a2e",
          marginBottom: 8,
        }}
      >
        {mod.title}
      </h1>

      {/* Promise statement */}
      <p style={{ fontSize: 15, color: "#374151", fontStyle: "italic" }}>
        Promise: &ldquo;{mod.body}&rdquo;
      </p>

      {/* Dependencies */}
      {mod.depends_on.length > 0 && (
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
          Requires:{" "}
          {mod.depends_on
            .map((dep) => {
              const depModule = studioModules.find((m) => m.id === dep);
              return depModule
                ? `Module ${depModule.number} (${depModule.shortTitle})`
                : dep;
            })
            .join(", ")}
        </div>
      )}

      {/* Spacer after header */}
      <div style={{ marginBottom: 32 }} />

      {/* What You'll Do */}
      <section style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "IBM Plex Serif, Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          What You&apos;ll Do
        </h2>
        <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          {mod.learnerDoes.map((step, i) => (
            <li
              key={i}
              style={{ fontSize: 14, color: "#374151", marginBottom: 6 }}
            >
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Teaching Content */}
      {mod.teachingContent && (
        <section
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderLeft: "3px solid #1e40af",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "IBM Plex Serif, Georgia, serif",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            The Key Concept
          </h2>
          {mod.teachingContent.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: 13,
                color: "#4b5563",
                lineHeight: 1.7,
                marginBottom: 10,
              }}
            >
              {paragraph}
            </p>
          ))}
        </section>
      )}

      {/* Module 4 verification gap callout */}
      {mod.number === 4 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "16px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#78350f",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <strong>Look at this curriculum.</strong> Modules 1, 2, and 4 are
            self-report — you said you completed them, and we took your word for
            it. Module 3 is audit — the system confirmed you ran a simulation. We
            have stronger evidence for Module 3 than for any other module so far.
            That&apos;s a verification gap, and you just found it in the tool
            that&apos;s teaching you about verification gaps.
          </p>
        </div>
      )}

      {/* What You'll Learn */}
      <section style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "IBM Plex Serif, Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          What You&apos;ll Learn
        </h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          {mod.learnerLearns.map((item, i) => (
            <li
              key={i}
              style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Action Buttons */}
      {!completed && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setCompleted(true)}
            style={{
              background: "#1a1a2e",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              fontFamily: "IBM Plex Sans, system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Complete Module {mod.number} →
          </button>
          <button
            onClick={() => {
              if (nextModule) {
                router.push(`/learn/module/${nextModule.number}`);
              } else {
                router.push("/learn");
              }
            }}
            style={{
              background: "transparent",
              color: "#6b7280",
              padding: "12px 24px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontFamily: "IBM Plex Sans, system-ui, sans-serif",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        </div>
      )}

      {/* Completion Screen */}
      {completed && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            padding: "20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#1a5f4a",
              fontFamily: "IBM Plex Mono, monospace",
              marginBottom: 8,
            }}
          >
            ✓ Module {mod.number} verified ({mod.verification.method})
          </div>
          <blockquote
            style={{
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.7,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {mod.completionText}
          </blockquote>

          {nextModule && (
            <Link
              href={`/learn/module/${nextModule.number}`}
              style={{
                display: "inline-block",
                marginTop: 16,
                background: "#1a1a2e",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Next: Module {nextModule.number} — {nextModule.title} →
            </Link>
          )}

          {/* Module 5: two paths */}
          {mod.number === 5 && (
            <div style={{ marginTop: 12 }}>
              <Link
                href="/learn/module/8"
                style={{
                  display: "inline-block",
                  color: "#1e40af",
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                Or skip to Module 8: Share It →
              </Link>
              <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>
                (you can share before completing the advanced modules)
              </span>
            </div>
          )}

          {/* Module 8: full completion */}
          {mod.number === 8 && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <p
                style={{
                  fontSize: 16,
                  fontFamily: "IBM Plex Serif, Georgia, serif",
                  fontWeight: 600,
                  color: "#1a5f4a",
                }}
              >
                Welcome to Promise Pipeline.
              </p>
              <Link
                href="/services"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  background: "#1a5f4a",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Want your commitments mapped? →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Module Navigation Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #e5e7eb",
          paddingTop: 16,
          marginTop: 32,
        }}
      >
        {prevModule ? (
          <Link
            href={`/learn/module/${prevModule.number}`}
            style={{
              fontSize: 13,
              color: "#1e40af",
              textDecoration: "none",
            }}
          >
            ← Module {prevModule.number}: {prevModule.shortTitle}
          </Link>
        ) : (
          <Link
            href="/learn"
            style={{ fontSize: 13, color: "#1e40af", textDecoration: "none" }}
          >
            ← Back to Learn
          </Link>
        )}

        {nextModule && (
          <Link
            href={`/learn/module/${nextModule.number}`}
            style={{
              fontSize: 13,
              color: "#1e40af",
              textDecoration: "none",
            }}
          >
            Module {nextModule.number}: {nextModule.shortTitle} →
          </Link>
        )}
      </div>
    </div>
  );
}
