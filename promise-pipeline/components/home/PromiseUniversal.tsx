"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LangEntry {
  word: string;
  lang: string;
  rtl?: boolean;
}

interface CodeBlock {
  label: string;
  lines: CodeLine[][];
}

type TokenType = "kw" | "type" | "field" | "value" | "punct" | "comment" | "plain";
type CodeLine = { text: string; type: TokenType };

// ─── Language data (60+ entries, deliberately mixed order) ───────────────────

const LANGUAGES: LangEntry[] = [
  { word: "promise",               lang: "English" },
  { word: "promesa",               lang: "Spanish" },
  { word: "약속",                   lang: "Korean" },
  { word: "обещание",              lang: "Russian" },
  { word: "ahadi",                 lang: "Swahili" },
  { word: "承诺",                   lang: "Mandarin" },
  { word: "وعد",                   lang: "Arabic",          rtl: true },
  { word: "वादा",                  lang: "Hindi" },
  { word: "promesse",              lang: "French" },
  { word: "isithembiso",           lang: "Zulu" },
  { word: "Versprechen",           lang: "German" },
  { word: "約束",                   lang: "Japanese" },
  { word: "addewid",               lang: "Welsh" },
  { word: "הבטחה",                 lang: "Hebrew",          rtl: true },
  { word: "pangako",               lang: "Tagalog" },
  { word: "wóičhake",              lang: "Lakota" },
  { word: "promessa",              lang: "Portuguese" },
  { word: "lupaus",                lang: "Finnish" },
  { word: "ìlérí",                 lang: "Yoruba" },
  { word: "قول",                   lang: "Persian",         rtl: true },
  { word: "kī taurangi",           lang: "Māori" },
  { word: "สัญญา",                 lang: "Thai" },
  { word: "tautoga",               lang: "Samoan" },
  { word: "nkwa",                  lang: "Igbo" },
  { word: "söz",                   lang: "Turkish" },
  { word: "gealladh",              lang: "Scots Gaelic" },
  { word: "promeso",               lang: "Esperanto" },
  { word: "belofte",               lang: "Dutch" },
  { word: "ʻōlelo paʻa",           lang: "Hawaiian" },
  { word: "ñiqiy",                 lang: "Quechua" },
  { word: "toki wawa",             lang: "Toki Pona" },
  { word: "lay'",                  lang: "Klingon" },
  { word: "வாக்குறுதி",            lang: "Tamil" },
  { word: "ቃል",                   lang: "Amharic" },
  { word: "obietnica",             lang: "Polish" },
  { word: "lời hứa",               lang: "Vietnamese" },
  { word: "ᏚᏓᎸᏉᏛᎾ",               lang: "Cherokee" },
  { word: "janji",                 lang: "Malay" },
  { word: "υπόσχεση",              lang: "Greek" },
  { word: "alkawari",              lang: "Hausa" },
  { word: "waawiyindamaagowin",    lang: "Ojibwe" },
  { word: "lubadus",               lang: "Estonian" },
  { word: "promessa",              lang: "Italian" },
  { word: "ígéret",                lang: "Hungarian" },
  { word: "وعدہ",                  lang: "Urdu",            rtl: true },
  { word: "уәде",                  lang: "Kazakh" },
  { word: "gealltanas",            lang: "Irish" },
  { word: "ཁས་ལེན",               lang: "Tibetan" },
  { word: "承諾",                   lang: "Cantonese" },
  { word: "амлалт",                lang: "Mongolian" },
  { word: "tēnēhualiztli",         lang: "Nahuatl" },
  { word: "დაპირება",              lang: "Georgian" },
  { word: "vandë",                 lang: "Quenya (Tolkien)" },
  { word: "వాగ్దానం",              lang: "Telugu" },
  { word: "yáʼátʼééh bee ádaadinígíí", lang: "Navajo (Diné)" },
  { word: "wawa",                  lang: "Chinook Wawa" },
  { word: "խոստum",               lang: "Armenian" },
  { word: "ígéret",                lang: "Hungarian" },
  { word: "alkawari",              lang: "Hausa" },
];

