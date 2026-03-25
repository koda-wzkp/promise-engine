import { useState } from "react";

const C = {
  bg: "#faf9f6", surface: "#ffffff", surfaceDark: "#f5f3ee",
  border: "#e2ddd5", text: "#2d2a26", textMuted: "#7a7267", textLight: "#a09889",
  accent: "#1a5f4a", accentLight: "#e8f2ee",
  verified: "#1a5f4a", declared: "#6b7280", degraded: "#b45309",
  violated: "#b91c1c", unverifiable: "#7c3aed",
};

const STATUS_LABELS = {
  verified: "On Track", declared: "Declared", degraded: "Behind Schedule",
  violated: "Off Track", unverifiable: "No Verification",
};

const STATUSES = ["verified", "declared", "degraded", "violated", "unverifiable"];

export default function WhatIfPanel({ promise, promises, edges, agents, onClose }) {
  const [simStatus, setSimStatus] = useState(null);
  const mono = "'IBM Plex Mono', monospace";

  if (!promise) return null;

  const promiser = agents.find(a => a.id === promise.promiser);
  const promisee = agents.find(a => a.id === promise.promisee);

  // Find downstream promises affected by this one
  const getDownstream = (id, visited = new Set()) => {
    if (visited.has(id)) return [];
    visited.add(id);
    const direct = edges.filter(e => e.from === id).map(e => e.to);
    const all = [...direct];
    direct.forEach(d => all.push(...getDownstream(d, visited)));
    return [...new Set(all)];
  };

  const downstream = getDownstream(promise.id);
  const affected = downstream.map(id => promises.find(p => p.id === id)).filter(Boolean);
  const activeStatus = simStatus || promise.status;

  // Simple cascade: if parent degrades, children degrade (at minimum)
  const statusRank = { verified: 4, declared: 3, degraded: 2, unverifiable: 1, violated: 0 };
  const cascadedAffected = simStatus ? affected.map(p => {
    if (statusRank[simStatus] < statusRank[p.status]) {
      return { ...p, simulated: simStatus };
    }
    return p;
  }) : affected;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "24px 28px", marginTop: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: mono, color: C.textLight, marginBottom: 4 }}>WHAT IF ANALYSIS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 14, color: C.accent, fontWeight: 600 }}>{promise.id}</span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{promise.body}</span>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: `1px solid ${C.border}`, borderRadius: 4,
          padding: "4px 12px", fontSize: 12, cursor: "pointer", color: C.textMuted,
        }}>Close</button>
      </div>

      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>
        <span style={{ fontWeight: 600 }}>{promiser?.name}</span>
        <span style={{ margin: "0 6px" }}>promised to</span>
        <span style={{ fontWeight: 600 }}>{promisee?.name}</span>
      </div>

      {/* Status simulator */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Simulate status change:</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setSimStatus(s === promise.status ? null : s)} style={{
              padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer",
              background: activeStatus === s ? C[s] : C.surfaceDark,
              color: activeStatus === s ? "#fff" : C.textMuted,
              border: `1px solid ${activeStatus === s ? C[s] : C.border}`,
            }}>{STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>

      {/* Cascade impact */}
      {affected.length > 0 ? (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            Cascade impact ({affected.length} downstream {affected.length === 1 ? "promise" : "promises"}):
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {cascadedAffected.map(p => (
              <div key={p.id} style={{
                padding: "10px 14px", background: C.surfaceDark, borderRadius: 6,
                borderLeft: `3px solid ${C[p.simulated || p.status]}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <span style={{ fontFamily: mono, fontSize: 12, color: C.accent, fontWeight: 600, marginRight: 8 }}>{p.id}</span>
                  <span style={{ fontSize: 13 }}>{p.body}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {p.simulated && p.simulated !== p.status && (
                    <>
                      <span style={{ fontSize: 11, color: C[p.status], fontFamily: mono }}>{STATUS_LABELS[p.status]}</span>
                      <span style={{ fontSize: 11, color: C.textLight }}>→</span>
                    </>
                  )}
                  <span style={{
                    fontSize: 11, fontWeight: 600, fontFamily: mono,
                    color: C[p.simulated || p.status],
                  }}>{STATUS_LABELS[p.simulated || p.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: C.textLight, fontStyle: "italic" }}>
          No downstream promises depend on this one.
        </div>
      )}

      {simStatus && simStatus !== promise.status && (
        <div style={{
          marginTop: 16, padding: "12px 16px", background: `${C[simStatus]}08`,
          border: `1px solid ${C[simStatus]}20`, borderRadius: 6, fontSize: 13, color: C.text, lineHeight: 1.6,
        }}>
          If <strong>{promise.id}</strong> changes to <strong>{STATUS_LABELS[simStatus]}</strong>,{" "}
          {cascadedAffected.filter(p => p.simulated && p.simulated !== p.status).length > 0
            ? `${cascadedAffected.filter(p => p.simulated && p.simulated !== p.status).length} downstream promise(s) would also be affected.`
            : "no downstream promises would change status."}
        </div>
      )}
    </div>
  );
}
