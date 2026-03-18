"use client";

/**
 * GardenTimeLapse
 *
 * Plays a looping time-lapse of the demo garden on the clearcut screen,
 * showing a bare-earth clearing slowly growing into a five-domain forest
 * with a full day/night sky cycle.
 *
 * Architecture:
 *  - Uses the actual GardenView renderer — no pre-rendered assets.
 *  - Feeds it animated copies of the 10 demo promises (status + progress
 *    changing per frame) and a linearly-interpolated sky gradient.
 *  - Throttled to 30 fps via requestAnimationFrame to stay performant on mobile.
 *  - Loops MAX_LOOPS (3) times, then holds on the clearcut state and calls onComplete.
 *
 * Reduced motion:
 *  - Shows the peak garden (all promises mature, full blue sky) for 3 s.
 *  - Crossfades to empty / clearcut over 500 ms via CSS opacity.
 *  - Then calls onComplete. No animation at any stage.
 *
 * Accessibility:
 *  - Entire canvas has role="img" via GardenView with a descriptive aria-label.
 *  - The time-lapse is decorative — the ClearcutOverlay carries all meaning
 *    (text + seed button). Screen reader users hear the label and can
 *    immediately interact with the seed.
 *
 * Integration:
 *  - Parent renders this in the clearcut layout, beneath ClearcutOverlay.
 *  - onComplete: parent transitions to static clearcut view.
 *  - If the user taps the seed during playback, the parent unmounts this
 *    component; the cleanup function cancels the RAF loop.
 */

import { useState, useEffect, useRef } from "react";
import { PersonalPromise } from "@/lib/types/personal";
import { PromiseStatus } from "@/lib/types/promise";
import { GardenView } from "@/components/personal/GardenView";
import { demoPromises, DEMO_ENTRY_TIMES } from "@/lib/data/garden-demo";

// ─── Timing constants ─────────────────────────────────────────────────────────

const LOOP_DURATION = 15;     // seconds per time-lapse cycle
const MAX_LOOPS     = 3;      // play 3 full cycles then settle
const TARGET_FPS    = 30;
const FRAME_MS      = 1000 / TARGET_FPS; // ~33 ms

// ─── Sky keyframes ────────────────────────────────────────────────────────────
// Each entry: [loopTime (s), topColor (hex), bottomColor (hex)]
// Colours are linearly interpolated between keyframes each frame.

const SKY_KEYFRAMES: [number, string, string][] = [
  [0.0,  "#9ca3af", "#d1d5db"],   // pre-dawn    — overcast grey
  [1.5,  "#d1d5db", "#fef3c7"],   // dawn        — warm horizon band
  [3.0,  "#e5e7eb", "#f3f4f6"],   // morning     — near-white
  [5.0,  "#bfdbfe", "#eff6ff"],   // late-morning — first blue wash
  [7.0,  "#93c5fd", "#dbeafe"],   // midday      — blue sky
  [9.0,  "#60a5fa", "#bfdbfe"],   // afternoon   — full blue sky
  [11.0, "#fbbf24", "#60a5fa"],   // golden-hour — warm amber above
  [13.0, "#c2410c", "#1e3a5f"],   // sunset      — deep orange / midnight blue
  [14.5, "#1e293b", "#334155"],   // night       — deep blue
  [15.0, "#9ca3af", "#d1d5db"],   // reset       — matches t=0 for seamless loop
];

// Peak sky used in the reduced-motion static frame
const PEAK_SKY = "linear-gradient(180deg, #60a5fa 0%, #bfdbfe 100%)";
const CLEARCUT_SKY = "linear-gradient(180deg, #9ca3af 0%, #d1d5db 100%)";

// ─── Colour helpers ───────────────────────────────────────────────────────────

function lerpHex(a: string, b: string, t: number): string {
  const r1 = parseInt(a.slice(1, 3), 16);
  const g1 = parseInt(a.slice(3, 5), 16);
  const b1 = parseInt(a.slice(5, 7), 16);
  const r2 = parseInt(b.slice(1, 3), 16);
  const g2 = parseInt(b.slice(3, 5), 16);
  const b2 = parseInt(b.slice(5, 7), 16);

  const r  = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, "0");
  const g  = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, "0");
  const bl = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, "0");

  return `#${r}${g}${bl}`;
}