// Reduced-motion static sample (8 entries from different families)
const LANGUAGES_STATIC = LANGUAGES.slice(0, 8);

// ─── Code block data ──────────────────────────────────────────────────────────

// Token helpers
const kw  = (t: string): CodeLine => ({ text: t, type: "kw" });
const ty  = (t: string): CodeLine => ({ text: t, type: "type" });
const fi  = (t: string): CodeLine => ({ text: t, type: "field" });
const va  = (t: string): CodeLine => ({ text: t, type: "value" });
const pu  = (t: string): CodeLine => ({ text: t, type: "punct" });
const co  = (t: string): CodeLine => ({ text: t, type: "comment" });
const pl  = (t: string): CodeLine => ({ text: t, type: "plain" });

const CODE_BLOCKS: CodeBlock[] = [
  {
    label: "TypeScript",
    lines: [
      [kw("interface "), ty("Promise"), pu(" {")],
      [pl("  "), fi("id"), pu(":        "), ty("string")],
      [pl("  "), fi("body"), pu(":      "), ty("string")],
      [pl("  "), fi("promiser"), pu(":  "), ty("string")],
      [pl("  "), fi("promisee"), pu(":  "), ty("string")],
      [pl("  "), fi("status"), pu(":    "), ty("Status")],
      [pl("  "), fi("depends_on"), pu(": "), ty("string[]")],
      [pl("  "), fi("verification"), pu(": "), ty("Source")],
      [pu("}")],
    ],
  },
  {
    label: "Python",
    lines: [
      [pu("@"), ty("dataclass")],
      [kw("class "), ty("Promise"), pu(":")],
      [pl("    "), fi("id"), pu(":           "), ty("str")],
      [pl("    "), fi("body"), pu(":         "), ty("str")],
      [pl("    "), fi("promiser"), pu(":     "), ty("str")],
      [pl("    "), fi("promisee"), pu(":     "), ty("str")],
      [pl("    "), fi("status"), pu(":       "), ty("Status")],
      [pl("    "), fi("depends_on"), pu(":   "), ty("list[str]")],
      [pl("    "), fi("verification"), pu(": "), ty("Source")],
    ],
  },
  {
    label: "Rust",
    lines: [
      [kw("struct "), ty("Promise"), pu(" {")],
      [pl("    "), fi("id"), pu(":           "), ty("String"), pu(",")],
      [pl("    "), fi("body"), pu(":         "), ty("String"), pu(",")],
      [pl("    "), fi("promiser"), pu(":     "), ty("String"), pu(",")],
      [pl("    "), fi("promisee"), pu(":     "), ty("String"), pu(",")],
      [pl("    "), fi("status"), pu(":       "), ty("Status"), pu(",")],
      [pl("    "), fi("depends_on"), pu(":   "), ty("Vec<String>"), pu(",")],
      [pl("    "), fi("verification"), pu(": "), ty("Source"), pu(",")],
      [pu("}")],
    ],
  },
  {
    label: "SQL",
    lines: [
      [kw("CREATE TABLE "), ty("promises"), pu(" (")],
      [pl("  "), fi("id"), pu("           "), ty("TEXT"), pu("  "), kw("PRIMARY KEY"), pu(",")],
      [pl("  "), fi("body"), pu("         "), ty("TEXT"), pu("  "), kw("NOT NULL"), pu(",")],
      [pl("  "), fi("promiser"), pu("     "), ty("TEXT"), pu("  "), kw("NOT NULL"), pu(",")],
      [pl("  "), fi("promisee"), pu("     "), ty("TEXT"), pu("  "), kw("NOT NULL"), pu(",")],
      [pl("  "), fi("status"), pu("       "), ty("TEXT"), pu("  "), kw("NOT NULL"), pu(",")],
      [pl("  "), fi("depends_on"), pu("   "), ty("TEXT[]"), pu(",")],
      [pl("  "), fi("verification"), pu(" "), ty("JSONB")],
      [pu(");")],
    ],
  },
  {
    label: "JSON",
    lines: [
      [pu("{")],
      [pl('  '), fi('"id"'), pu(":         "), va('"HB2021-P001"'), pu(",")],
      [pl('  '), fi('"body"'), pu(":       "), va('"100% clean electricity"'), pu(",")],
      [pl('  '), fi('"promiser"'), pu(":   "), va('"State of Oregon"'), pu(",")],
      [pl('  '), fi('"promisee"'), pu(":   "), va('"Oregon residents"'), pu(",")],
      [pl('  '), fi('"status"'), pu(":     "), va('"declared"'), pu(",")],
      [pl('  '), fi('"depends_on"'), pu(": "), va('["P002", "P003"]'), pu(",")],
      [pl('  '), fi('"verification"'), pu(": { "), fi('"method"'), pu(": "), va('"filing"'), pu(" }")],
      [pu("}")],
    ],
  },
  {
    label: "GraphQL",
    lines: [
      [kw("type "), ty("Promise"), pu(" {")],
      [pl("  "), fi("id"), pu(":           "), ty("ID!") ],
      [pl("  "), fi("body"), pu(":         "), ty("String!")],
      [pl("  "), fi("promiser"), pu(":     "), ty("Agent!")],
      [pl("  "), fi("promisee"), pu(":     "), ty("Agent!")],
      [pl("  "), fi("status"), pu(":       "), ty("Status!")],
      [pl("  "), fi("dependsOn"), pu(":    "), ty("[Promise!]")],
      [pl("  "), fi("verification"), pu(": "), ty("Source")],
      [pu("}")],
    ],
  },
  {
    label: "Solidity",
    lines: [
      [kw("struct "), ty("Promise"), pu(" {")],
      [pl("    "), ty("bytes32"), pu("   "), fi("id"), pu(";")],
      [pl("    "), ty("string"), pu("    "), fi("body"), pu(";")],
      [pl("    "), ty("address"), pu("   "), fi("promiser"), pu(";")],
      [pl("    "), ty("address"), pu("   "), fi("promisee"), pu(";")],
      [pl("    "), ty("Status"), pu("    "), fi("status"), pu(";")],
      [pl("    "), ty("bytes32[]"), pu(" "), fi("dependsOn"), pu(";")],
      [pl("    "), ty("bytes32"), pu("   "), fi("verificationHash"), pu(";")],
      [pu("}")],
    ],
  },
  {
    label: "YAML",
    lines: [
      [fi("promise"), pu(":")],
      [pl("  "), fi("id"), pu(":           "), va("HB2021-P001")],
      [pl("  "), fi("body"), pu(":         "), va("100% clean electricity")],
      [pl("  "), fi("promiser"), pu(":     "), va("State of Oregon")],
      [pl("  "), fi("promisee"), pu(":     "), va("Oregon residents")],
      [pl("  "), fi("status"), pu(":       "), va("declared")],
      [pl("  "), fi("depends_on"), pu(":   "), va("[P002, P003]")],
      [pl("  "), fi("verification"), pu(":")],
      [pl("    "), fi("method"), pu(":     "), va("filing")],
    ],
  },
  {
    label: "Poseidon hash",
    lines: [
      [co("// Promise fingerprint (128-bit header)")],
      [va("0x27960458")],
      [va("  a1b2c3d4")],
      [va("  e5f60789")],
      [va("  ab12cd34")],
      [],
      [co("// Composition hash (SHA-256)")],
      [va("0x9f8e7d6c5b4a3210")],
      [va("  fedcba9876543210")],
    ],
  },
  {
    label: "COBOL",
    lines: [
      [kw("01 "), ty("PROMISE"), pu(".")],
      [pl("   "), kw("05 "), fi("PROMISE-ID"), pl("     "), kw("PIC "), ty("X(20)"), pu(".")],
      [pl("   "), kw("05 "), fi("BODY"), pl("          "), kw("PIC "), ty("X(200)"), pu(".")],
      [pl("   "), kw("05 "), fi("PROMISER"), pl("      "), kw("PIC "), ty("X(50)"), pu(".")],
      [pl("   "), kw("05 "), fi("PROMISEE"), pl("      "), kw("PIC "), ty("X(50)"), pu(".")],
      [pl("   "), kw("05 "), fi("STATUS"), pl("        "), kw("PIC "), ty("X(10)"), pu(".")],
    ],
  },
  {
    label: "FORTRAN 77",
    lines: [
      [pl("      "), ty("CHARACTER"), pu("*20 "), fi("PROMID")],
      [pl("      "), ty("CHARACTER"), pu("*200 "), fi("BODY")],
      [pl("      "), ty("CHARACTER"), pu("*50 "), fi("PRMISR")],
      [pl("      "), ty("CHARACTER"), pu("*50 "), fi("PRMSEE")],
      [pl("      "), ty("CHARACTER"), pu("*10 "), fi("STATUS")],
      [],
      [pl("      "), kw("COMMON "), pu("/"), ty("PROMISE"), pu("/ ")],
      [pl("     "), pu("& "), fi("PROMID"), pu(","), fi("BODY"), pu(",")],
      [pl("     "), pu("& "), fi("PRMISR"), pu(","), fi("PRMSEE"), pu(","), fi("STATUS")],
    ],
  },
  {
    label: "LOLCODE",
    lines: [
      [kw("HAI "), va("1.2")],
      [pl("  "), kw("I HAS A "), fi("PROMIS"), kw(" ITZ A "), ty("BUKKIT")],
      [pl("    "), fi("PROMIS"), kw(" HAS A "), fi("ID"), kw(" ITZ "), va('"HB2021-P001"')],
      [pl("    "), fi("PROMIS"), kw(" HAS A "), fi("BODY"), kw(" ITZ "), va('"100% CLEEN ENERJIEZ"')],
      [pl("    "), fi("PROMIS"), kw(" HAS A "), fi("PROMISER"), kw(" ITZ "), va('"STATE OF OREGON"')],
      [pl("    "), fi("PROMIS"), kw(" HAS A "), fi("STATUS"), kw(" ITZ "), va('"DECLARD"')],
      [pl("  "), kw("VISIBLE "), fi("PROMIS")],
      [kw("KTHXBYE")],
    ],
  },
  {
    label: "Shakespeare",
    lines: [
      [ty("Romeo"), pu(", "), pl("a promise kept.")],
      [ty("Juliet"), pu(", "), pl("a promise made.")],
      [],
      [kw("Act I"), pu(": "), pl("The Declaration.")],
      [kw("Scene I"), pu(": "), pl("The Commitment.")],
      [],
      [pu("["), kw("Enter "), ty("Romeo"), kw(" and "), ty("Juliet"), pu("]")],
      [ty("Romeo"), pu(": "), pl("Thou art the sum")],
      [pl("  "), pl("of a promise and trust.")],
    ],
  },
];

