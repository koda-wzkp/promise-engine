"use client";

interface NetworkCertaintyProps {
  certainty: number;           // 0 to 1
  regimeDistribution: {
    computing: number;
    composting: number;
    transitional: number;
  };
}

export function NetworkCertainty({ certainty, regimeDistribution }: NetworkCertaintyProps) {
  const pct = Math.round(certainty * 100);
  const certColor = pct >= 70 ? "#1a5f4a" : pct >= 40 ? "#78350f" : "#991b1b";

  const computingPct = Math.round(regimeDistribution.computing * 100);
  const compostingPct = Math.round(regimeDistribution.composting * 100);
  const transitionalPct = Math.round(regimeDistribution.transitional * 100);

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-serif font-semibold text-gray-900 mb-4">Verification Dynamics</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-3xl font-bold"
          aria-label={`Bayesian network certainty: ${pct} out of 100`}
          style={{ color: certColor }}
        >
          {pct}
        </span>
        <span className="text-gray-400 text-sm">/100 certainty</span>
      </div>
      <p className="text-xs text-gray-500 mb-4"
        title="How confident we are in the health assessment. Low certainty means many promises are unverified."
      >
        Bayesian certainty — how confident we are in the health assessment.
      </p>

      {/* Regime distribution stacked bar */}
      <div className="mb-2">
        <p className="text-xs text-gray-500 mb-1">Dynamical regime distribution</p>
        <div
          className="flex h-3 rounded-full overflow-hidden"
          aria-label={`Regime distribution: ${computingPct}% computing, ${compostingPct}% composting, ${transitionalPct}% transitional`}
        >
          {computingPct > 0 && (
            <div
              style={{ width: `${computingPct}%`, backgroundColor: "#059669" }}
              title={`Computing: ${computingPct}%`}
            />
          )}
          {transitionalPct > 0 && (
            <div
              style={{ width: `${transitionalPct}%`, backgroundColor: "#2563eb" }}
              title={`Transitional: ${transitionalPct}%`}
            />
          )}
          {compostingPct > 0 && (
            <div
              style={{ width: `${compostingPct}%`, backgroundColor: "#d97706" }}
              title={`Composting: ${compostingPct}%`}
            />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#059669" }} aria-hidden="true" />
            Computing {computingPct}%
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#2563eb" }} aria-hidden="true" />
            Transitional {transitionalPct}%
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#d97706" }} aria-hidden="true" />
            Composting {compostingPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
