"use client";

import { useState, useEffect } from "react";
import { NestedPLogo, MODES } from "@/components/brand/NestedPLogo";

// ── Human languages ───────────────────────────────────────────────────────────

const HUMAN_LANGS = [
  { lang: "English", word: "promise" },
  { lang: "Spanish", word: "promesa" },
  { lang: "French", word: "promesse" },
  { lang: "German", word: "Versprechen" },
  { lang: "Italian", word: "promessa" },
  { lang: "Portuguese", word: "promessa" },
  { lang: "Russian", word: "обещание" },
  { lang: "Japanese", word: "約束" },
  { lang: "Mandarin", word: "承诺" },
  { lang: "Arabic", word: "وعد" },
  { lang: "Hindi", word: "वादा" },
  { lang: "Korean", word: "약속" },
  { lang: "Swedish", word: "löfte" },
  { lang: "Dutch", word: "belofte" },
  { lang: "Polish", word: "obietnica" },
  { lang: "Turkish", word: "söz" },
  { lang: "Greek", word: "υπόσχεση" },
  { lang: "Hebrew", word: "הבטחה" },
  { lang: "Finnish", word: "lupaus" },
  { lang: "Norwegian", word: "løfte" },
  { lang: "Danish", word: "løfte" },
  { lang: "Hungarian", word: "ígéret" },
  { lang: "Czech", word: "slib" },
  { lang: "Romanian", word: "promisiune" },
  { lang: "Ukrainian", word: "обіцянка" },
  { lang: "Persian", word: "قول" },
  { lang: "Swahili", word: "ahadi" },
  { lang: "Yoruba", word: "adehun" },
  { lang: "Amharic", word: "ቃልኪዳን" },
  { lang: "Thai", word: "สัญญา" },
  { lang: "Vietnamese", word: "lời hứa" },
  { lang: "Indonesian", word: "janji" },
  { lang: "Tagalog", word: "pangako" },
  { lang: "Bengali", word: "প্রতিশ্রুতি" },
  { lang: "Tamil", word: "வாக்குறுதி" },
  { lang: "Urdu", word: "وعدہ" },
  { lang: "Welsh", word: "addewid" },
  { lang: "Irish", word: "gealltanas" },
  { lang: "Icelandic", word: "loforð" },
  { lang: "Albanian", word: "premtim" },
  { lang: "Slovenian", word: "obljuba" },
  { lang: "Croatian", word: "obećanje" },
  { lang: "Bulgarian", word: "обещание" },
  { lang: "Latvian", word: "solījums" },
  { lang: "Lithuanian", word: "pažadas" },
  { lang: "Estonian", word: "lubadus" },
  { lang: "Georgian", word: "პირობა" },
  { lang: "Armenian", word: "խոստում" },
  { lang: "Kazakh", word: "уәде" },
  { lang: "Mongolian", word: "амлалт" },
  { lang: "Nepali", word: "वाचा" },
  { lang: "Khmer", word: "សន្យា" },
  { lang: "Burmese", word: "ကတိ" },
  { lang: "Hausa", word: "alƙawari" },
  { lang: "Zulu", word: "isithembiso" },
  { lang: "Afrikaans", word: "belofte" },
  { lang: "Maltese", word: "wegħda" },
  { lang: "Latin", word: "promissum" },
  { lang: "Sanskrit", word: "प्रतिज्ञा" },
  { lang: "Catalan", word: "promesa" },
  { lang: "Basque", word: "hitz" },
  { lang: "Scots Gaelic", word: "gealltainn" },
  { lang: "Malay", word: "janji" },
  { lang: "Sinhala", word: "පොරොන්දුව" },
  { lang: "Igbo", word: "nkwa" },
];

// ── Code language schemas ─────────────────────────────────────────────────────