// ─── Token colors ─────────────────────────────────────────────────────────────

const TOKEN_COLORS: Record<TokenType, string> = {
  kw:      "#6b7280",  // gray-500 — keywords
  type:    "#374151",  // gray-700 — type names
  field:   "#1f2937",  // gray-900 — field names
  value:   "#059669",  // green-600 — string values (PP brand)
  punct:   "#9ca3af",  // gray-400 — punctuation
  comment: "#9ca3af",  // gray-400 — comments
  plain:   "#4b5563",  // gray-600 — whitespace/misc
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function CodeLine({ line }: { line: CodeLine[] }) {
  if (line.length === 0) return <div style={{ height: "1.1em" }} />;
  return (
    <div style={{ lineHeight: "1.6", whiteSpace: "pre" }}>
      {line.map((token, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[token.type] }}>
          {token.text}
        </span>
      ))}
    </div>
  );
}

function CodeRotator({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % CODE_BLOCKS.length);
        setVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
  }, [reduced]);

  const block = CODE_BLOCKS[index];

  return (
    <div
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.72rem",
        transition: "opacity 0.5s ease",
        opacity: visible ? 1 : 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#9ca3af",
          marginBottom: "0.75rem",
          fontFamily: "IBM Plex Mono, monospace",
        }}
      >
        {block.label}
      </div>
      <div>
        {block.lines.map((line, i) => (
          <CodeLine key={i} line={line} />
        ))}
      </div>
    </div>
  );
}

