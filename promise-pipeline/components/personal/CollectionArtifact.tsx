"use client";

import { useState } from "react";
import type { Artifact } from "@/lib/types/personal";
import { artifactColor, artifactDescription } from "@/lib/garden/artifactGeneration";

interface CollectionArtifactProps {
  artifact: Artifact;
  promiseBody: string;
  reflection?: string | null;
  fossilized?: boolean;
}

const MATERIAL_EMOJI: Record<string, string> = {
  crystal: "💎",
  bronze:  "🥉",
  amber:   "🍯",
  wood:    "🌿",
  stone:   "🪨",
  smoke:   "🌫️",
};

const GROWTH_EMOJI: Record<string, string> = {
  spreading:   "🍄",
  mycelial:    "🕸️",
  diffuse:     "✨",
  branching:   "🌿",
  vine:        "🌱",
  spiral:      "🐚",
  crystalline: "💠",
  geometric:   "🔷",
  fractal:     "🌀",
};

export function CollectionArtifact({
  artifact,
  promiseBody,
  reflection,
  fossilized = false,
}: CollectionArtifactProps) {
  const [expanded, setExpanded] = useState(false);
  const color = artifactColor(artifact);
  const desc = artifactDescription(artifact);
  const matEmoji = MATERIAL_EMOJI[artifact.visual.material] ?? "✦";
  const growEmoji = GROWTH_EMOJI[artifact.visual.growthPattern] ?? "✦";

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
        fossilized ? "opacity-70" : ""
      }`}
    >
      {/* Visual header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label={`${fossilized ? "Fossil" : "Artifact"}: ${promiseBody}`}
        className="w-full text-left focus-visible:outline-2"
        style={{ outlineColor: color }}
      >
        <div
          className="px-4 py-5 flex items-center gap-3"
          style={{ background: color + "12" }}
        >
          {/* Icon composition */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: color + "22", border: `2px solid ${color}44` }}
            aria-hidden="true"
          >
            {fossilized ? "🪨" : matEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm leading-snug truncate">
              {promiseBody}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>

          <span
            className="text-xs font-medium px-2 py-0.5 rounded flex-shrink-0"
            style={{ background: color + "18", color }}
          >
            {fossilized ? "Fossil" : "Kept"}
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 py-3 border-t bg-white space-y-3">
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-2xl" aria-hidden="true">{growEmoji}</p>
              <p className="text-xs text-gray-400 mt-1 capitalize">{artifact.visual.growthPattern}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Domain:</strong> {artifact.generatedFrom.domain}
                <br />
                <strong>Dwell time:</strong>{" "}
                {Math.round(artifact.generatedFrom.dwellTime)} days
                <br />
                <strong>Verification:</strong> {artifact.generatedFrom.verificationMethod}
                <br />
                <strong>Regime:</strong> {artifact.generatedFrom.kRegime}
              </p>
            </div>
          </div>

          {reflection && (
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400 mb-0.5">Reflection</p>
              <p className="text-sm text-gray-700 italic">&ldquo;{reflection}&rdquo;</p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Added {new Date(artifact.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