const CODE_LANGS = [
  {
    lang: "JavaScript",
    code: `const promise = {\n  body: "deliver by Q4",\n  promiser: "team.dev",\n  promisee: "client.acme",\n  polarity: "+give"\n};`,
  },
  {
    lang: "TypeScript",
    code: `const p: PromiseRecord = {\n  body: "ship feature",\n  verification: "pull_request",\n  status: "declared"\n};`,
  },
  {
    lang: "Python",
    code: `promise = Promise(\n  body="reduce emissions 50%",\n  promiser="state.oregon",\n  deadline="2035-01-01"\n)`,
  },
  {
    lang: "Rust",
    code: `let promise = Promise {\n    body: "uptime 99.9%",\n    polarity: Polarity::Give,\n    scope: Scope::Continuous,\n};`,
  },
  {
    lang: "Go",
    code: `p := Promise{\n  Body:     "ship v2.0",\n  Promiser: "team.backend",\n  Deadline: "2024-12-31",\n}`,
  },
  {
    lang: "Haskell",
    code: `promise = Promise\n  { body = "maintain API"\n  , polarity = Give\n  , scope = Continuous\n  }`,
  },
  {
    lang: "SQL",
    code: `INSERT INTO promises\n  (body, promiser, promisee)\nVALUES\n  ('fund research',\n   'gov.nsf', 'univ.mit');`,
  },
  {
    lang: "JSON Schema",
    code: `{\n  "$schema": "promise/v1",\n  "body": "reduce waste 30%",\n  "promiser": "corp.walmart",\n  "deadline": "2030-01-01"\n}`,
  },
  {
    lang: "YAML",
    code: `promise:\n  body: achieve net zero\n  promiser: corp.apple\n  deadline: 2030-01-01\n  polarity: +give`,
  },
  {
    lang: "TOML",
    code: `[promise]\nbody = "open source core"\npromiser = "co.hashicorp"\npolarity = "+give"`,
  },
  {
    lang: "GraphQL",
    code: `mutation {\n  createPromise(input: {\n    body: "ship quarterly"\n    promiser: "team.product"\n  }) { id status }\n}`,
  },
  {
    lang: "Prolog",
    code: `promise(\n  team_alpha,\n  client_beta,\n  "deliver by Q4",\n  give, "2024-12-31"\n).`,
  },
  {
    lang: "Lisp",
    code: `(defpromise uptime\n  :body "99.9% availability"\n  :polarity :give\n  :scope :continuous)`,
  },
  {
    lang: "Clojure",
    code: `(def promise\n  {:body "ship feature"\n   :promiser :team/dev\n   :deadline "2024-12-31"})`,
  },
  {
    lang: "Swift",
    code: `let promise = Promise(\n  body: "privacy by design",\n  promiser: .apple,\n  scope: .continuous\n)`,
  },
  {
    lang: "Kotlin",
    code: `val promise = Promise(\n  body = "weekly updates",\n  promiser = "team.mobile",\n  polarity = Polarity.GIVE\n)`,
  },
  {
    lang: "Ruby",
    code: `promise = Promise.new(\n  body: "release v3",\n  promiser: "team.rails",\n  deadline: "2025-01-01"\n)`,
  },
  {
    lang: "C#",
    code: `var promise = new Promise {\n    Body = "ship on time",\n    Promiser = "team.dotnet",\n    Polarity = "+give"\n};`,
  },
  {
    lang: "Scala",
    code: `val promise = Promise(\n  body = "zero downtime",\n  promiser = Agent("ops"),\n  scope = Scope.Continuous\n)`,
  },
  {
    lang: "Solidity",
    code: `struct Promise {\n  string body;\n  address promiser;\n  uint256 deadline;\n  bool fulfilled;\n}`,
  },
  {
    lang: "R",
    code: `promise <- list(\n  body = "publish results",\n  promiser = "lab.stanford",\n  verify = "peer_review"\n)`,
  },
  {
    lang: "Julia",
    code: `promise = Promise(\n  body = "maintain package",\n  promiser = "Julia.community",\n  scope = :continuous\n)`,
  },
];

// ── CSS animations ────────────────────────────────────────────────────────────

const CSS = `
@keyframes pp-scroll-up {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}
@keyframes pp-scroll-down {
  from { transform: translateY(-50%); }
  to   { transform: translateY(0); }
}
.pp-scroll-up {
  animation: pp-scroll-up 90s linear infinite;
  will-change: transform;
}
.pp-scroll-down {
  animation: pp-scroll-down 75s linear infinite;
  will-change: transform;
}
.pp-column {
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: hidden;
  width: clamp(140px, 18vw, 240px);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
}
.pp-column-mobile {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
}
.pp-mode-label {
  transition: opacity 0.4s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pp-scroll-up,
  .pp-scroll-down {
    animation-play-state: paused;
  }
}
@media (max-width: 640px) {
  .pp-column {
    display: none;
  }
  .pp-column-mobile {
    display: block;
  }
}
`;

// ── Component ─────────────────────────────────────────────────────────────────

interface UniversalScrollerProps {
  /**
   * When true: ambient hero mode — columns at very low opacity (0.17),
   * no center logo (the hero overlay provides its own content).
   * When false: full standalone mode — columns more visible + cycling logo.
   */
  ambient?: boolean;
}