function LanguageScroller({ reduced }: { reduced: boolean }) {
  const [paused, setPaused] = useState(false);
  const doubled = [...LANGUAGES, ...LANGUAGES];

  if (reduced) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {LANGUAGES_STATIC.map((entry, i) => (
          <LangWord key={i} entry={entry} />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ppu-scroll-up {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>
      <div
        style={{
          height: "100%",
          overflow: "hidden",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-hidden="true"
      >
        <div
          style={{
            animation: `ppu-scroll-up 42s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((entry, i) => (
            <LangWord key={i} entry={entry} />
          ))}
        </div>
      </div>
    </>
  );
}

function LangWord({ entry }: { entry: LangEntry }) {
  return (
    <div
      dir={entry.rtl ? "rtl" : undefined}
      style={{
        padding: "0.5rem 0",
        textAlign: entry.rtl ? "right" : "left",
      }}
    >
      <div
        style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: "1.05rem",
          fontWeight: 500,
          color: "#374151",
          lineHeight: 1.3,
        }}
      >
        {entry.word}
      </div>
      <div
        style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontSize: "0.65rem",
          color: "#9ca3af",
          letterSpacing: "0.04em",
          marginTop: "0.1rem",
        }}
      >
        {entry.lang}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PromiseUniversal() {
  const reduced = useReducedMotion();
  const PANEL_HEIGHT = 380;

  return (
    <section
      aria-label="Promise expressed in 60+ human languages and multiple programming languages"
      style={{ backgroundColor: "#faf9f6", overflow: "hidden" }}
      className="py-10"
    >
      {/* Screen-reader summary (hidden visually) */}
      <p className="sr-only">
        The word "promise" translated into more than sixty human languages,
        including English, Spanish, Korean, Arabic, Swahili, Navajo, Cherokee,
        Māori, Hawaiian, and many more — alongside the promise schema expressed
        in TypeScript, Python, Rust, SQL, JSON, GraphQL, Solidity, and YAML.
      </p>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Three-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "0",
            height: PANEL_HEIGHT,
            alignItems: "stretch",
          }}
          className="max-sm:grid-cols-1 max-sm:h-auto"
        >
          {/* Left: human languages */}
          <div
            style={{ height: PANEL_HEIGHT, position: "relative" }}
            className="max-sm:h-48 max-sm:mb-4"
          >
            <LanguageScroller reduced={reduced} />
          </div>

          {/* Center: divider */}
          <div
            style={{
              width: 1,
              margin: "0 2rem",
              background:
                "linear-gradient(to bottom, transparent, #d1d5db 20%, #d1d5db 80%, transparent)",
              flexShrink: 0,
            }}
            className="max-sm:hidden"
            aria-hidden="true"
          />

          {/* Right: machine languages */}
          <div
            style={{ height: PANEL_HEIGHT, position: "relative" }}
            className="max-sm:h-auto"
          >
            <CodeRotator reduced={reduced} />
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{ textAlign: "center", marginTop: "2rem", paddingTop: "1rem" }}
        >
          <p
            style={{
              fontFamily: "IBM Plex Serif, serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "#1f2937",
              lineHeight: 1.6,
            }}
          >
            One concept. One structure. Every language. Every scale.
          </p>
          <p
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.65rem",
              color: "#9ca3af",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: "0.4rem",
            }}
          >
            60+ human languages · 9 machine languages · 1 schema
          </p>
        </div>
      </div>
    </section>
  );
}