function computeSkyGradient(loopTime: number): string {
  const t = ((loopTime % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION;

  // Find the surrounding keyframe pair
  let prev = SKY_KEYFRAMES[0];
  let next = SKY_KEYFRAMES[1];

  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    if (t >= SKY_KEYFRAMES[i][0] && t < SKY_KEYFRAMES[i + 1][0]) {
      prev = SKY_KEYFRAMES[i];
      next = SKY_KEYFRAMES[i + 1];
      break;
    }
  }

  const segDuration = next[0] - prev[0];
  const alpha = segDuration > 0 ? (t - prev[0]) / segDuration : 0;

  const topColor = lerpHex(prev[1], next[1], alpha);
  const botColor = lerpHex(prev[2], next[2], alpha);

  return `linear-gradient(180deg, ${topColor} 0%, ${botColor} 100%)`;
}

// ─── Promise animation ────────────────────────────────────────────────────────

/**
 * Compute the visible subset of demo promises with animated status/progress
 * for the given loop time.
 *
 * Each promise enters the scene at its DEMO_ENTRY_TIMES value.
 * From entry time to end-of-loop it progresses through lifecycle stages:
 *   0–65 % of available time: declared (growing), progress 5 → 70
 *   65–100 %:                 verified (mature),  progress 70 → 100
 * Degraded promises stay degraded but grow in the same arc (progress 20 → 80).
 *
 * This creates natural variety: late-entering plants stay young.
 */
function computeAnimatedPromises(loopTime: number): PersonalPromise[] {
  const result: PersonalPromise[] = [];

  for (const demo of demoPromises) {
    const entryTime = DEMO_ENTRY_TIMES[demo.id];
    if (loopTime < entryTime) continue; // not entered yet

    const elapsed    = loopTime - entryTime;
    const available  = LOOP_DURATION - entryTime;
    const t          = Math.min(elapsed / available, 1.0);

    let status: PromiseStatus;
    let progress: number;

    if (demo.status === "degraded") {
      // Stressed plant: always degraded, grows slowly
      status   = "degraded";
      progress = Math.round(t * 60 + 20); // 20 → 80
    } else if (t < 0.65) {
      // Early / growing phase
      status   = "declared";
      progress = Math.round((t / 0.65) * 65 + 5); // 5 → 70
    } else {
      // Mature phase
      status   = "verified";
      progress = Math.round(((t - 0.65) / 0.35) * 30 + 70); // 70 → 100
    }

    result.push({ ...demo, status, progress });
  }

  return result;
}

// ─── Peak frame (reduced motion static snapshot) ─────────────────────────────

const PEAK_PROMISES: PersonalPromise[] = demoPromises.map((p) => ({
  ...p,
  status: (p.status === "degraded" ? "degraded" : "verified") as PromiseStatus,
  progress: p.status === "degraded" ? 60 : 100,
}));

// ─── Component ────────────────────────────────────────────────────────────────

interface GardenTimeLapseProps {
  /** Called once the time-lapse finishes all loops and settles on clearcut */
  onComplete: () => void;
  /** Minimum height forwarded to the internal GardenView */
  minHeight?: string;
}

type FrameState = {
  promises: PersonalPromise[];
  sky: string;
};

export function GardenTimeLapse({
  onComplete,
  minHeight = "100svh",
}: GardenTimeLapseProps) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const [frame, setFrame] = useState<FrameState>({
    promises: [],
    sky: CLEARCUT_SKY,
  });

  // opacity used for the reduced-motion crossfade
  const [wrapperOpacity, setWrapperOpacity] = useState(1);

  const startTimeRef  = useRef<number>(0);
  const lastFrameRef  = useRef<number>(0);
  const rafRef        = useRef<number>(0);
  const doneRef       = useRef<boolean>(false);

  // ── Reduced-motion path ──────────────────────────────────────────────────
  useEffect(() => {
    if (!reducedMotion) return;

    // Show the peak garden immediately
    setFrame({ promises: PEAK_PROMISES, sky: PEAK_SKY });

    // After 3 s start fading out; after another 0.5 s call onComplete
    let doneTimer: ReturnType<typeof setTimeout>;
    const fadeTimer = setTimeout(() => {
      setWrapperOpacity(0);
      doneTimer = setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer!);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Full animation path ──────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;

    startTimeRef.current = performance.now();
    lastFrameRef.current = 0;

    function tick(now: number) {
      if (doneRef.current) return;

      // Throttle to ~30 fps
      if (now - lastFrameRef.current < FRAME_MS) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrameRef.current = now;

      const elapsed        = (now - startTimeRef.current) / 1000; // seconds
      const completedLoops = Math.floor(elapsed / LOOP_DURATION);

      // All loops done — settle on clearcut and signal the parent
      if (completedLoops >= MAX_LOOPS) {
        if (!doneRef.current) {
          doneRef.current = true;
          setFrame({ promises: [], sky: CLEARCUT_SKY });
          onComplete();
        }
        return;
      }

      const loopTime = elapsed % LOOP_DURATION;
      const promises = computeAnimatedPromises(loopTime);
      const sky      = computeSkyGradient(loopTime);

      setFrame({ promises, sky });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      // Cancels the loop when the parent unmounts this component
      // (e.g., user tapped the seed mid-animation).
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        opacity: wrapperOpacity,
        transition: reducedMotion ? "opacity 0.5s ease" : "none",
      }}
    >
      <GardenView
        promises={frame.promises}
        onUpdateStatus={() => {}}   // time-lapse is read-only
        forceRender                 // render canvas even when promises is []
        skyGradientOverride={frame.sky}
        minHeight={minHeight}
        gardenAriaLabel="Demo garden growing from empty clearing to a thriving forest with plants across five life domains. Tap the seed button to start your own garden."
      />
    </div>
  );
}
