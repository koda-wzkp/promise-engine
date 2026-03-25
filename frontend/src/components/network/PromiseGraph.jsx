import { useState, useCallback } from "react";

const C = {
  bg: "#faf9f6", surface: "#ffffff", surfaceDark: "#f5f3ee",
  border: "#e2ddd5", text: "#2d2a26", textMuted: "#7a7267", textLight: "#a09889",
  accent: "#1a5f4a",
  verified: "#1a5f4a", declared: "#6b7280", degraded: "#b45309",
  violated: "#b91c1c", unverifiable: "#7c3aed",
};

const agentTypeColors = {
  legislator: "#6366f1", utility: "#d97706", regulator: "#0891b2",
  community: "#16a34a", auditor: "#8b5cf6",
};

// Static layout positions grouped by domain clusters
const NODE_POSITIONS = {
  // PGE emissions cascade (left)
  P001: { x: 160, y: 120 }, P002: { x: 160, y: 220 }, P003: { x: 160, y: 320 },
  // PAC emissions cascade (right)
  P004: { x: 440, y: 120 }, P005: { x: 440, y: 220 }, P006: { x: 440, y: 320 },
  // ESS
  P007: { x: 300, y: 320 },
  // Planning
  P008: { x: 160, y: 30 }, P009: { x: 440, y: 30 },
  // Verification (center)
  P010: { x: 370, y: 430 }, P011: { x: 230, y: 430 },
  // Equity (center-right)
  P012: { x: 620, y: 120 }, P013: { x: 620, y: 220 },
  P014: { x: 560, y: 180 }, P015: { x: 680, y: 180 },
  // Affordability
  P016: { x: 80, y: 220 }, P017: { x: 520, y: 220 },
  // Tribal / Workforce
  P018: { x: 620, y: 320 }, P019: { x: 620, y: 400 },
  // Reports
  P020: { x: 300, y: 430 },
};

// Promise dependency edges
const EDGES = [
  { from: "P001", to: "P002" }, { from: "P002", to: "P003" },
  { from: "P004", to: "P005" }, { from: "P005", to: "P006" },
  { from: "P008", to: "P001" }, { from: "P009", to: "P004" },
  { from: "P010", to: "P011" },
  { from: "P011", to: "P008" }, { from: "P011", to: "P009" },
  { from: "P012", to: "P014" }, { from: "P012", to: "P015" },
];

export { EDGES };

export default function PromiseGraph({ promises, agents, selectedId, onPromiseClick }) {
  const [tooltip, setTooltip] = useState(null);
  const mono = "'IBM Plex Mono', monospace";

  const handleNodeClick = useCallback((promise) => {
    onPromiseClick(promise.id);
  }, [onPromiseClick]);

  const showTooltip = useCallback((promise) => {
    const pos = NODE_POSITIONS[promise.id];
    setTooltip({
      promise,
      x: pos.x,
      y: pos.y - 30,
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const svgWidth = 760;
  const svgHeight = 480;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: "100%", height: "auto", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={C.border} />
          </marker>
        </defs>

        {/* Edges */}
        {EDGES.map((edge, i) => {
          const from = NODE_POSITIONS[edge.from];
          const to = NODE_POSITIONS[edge.to];
          if (!from || !to) return null;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const r = 18;
          const startX = from.x + (dx / dist) * r;
          const startY = from.y + (dy / dist) * r;
          const endX = to.x - (dx / dist) * r;
          const endY = to.y - (dy / dist) * r;
          return (
            <line
              key={i}
              x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={C.border} strokeWidth={1.5}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Nodes */}
        {promises.map(promise => {
          const pos = NODE_POSITIONS[promise.id];
          if (!pos) return null;
          const promiser = agents.find(a => a.id === promise.promiser);
          const isSelected = selectedId === promise.id;
          const nodeColor = C[promise.status] || C.textMuted;
          const borderColor = isSelected ? C.accent : nodeColor;

          return (
            <g key={promise.id}>
              {/* Hit target — larger invisible circle for easier mobile tapping */}
              <circle
                cx={pos.x} cy={pos.y} r={22}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={() => handleNodeClick(promise)}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handleNodeClick(promise);
                }}
                onMouseEnter={() => showTooltip(promise)}
                onMouseLeave={hideTooltip}
              />
              {/* Visible node */}
              <circle
                cx={pos.x} cy={pos.y} r={isSelected ? 17 : 15}
                fill={`${nodeColor}18`}
                stroke={borderColor}
                strokeWidth={isSelected ? 3 : 2}
                style={{ cursor: "pointer", pointerEvents: "none" }}
              />
              {/* Agent type ring */}
              {promiser && (
                <circle
                  cx={pos.x} cy={pos.y} r={11}
                  fill={agentTypeColors[promiser.type] || C.textMuted}
                  opacity={0.15}
                  style={{ pointerEvents: "none" }}
                />
              )}
              {/* Label */}
              <text
                x={pos.x} y={pos.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontWeight={600} fontFamily={mono}
                fill={nodeColor}
                style={{ pointerEvents: "none" }}
              >
                {promise.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip overlay — pointer-events: none so it never blocks taps */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: `${(tooltip.x / svgWidth) * 100}%`,
          top: `${(tooltip.y / svgHeight) * 100}%`,
          transform: "translate(-50%, -100%)",
          background: C.text,
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 4,
          fontSize: 11,
          fontFamily: mono,
          maxWidth: 220,
          lineHeight: 1.4,
          pointerEvents: "none",
          zIndex: 5,
          whiteSpace: "normal",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.promise.id}</div>
          <div style={{ opacity: 0.85 }}>{tooltip.promise.body}</div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "On Track", color: C.verified },
          { label: "Declared", color: C.declared },
          { label: "Behind", color: C.degraded },
          { label: "Off Track", color: C.violated },
          { label: "No Verification", color: C.unverifiable },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textMuted }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, border: `1.5px solid ${item.color}` }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