export function UniversalScroller({ ambient = false }: UniversalScrollerProps) {
  const [modeIndex, setModeIndex] = useState(0);
  const [labelVisible, setLabelVisible] = useState(true);

  useEffect(() => {
    if (ambient) return;
    let timeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setLabelVisible(false);
      timeout = setTimeout(() => {
        setModeIndex((i) => (i + 1) % MODES.length);
        setLabelVisible(true);
      }, 400);
    }, 6000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [ambient]);

  const mode = MODES[modeIndex];
  const colOpacity = ambient ? 0.17 : 0.55;

  // Duplicate for seamless infinite loop
  const leftItems = [...HUMAN_LANGS, ...HUMAN_LANGS];
  const rightItems = [...CODE_LANGS, ...CODE_LANGS];

  // Mobile: interleave languages and code, then duplicate for seamless loop
  const mobileItems: Array<{ type: "lang"; lang: string; word: string } | { type: "code"; lang: string; code: string }> = [];
  const maxLen = Math.max(HUMAN_LANGS.length, CODE_LANGS.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < HUMAN_LANGS.length) mobileItems.push({ type: "lang", ...HUMAN_LANGS[i] });
    if (i < CODE_LANGS.length) mobileItems.push({ type: "code", ...CODE_LANGS[i] });
  }
  const mobileLoop = [...mobileItems, ...mobileItems];

  return (
    <div
      style={{
        background: "#1a1a2e",
        position: "relative",
        overflow: "hidden",
        height: "100vh",
      }}
      aria-hidden={ambient ? "true" : undefined}
    >
      <style>{CSS}</style>

      {/* Left column — human languages, scroll up */}
      <div
        className="pp-column"
        style={{ left: 0, textAlign: "right", opacity: colOpacity }}
      >
        <div className="pp-scroll-up">
          {leftItems.map((item, i) => (
            <div key={i} style={{ padding: "10px 20px 10px 8px" }}>
              <p
                style={{
                  fontFamily: "IBM Plex Serif, serif",
                  fontWeight: 300,
                  fontSize: "clamp(1.4rem, 2vw, 2.5rem)",
                  color: "rgba(255,255,255,0.92)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {item.word}
              </p>
              <p
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.28)",
                  margin: "2px 0 0",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                {item.lang}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right column — code schemas, scroll down */}
      <div
        className="pp-column"
        style={{ right: 0, opacity: colOpacity }}
      >
        <div className="pp-scroll-down">
          {rightItems.map((item, i) => (
            <div key={i} style={{ padding: "12px 8px 12px 16px" }}>
              <p
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.58rem",
                  color: "rgba(162,180,255,0.45)",
                  margin: "0 0 4px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                {item.lang}
              </p>
              <pre
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "clamp(0.6rem, 0.7vw, 0.78rem)",
                  color: "rgba(200,215,255,0.72)",
                  margin: 0,
                  whiteSpace: "pre",
                  lineHeight: 1.5,
                  overflowX: "hidden",
                }}
              >
                {item.code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile single column — alternating languages & code, scroll up */}
      <div
        className="pp-column-mobile"
        style={{ opacity: ambient ? 0.10 : 0.35 }}
      >
        <div className="pp-scroll-up" style={{ textAlign: "center" }}>
          {mobileLoop.map((item, i) =>
            item.type === "lang" ? (
              <div key={`m-${i}`} style={{ padding: "10px 24px" }}>
                <p
                  style={{
                    fontFamily: "IBM Plex Serif, serif",
                    fontWeight: 300,
                    fontSize: "1.6rem",
                    color: "rgba(255,255,255,0.92)",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {item.word}
                </p>
                <p
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.55rem",
                    color: "rgba(255,255,255,0.28)",
                    margin: "2px 0 0",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.lang}
                </p>
              </div>
            ) : (
              <div key={`m-${i}`} style={{ padding: "10px 24px" }}>
                <p
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.55rem",
                    color: "rgba(162,180,255,0.45)",
                    margin: "0 0 4px",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.lang}
                </p>
                <pre
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.62rem",
                    color: "rgba(200,215,255,0.72)",
                    margin: 0,
                    whiteSpace: "pre",
                    lineHeight: 1.5,
                    overflowX: "hidden",
                    textAlign: "left",
                    display: "inline-block",
                  }}
                >
                  {item.code}
                </pre>
              </div>
            )
          )}
        </div>
      </div>

      {/* Center — cycling logo + mode info, standalone only */}
      {!ambient && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <NestedPLogo mode={mode.id} size={120} className="mx-auto" />
          <div
            className="pp-mode-label"
            style={{
              opacity: labelVisible ? 1 : 0,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            <p
              style={{
                fontFamily: "IBM Plex Serif, serif",
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.88)",
                margin: "0 0 6px",
              }}
            >
              {mode.name}
            </p>
            <p
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.68rem",
                color: "rgba(162,180,255,0.60)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {mode.concept}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
