import Link from "next/link";
import { studioModules } from "@/lib/data/studio-curriculum";
import { InlineServiceCTA } from "@/components/cta/InlineServiceCTA";
import { BOOKING_URL } from "@/lib/constants/booking";

const VERIFICATION_COLORS: Record<
  "self-report" | "audit" | "sensor",
  { text: string; bg: string; label: string }
> = {
  "self-report": {
    text: "#5b21b6",
    bg: "#f5f3ff",
    label: "self-report",
  },
  audit: {
    text: "#1e40af",
    bg: "#eff6ff",
    label: "audit",
  },
  sensor: {
    text: "#1a5f4a",
    bg: "#ecfdf5",
    label: "sensor",
  },
};

// Dependency edges: [from, to]
const EDGES: [string, string][] = [
  ["STUDIO-001", "STUDIO-002"],
  ["STUDIO-002", "STUDIO-003"],
  ["STUDIO-003", "STUDIO-004"],
  ["STUDIO-004", "STUDIO-005"],
  ["STUDIO-005", "STUDIO-006"],
  ["STUDIO-006", "STUDIO-007"],
  ["STUDIO-005", "STUDIO-008"],
];

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <section aria-labelledby="learn-hero-heading">
        <h1
          id="learn-hero-heading"
          className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
        >
          Learn Promise Pipeline
        </h1>
        <p className="font-serif text-lg text-gray-700 mb-4">
          8 modules. 2 hours. Build a real promise network — and learn the
          theory by doing it.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          This curriculum is itself a promise network. Each module is a promise
          you make. Completing it verifies the promise. You&apos;ll see your own
          progress as a promise graph — using the tool you&apos;re learning.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <Link
            href="/learn/module/1"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Start Module 1 &rarr;
          </Link>
          <a
            href="#curriculum-graph"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-500 transition-colors"
          >
            View the curriculum graph
          </a>
        </div>
      </section>

      {/* Curriculum Graph */}
      <section id="curriculum-graph" aria-labelledby="graph-heading">
        <h2
          id="graph-heading"
          className="font-serif text-xl font-semibold text-gray-900 mb-4"
        >
          Curriculum Overview — The Promise Network
        </h2>
        <CurriculumGraph />
      </section>

      {/* Network Properties Card */}
      <div
        className="bg-white border border-gray-200 rounded-lg p-5 mb-12 mt-8"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Curriculum Network
        </p>
        <div
          className="border-t-2 border-gray-900 mb-3"
          style={{ width: 160 }}
        />
        <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
          <p>8 promises &middot; 3 agents &middot; 7 dependency edges</p>
          <p>Bottleneck: Module 5 (Map a Real Network)</p>
          <p>
            Verification: 62.5% self-report &middot; 25% audit &middot; 12.5%
            sensor
          </p>
          <p>
            Verification gap: intentional — you&apos;ll find it in Module 4
          </p>
        </div>
      </div>

      {/* Module List */}
      <section aria-labelledby="module-list-heading" className="mb-12">
        <h2
          id="module-list-heading"
          className="font-serif text-xl font-semibold text-gray-900 mb-4"
        >
          All Modules
        </h2>
        <div className="space-y-3">
          {studioModules.map((mod) => {
            const vc = VERIFICATION_COLORS[mod.verification.method];
            return (
              <Link
                key={mod.id}
                href={`/learn/module/${mod.number}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                style={{ borderLeftWidth: 3, borderLeftColor: vc.text }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span
                      className="text-xs font-medium"
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        color: "#6b7280",
                      }}
                    >
                      Module {mod.number} &middot; {mod.time} min
                    </span>
                    <h3 className="font-serif text-base font-semibold text-gray-900 mt-1">
                      {mod.title}
                    </h3>
                    <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: vc.text,
                        backgroundColor: vc.bg,
                      }}
                    >
                      {vc.label}
                    </span>
                  </div>
                </div>
                {mod.depends_on.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-2">
                    Requires:{" "}
                    {mod.depends_on
                      .map((dep) => {
                        const depMod = studioModules.find((m) => m.id === dep);
                        return depMod
                          ? `Module ${depMod.number}`
                          : dep;
                      })
                      .join(", ")}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works — Three Tiers */}
      <section aria-labelledby="tiers-heading" className="mb-12">
        <h2
          id="tiers-heading"
          className="font-serif text-xl font-semibold text-gray-900 mb-4"
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Self-Guided */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-serif text-base font-semibold text-gray-900 mb-1">
              Self-Guided
            </h3>
            <p
              className="text-[11px] font-medium mb-3"
              style={{ color: "#1a5f4a" }}
            >
              Free
            </p>
            <ul className="text-[13px] text-gray-600 space-y-2 mb-4">
              <li>Work through 8 modules at your own pace</li>
              <li>Use the free personal promise tracker</li>
              <li>Documentation is your guide</li>
            </ul>
            <Link
              href="/learn/module/1"
              className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
            >
              Start learning &rarr;
            </Link>
          </div>

          {/* Guided */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-serif text-base font-semibold text-gray-900 mb-1">
              Guided
            </h3>
            <p
              className="text-[11px] font-medium mb-3"
              style={{ color: "#1e40af" }}
            >
              Client Onboarding
            </p>
            <ul className="text-[13px] text-gray-600 space-y-2 mb-4">
              <li>Same 8 modules with live support</li>
              <li>Modules 1–3 on a 30-minute call</li>
              <li>Modules 4–8 with async review</li>
              <li>Included in any consulting engagement</li>
            </ul>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
            >
              Book an onboarding call &rarr;
            </a>
          </div>

          {/* Cohort */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-serif text-base font-semibold text-gray-900 mb-1">
              Cohort
            </h3>
            <p
              className="text-[11px] font-medium mb-3"
              style={{ color: "#6b7280" }}
            >
              Coming Soon
            </p>
            <ul className="text-[13px] text-gray-600 space-y-2 mb-4">
              <li>4–6 learners, 4 sessions over 2 weeks</li>
              <li>Peer review of each other&apos;s networks</li>
              <li>Group promise graph</li>
            </ul>
            <CohortWaitlistLink />
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section aria-labelledby="principles-heading" className="mb-12">
        <h2
          id="principles-heading"
          className="font-serif text-xl font-semibold text-gray-900 mb-4"
        >
          Design Principles
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              <strong className="text-gray-900">Learn by doing.</strong> Every
              module produces a real artifact.
            </li>
            <li>
              <strong className="text-gray-900">
                The tool teaches the tool.
              </strong>{" "}
              Your progress is a promise network.
            </li>
            <li>
              <strong className="text-gray-900">Under 15 minutes.</strong>{" "}
              ADHD-aware. One action, one output, one verification.
            </li>
            <li>
              <strong className="text-gray-900">No shame signals.</strong> Skip,
              revisit, renegotiate. It&apos;s data, not judgment.
            </li>
            <li>
              <strong className="text-gray-900">
                Real data from minute one.
              </strong>{" "}
              Your promises, not a sandbox.
            </li>
            <li>
              <strong className="text-gray-900">
                Three tiers, one curriculum.
              </strong>{" "}
              Free, guided, or cohort. Same content.
            </li>
          </ul>
        </div>
      </section>

      {/* Footer CTA */}
      <InlineServiceCTA variant="demo" />
    </div>
  );
}

/* ─── Curriculum Graph SVG ─── */

function CurriculumGraph() {
  // Node positions: vertical layout with Module 8 branching from Module 5
  const nodeWidth = 200;
  const nodeHeight = 56;
  const gapY = 24;
  const centerX = 260;
  const branchX = 460;

  type NodePos = { x: number; y: number; mod: (typeof studioModules)[number] };

  const nodes: NodePos[] = studioModules.map((mod) => {
    const isShortcut = mod.number === 8;
    const baseY = 20;
    const idx = isShortcut ? 4 : mod.number - 1; // Module 8 aligns with row after Module 5
    return {
      x: isShortcut ? branchX : centerX,
      y: baseY + idx * (nodeHeight + gapY),
      mod,
    };
  });

  // Move Module 8 to be vertically between Module 5 and Module 6
  const mod5Node = nodes.find((n) => n.mod.number === 5)!;
  const mod8Node = nodes.find((n) => n.mod.number === 8)!;
  mod8Node.y = mod5Node.y + nodeHeight + gapY;

  const svgHeight =
    Math.max(...nodes.map((n) => n.y)) + nodeHeight + 20;
  const svgWidth = branchX + nodeWidth + 40;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full"
      role="img"
      aria-label="Curriculum dependency graph showing 8 modules with 7 dependency edges"
      style={{ maxWidth: 720 }}
    >
      {/* Edges */}
      {EDGES.map(([fromId, toId]) => {
        const from = nodes.find((n) => n.mod.id === fromId)!;
        const to = nodes.find((n) => n.mod.id === toId)!;
        const isShortcut = fromId === "STUDIO-005" && toId === "STUDIO-008";

        const x1 = from.x + nodeWidth / 2;
        const y1 = from.y + nodeHeight;
        const x2 = to.x + nodeWidth / 2;
        const y2 = to.y;

        if (isShortcut) {
          // Curved path from Module 5 to Module 8 (branch right)
          const midY = (y1 + y2) / 2;
          return (
            <g key={`${fromId}-${toId}`}>
              <path
                d={`M ${from.x + nodeWidth} ${from.y + nodeHeight / 2} C ${from.x + nodeWidth + 60} ${from.y + nodeHeight / 2}, ${to.x - 60} ${to.y + nodeHeight / 2}, ${to.x} ${to.y + nodeHeight / 2}`}
                fill="none"
                stroke="#9ca3af"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
              <title>
                Shortcut: You can share your network before completing the
                advanced modules
              </title>
            </g>
          );
        }

        return (
          <line
            key={`${fromId}-${toId}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#d1d5db"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const vc = VERIFICATION_COLORS[node.mod.verification.method];
        return (
          <g key={node.mod.id}>
            <rect
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={8}
              fill="white"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            {/* Left accent */}
            <rect
              x={node.x}
              y={node.y}
              width={3}
              height={nodeHeight}
              rx={1}
              fill={vc.text}
            />
            {/* Module number */}
            <text
              x={node.x + 14}
              y={node.y + 18}
              fontSize={11}
              fontFamily="IBM Plex Mono, monospace"
              fill="#6b7280"
            >
              {node.mod.number}
            </text>
            {/* Title */}
            <text
              x={node.x + 30}
              y={node.y + 18}
              fontSize={12}
              fontFamily="IBM Plex Serif, serif"
              fontWeight={600}
              fill="#111827"
            >
              {node.mod.shortTitle}
            </text>
            {/* Verification badge */}
            <text
              x={node.x + 14}
              y={node.y + 36}
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
              fill={vc.text}
            >
              {vc.label}
            </text>
            {/* Time */}
            <text
              x={node.x + nodeWidth - 14}
              y={node.y + 36}
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
              fill="#9ca3af"
              textAnchor="end"
            >
              {node.mod.time} min
            </text>
            {/* Status */}
            <text
              x={node.x + nodeWidth - 14}
              y={node.y + 18}
              fontSize={10}
              fontFamily="IBM Plex Mono, monospace"
              fill="#9ca3af"
              textAnchor="end"
            >
              declared
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Cohort Waitlist (client component island) ─── */

function CohortWaitlistLink() {
  return (
    <Link
      href="/learn#cohort-waitlist"
      className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
    >
      Join the waitlist &rarr;
    </Link>
  );
}
