"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";

/* ─── Constants ─── */

export const SCALES = [1, 0.618, 0.382, 0.236, 0.146];

export const PIPELINE_FILLS = [
  "#c93b3b",
  "#7b41d6",
  "#3e60cf",
  "#2a2a4e",
  "#2a8f6a",
];

export const GARDEN_FILLS = [
  "#2a8f6a",
  "#2a2a4e",
  "#3e60cf",
  "#7b41d6",
  "#c93b3b",
];

export const P_PATH =
  "M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z";

export const P_PATH_ALT =
  "M 0,340 L 0,0 L 220,0 C 340,0 340,300 220,300 L 60,300 L 60,340 Z";

export const STATUS_COLORS: Record<string, string> = {
  kept: "#2a8f6a",
  broken: "#c93b3b",
  pending: "#b45309",
  blocked: "#6b7280",
  renegotiated: "#7b41d6",
};

export const STATUS_KEYS = Object.keys(STATUS_COLORS);

/* ─── Helpers ─── */

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

function getPointOnP(t: number): { x: number; y: number } {
  // Approximate points along the P path
  const segments = [
    { x: 0, y: 340 },
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 340, y: 140 },
    { x: 200, y: 280 },
    { x: 60, y: 280 },
    { x: 60, y: 340 },
    { x: 0, y: 340 },
  ];
  const idx = t * (segments.length - 1);
  const i = Math.floor(idx);
  const frac = idx - i;
  const a = segments[Math.min(i, segments.length - 1)];
  const b = segments[Math.min(i + 1, segments.length - 1)];
  return { x: lerp(a.x, b.x, frac), y: lerp(a.y, b.y, frac) };
}

/* ─── Mode Definitions ─── */

export interface ModeDefinition {
  id: string;
  name: string;
  category: string;
  concept: string;
  description: string;
  citation?: string;
}

export const CATEGORIES = [
  "Foundation",
  "State",
  "Dynamics",
  "Structure",
  "Meta",
  "Failure",
  "Recovery",
];

export const MODES: ModeDefinition[] = [
  { id: "breathe", name: "Breathe", category: "Foundation", concept: "Autonomy", description: "Each layer pulses independently — agents breathe at their own rhythm." },
  { id: "cascade", name: "Cascade", category: "Dynamics", concept: "Cascade Propagation", description: "Failure ripples outward from a broken promise layer." },
  { id: "flow", name: "Flow", category: "Dynamics", concept: "Data Flow", description: "Information flows through the promise pipeline." },
  { id: "peel", name: "Peel", category: "Structure", concept: "Legibility", description: "Layers separate to reveal structure — making promises legible." },
  { id: "morph", name: "Morph", category: "State", concept: "Status Transition", description: "Promises shift between states — kept, broken, pending." },
  { id: "grow", name: "Grow", category: "Dynamics", concept: "Promise Building", description: "Promises build outward from the core — a healthy network expanding." },
  { id: "glitch", name: "Glitch", category: "Failure", concept: "Structural Conflict", description: "Layers jitter and misalign — something is structurally wrong." },
  { id: "recurse", name: "Recurse", category: "Meta", concept: "Scale Invariance", description: "NCTP — promises nest within promises, P's all the way down." },
  { id: "intervention", name: "Intervention", category: "Recovery", concept: "Targeted Heal", description: "A heal propagates outward from the innermost layer." },
  { id: "shadow", name: "Shadow", category: "Failure", concept: "Shadow Node", description: "Hidden layers emerge — promises you didn't know existed." },
  { id: "pulse", name: "Pulse", category: "Foundation", concept: "Heartbeat", description: "The network's heartbeat — a rhythmic scale pulse." },
  { id: "rotate", name: "Rotate", category: "Dynamics", concept: "Perspective Shift", description: "View the promise structure from different angles." },
  { id: "scatter", name: "Scatter", category: "Failure", concept: "Network Fragmentation", description: "Layers drift apart — the network is fragmenting." },
  { id: "converge", name: "Converge", category: "Recovery", concept: "Alignment", description: "Scattered layers reconverge — alignment restored." },
  { id: "wave", name: "Wave", category: "Dynamics", concept: "Ripple Effect", description: "A wave passes through the layers — cause and effect." },
  { id: "fade", name: "Fade", category: "State", concept: "Degradation", description: "Layers fade — promises losing force over time." },
  { id: "strobe", name: "Strobe", category: "State", concept: "Verification Pulse", description: "Quick flashes — active verification in progress." },
  { id: "orbit", name: "Orbit", category: "Structure", concept: "Orbital Dependencies", description: "Layers orbit the center — dependencies in motion." },
  { id: "shatter", name: "Shatter", category: "Failure", concept: "Catastrophic Failure", description: "Layers break apart violently — total network collapse." },
  { id: "heal", name: "Heal", category: "Recovery", concept: "Recovery", description: "Layers reassemble — the network is recovering." },
  { id: "tunnel", name: "Tunnel", category: "Structure", concept: "Depth", description: "Zooming through nested layers — exploring depth." },
  { id: "bloom", name: "Bloom", category: "Dynamics", concept: "Emergence", description: "Layers bloom outward like a flower — emergent properties." },
  { id: "compress", name: "Compress", category: "State", concept: "Pressure", description: "Layers compress inward — external pressure on the network." },
  { id: "spiral", name: "Spiral", category: "Meta", concept: "Feedback Loop", description: "Layers spiral — feedback loops in the network." },
  { id: "flicker", name: "Flicker", category: "State", concept: "Uncertainty", description: "Opacity flickers — uncertain promise states." },
  { id: "ripple", name: "Ripple", category: "Dynamics", concept: "Downstream Effect", description: "Concentric ripples from center — downstream effects spreading." },
  { id: "stack", name: "Stack", category: "Structure", concept: "Composition", description: "Layers stack and separate — composable trust primitives." },
  { id: "freeze", name: "Freeze", category: "State", concept: "Stasis", description: "All animation stops — the network is frozen." },
];

/* ─── Props ─── */

interface NestedPLogoProps {
  mode: string;
  size?: number;
  cascadeTarget?: number | null;
  onLayerClick?: (index: number) => void;
  isHovered?: boolean;
  className?: string;
  reducedMotion?: boolean;
}

/* ─── Component ─── */

export function NestedPLogo({
  mode,
  size = 300,
  cascadeTarget = null,
  onLayerClick,
  isHovered = false,
  className = "",
  reducedMotion = false,
}: NestedPLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const raf = useRef<number>(0);
  const startTime = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  // Reduced motion check
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  const shouldAnimate = !reducedMotion && !prefersReducedMotion;

  // Mobile detection for throttling
  const isMobile =
    typeof window !== "undefined" && (size < 48 || window.innerWidth < 768);
  const frameInterval = isMobile ? 33 : 16;

  // IntersectionObserver for visibility
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Layer state refs for animation
  const layerStates = useRef(
    SCALES.map((scale, i) => ({
      scale,
      opacity: 1,
      fill: PIPELINE_FILLS[i],
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      pathD: P_PATH,
    }))
  );

  // Reset layers when mode changes
  useEffect(() => {
    layerStates.current = SCALES.map((scale, i) => ({
      scale,
      opacity: 1,
      fill: PIPELINE_FILLS[i],
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      pathD: P_PATH,
    }));
    startTime.current = 0;
  }, [mode]);

  // Compute a single frame's layer states based on mode
  const computeFrame = useCallback(
    (elapsed: number) => {
      const t = elapsed / 1000; // seconds
      const layers = layerStates.current;

      for (let i = 0; i < 5; i++) {
        // Reset to defaults
        layers[i].scale = SCALES[i];
        layers[i].opacity = 1;
        layers[i].fill = PIPELINE_FILLS[i];
        layers[i].offsetX = 0;
        layers[i].offsetY = 0;
        layers[i].rotation = 0;
        layers[i].pathD = P_PATH;
      }

      switch (mode) {
        case "breathe": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 1.2 + i * 0.8;
            layers[i].opacity = 0.82 + 0.18 * Math.sin(phase);
          }
          break;
        }

        case "cascade": {
          if (cascadeTarget !== null) {
            const cascadeTime = t % 4;
            for (let i = 0; i < 5; i++) {
              const delay = i * 0.3;
              const progress = Math.max(0, Math.min(1, (cascadeTime - delay) / 0.6));
              if (progress > 0) {
                layers[i].opacity = 1 - progress * 0.7;
                layers[i].fill = lerpColor(PIPELINE_FILLS[i], "#c93b3b", progress);
                layers[i].scale = SCALES[i] * (1 + progress * 0.05);
              }
            }
          } else {
            // Idle cascade — gentle outer ripple
            for (let i = 0; i < 5; i++) {
              const phase = t * 2 + i * 0.5;
              layers[i].opacity = 0.85 + 0.15 * Math.sin(phase);
            }
          }
          break;
        }

        case "flow": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 2 - i * 0.6;
            const wave = Math.sin(phase) * 0.5 + 0.5;
            layers[i].opacity = 0.5 + wave * 0.5;
            layers[i].fill = lerpColor(PIPELINE_FILLS[i], PIPELINE_FILLS[Math.min(i + 1, 4)], wave * 0.3);
          }
          break;
        }

        case "peel": {
          const peelAmount = isHovered ? Math.min(t * 2, 1) : Math.max(1 - t * 2, 0);
          for (let i = 0; i < 5; i++) {
            const spread = peelAmount * (4 - i) * 12;
            layers[i].offsetX = spread;
            layers[i].offsetY = -spread * 0.5;
          }
          break;
        }

        case "morph": {
          for (let i = 0; i < 5; i++) {
            const cycle = (t * 0.5 + i * 0.7) % (STATUS_KEYS.length);
            const idx = Math.floor(cycle);
            const frac = cycle - idx;
            const colorA = STATUS_COLORS[STATUS_KEYS[idx]];
            const colorB = STATUS_COLORS[STATUS_KEYS[(idx + 1) % STATUS_KEYS.length]];
            layers[i].fill = lerpColor(colorA, colorB, frac);
          }
          break;
        }

        case "grow": {
          for (let i = 4; i >= 0; i--) {
            const delay = (4 - i) * 0.8;
            const progress = Math.max(0, Math.min(1, (t - delay) / 1.2));
            const eased = 1 - Math.pow(1 - progress, 3);
            layers[i].scale = SCALES[i] * eased;
            layers[i].opacity = eased;
          }
          // After all grown, breathe
          if (t > 6) {
            for (let i = 0; i < 5; i++) {
              const phase = (t - 6) * 1.2 + i * 0.8;
              layers[i].opacity = 0.82 + 0.18 * Math.sin(phase);
              layers[i].scale = SCALES[i];
            }
          }
          break;
        }

        case "glitch": {
          const rand = seededRand(Math.floor(t * 8));
          for (let i = 0; i < 5; i++) {
            const jitterX = (rand() - 0.5) * 20;
            const jitterY = (rand() - 0.5) * 20;
            layers[i].offsetX = jitterX;
            layers[i].offsetY = jitterY;
            if (rand() > 0.7) {
              layers[i].opacity = 0.3 + rand() * 0.7;
            }
            if (rand() > 0.85) {
              layers[i].fill = "#c93b3b";
            }
          }
          break;
        }

        case "recurse": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 0.8 + i * 1.2;
            const pulse = Math.sin(phase) * 0.1;
            layers[i].scale = SCALES[i] * (1 + pulse);
            layers[i].opacity = 0.7 + 0.3 * Math.abs(Math.sin(phase * 0.5));
          }
          break;
        }

        case "intervention": {
          // Heal from innermost outward
          for (let i = 4; i >= 0; i--) {
            const delay = (4 - i) * 0.5;
            const progress = Math.max(0, Math.min(1, ((t % 5) - delay) / 1.0));
            layers[i].fill = lerpColor(PIPELINE_FILLS[i], "#2a8f6a", progress);
            if (progress > 0) {
              layers[i].scale = SCALES[i] * (1 + Math.sin(progress * Math.PI) * 0.03);
            }
          }
          break;
        }

        case "shadow": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 0.6 + i * 1.0;
            const reveal = Math.sin(phase) * 0.5 + 0.5;
            layers[i].opacity = 0.2 + reveal * 0.8;
            layers[i].fill = lerpColor("#1a1a2e", PIPELINE_FILLS[i], reveal);
          }
          break;
        }

        case "pulse": {
          const beat = Math.sin(t * 4) * 0.5 + 0.5;
          for (let i = 0; i < 5; i++) {
            const delay = i * 0.15;
            const localBeat = Math.sin((t - delay) * 4) * 0.5 + 0.5;
            layers[i].scale = SCALES[i] * (0.95 + localBeat * 0.1);
          }
          break;
        }

        case "rotate": {
          for (let i = 0; i < 5; i++) {
            layers[i].rotation = t * 15 * (i % 2 === 0 ? 1 : -1) * (1 - i * 0.15);
          }
          break;
        }

        case "scatter": {
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + t * 0.3;
            const dist = 15 + Math.sin(t * 0.5 + i) * 10;
            layers[i].offsetX = Math.cos(angle) * dist;
            layers[i].offsetY = Math.sin(angle) * dist;
            layers[i].opacity = 0.6 + 0.4 * Math.sin(t + i);
          }
          break;
        }

        case "converge": {
          const progress = Math.min(1, t / 3);
          const eased = 1 - Math.pow(1 - progress, 3);
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const dist = 30 * (1 - eased);
            layers[i].offsetX = Math.cos(angle) * dist;
            layers[i].offsetY = Math.sin(angle) * dist;
          }
          // After converge, breathe
          if (t > 3) {
            for (let i = 0; i < 5; i++) {
              const phase = (t - 3) * 1.2 + i * 0.8;
              layers[i].opacity = 0.82 + 0.18 * Math.sin(phase);
            }
          }
          break;
        }

        case "wave": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 3 - i * 0.8;
            layers[i].offsetY = Math.sin(phase) * 8;
            layers[i].opacity = 0.7 + 0.3 * Math.cos(phase);
          }
          break;
        }

        case "fade": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 0.3 + i * 0.5;
            layers[i].opacity = 0.3 + 0.7 * (Math.sin(phase) * 0.5 + 0.5);
          }
          break;
        }

        case "strobe": {
          for (let i = 0; i < 5; i++) {
            const phase = t * 6 + i * 1.2;
            layers[i].opacity = Math.sin(phase) > 0.3 ? 1 : 0.2;
          }
          break;
        }

        case "orbit": {
          for (let i = 1; i < 5; i++) {
            const angle = t * (1 + i * 0.3) + (i * Math.PI * 2) / 5;
            const radius = 5 + i * 2;
            layers[i].offsetX = Math.cos(angle) * radius;
            layers[i].offsetY = Math.sin(angle) * radius;
          }
          break;
        }

        case "shatter": {
          const rand = seededRand(42);
          for (let i = 0; i < 5; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = Math.min(t * 15, 40 + rand() * 30);
            layers[i].offsetX = Math.cos(angle) * dist;
            layers[i].offsetY = Math.sin(angle) * dist;
            layers[i].rotation = t * 30 * (rand() > 0.5 ? 1 : -1);
            layers[i].opacity = Math.max(0, 1 - t * 0.15);
          }
          break;
        }

        case "heal": {
          const healProgress = Math.min(1, t / 4);
          const eased = 1 - Math.pow(1 - healProgress, 2);
          const rand = seededRand(42);
          for (let i = 0; i < 5; i++) {
            const angle = rand() * Math.PI * 2;
            const maxDist = 40 + rand() * 30;
            layers[i].offsetX = Math.cos(angle) * maxDist * (1 - eased);
            layers[i].offsetY = Math.sin(angle) * maxDist * (1 - eased);
            layers[i].rotation = 60 * (rand() > 0.5 ? 1 : -1) * (1 - eased);
            layers[i].opacity = 0.3 + 0.7 * eased;
            layers[i].fill = lerpColor("#c93b3b", PIPELINE_FILLS[i], eased);
          }
          break;
        }

        case "tunnel": {
          for (let i = 0; i < 5; i++) {
            const phase = (t * 0.8 + i * 0.4) % 3;
            const zoom = phase < 1.5 ? phase / 1.5 : 2 - phase / 1.5;
            layers[i].scale = SCALES[i] * (0.8 + zoom * 0.4);
            layers[i].opacity = 0.5 + zoom * 0.5;
          }
          break;
        }

        case "bloom": {
          for (let i = 0; i < 5; i++) {
            const delay = i * 0.6;
            const phase = Math.max(0, (t - delay) % 5);
            const bloom = phase < 2 ? Math.sin((phase / 2) * Math.PI) : 0;
            layers[i].scale = SCALES[i] * (1 + bloom * 0.15);
            layers[i].opacity = 0.7 + bloom * 0.3;
          }
          break;
        }

        case "compress": {
          const pressure = Math.sin(t * 1.5) * 0.5 + 0.5;
          for (let i = 0; i < 5; i++) {
            layers[i].scale = SCALES[i] * (1 - pressure * 0.2);
            layers[i].opacity = 0.8 + pressure * 0.2;
          }
          break;
        }

        case "spiral": {
          for (let i = 0; i < 5; i++) {
            const angle = t * 2 + i * 1.2;
            const radius = 3 + i * 2;
            layers[i].offsetX = Math.cos(angle) * radius;
            layers[i].offsetY = Math.sin(angle) * radius;
            layers[i].scale = SCALES[i] * (0.95 + 0.1 * Math.sin(t + i));
          }
          break;
        }

        case "flicker": {
          const rand = seededRand(Math.floor(t * 5));
          for (let i = 0; i < 5; i++) {
            layers[i].opacity = 0.4 + rand() * 0.6;
          }
          break;
        }

        case "ripple": {
          for (let i = 4; i >= 0; i--) {
            const delay = (4 - i) * 0.4;
            const phase = (t * 2 - delay) % 4;
            const ripple = phase < 2 ? Math.sin((phase / 2) * Math.PI) : 0;
            layers[i].scale = SCALES[i] * (1 + ripple * 0.08);
            layers[i].opacity = 0.7 + ripple * 0.3;
          }
          break;
        }

        case "stack": {
          const spread = Math.sin(t * 0.8) * 0.5 + 0.5;
          for (let i = 0; i < 5; i++) {
            layers[i].offsetY = -spread * i * 8;
            layers[i].opacity = 0.8 + 0.2 * Math.cos(t + i);
          }
          break;
        }

        case "freeze":
        default:
          // Static — no animation applied, use defaults
          break;
      }
    },
    [mode, cascadeTarget, isHovered]
  );

  // Animation loop
  useEffect(() => {
    if (!shouldAnimate || mode === "freeze") return;

    let lastFrame = 0;

    const tick = (ts: number) => {
      if (!startTime.current) startTime.current = ts;

      if (ts - lastFrame < frameInterval) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      lastFrame = ts;

      if (!isVisible) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = ts - startTime.current;
      computeFrame(elapsed);

      // Apply to DOM directly for performance
      const svg = svgRef.current;
      if (!svg) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      const paths = svg.querySelectorAll<SVGPathElement>("[data-layer]");
      paths.forEach((path, i) => {
        const layer = layerStates.current[i];
        if (!layer) return;
        path.setAttribute("d", layer.pathD);
        path.setAttribute("fill", layer.fill);
        path.setAttribute("opacity", String(layer.opacity));
        const tx = layer.offsetX;
        const ty = layer.offsetY;
        const r = layer.rotation;
        path.setAttribute(
          "transform",
          `translate(${tx}, ${ty}) rotate(${r}, 170, 170) scale(${layer.scale})`
        );
      });

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [shouldAnimate, mode, isVisible, frameInterval, computeFrame]);

  // Compute initial static frame for SSR / reduced motion
  const staticLayers = useMemo(() => {
    const layers = SCALES.map((scale, i) => ({
      scale,
      opacity: 1,
      fill: PIPELINE_FILLS[i],
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      pathD: P_PATH,
    }));
    return layers;
  }, []);

  return (
    <div ref={containerRef} className={`inline-block ${className}`} style={{ overflow: "visible" }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="-30 -30 420 420"
        style={{ overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Promise Pipeline nested P logo"
      >
        <defs>
          <filter id="pp-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {staticLayers.map((layer, i) => (
          <path
            key={i}
            data-layer={i}
            d={layer.pathD}
            fill={layer.fill}
            opacity={layer.opacity}
            transform={`translate(${layer.offsetX}, ${layer.offsetY}) rotate(${layer.rotation}, 170, 170) scale(${layer.scale})`}
            style={{ cursor: onLayerClick ? "pointer" : undefined }}
            onClick={onLayerClick ? () => onLayerClick(i) : undefined}
          />
        ))}
      </svg>
    </div>
  );
}

export default NestedPLogo;
