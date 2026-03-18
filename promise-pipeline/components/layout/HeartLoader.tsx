"use client";

/**
 * HeartLoader — the infini-P unfolds into a heart, beats, then folds back.
 *
 * Geometry: two P shapes (original + horizontal mirror) each rotated ±35°
 * so the bowls form the heart's lobes and the stems converge at the point.
 * Each half carries 5 Fibonacci-scaled nested layers (garden palette).
 *
 * Animation phases (5 s cycle):
 *   0–18 %  P rests at center
 *  18–38 %  halves split and rotate into heart
 *  38–68 %  heart holds, double-pulse beat
 *  68–88 %  halves rotate back, mirror fades
 *  88–100%  P rests (seamless loop)
 */

const P_PATH =
  "M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z";
const P_MIRROR =
  "M 340,340 L 340,0 L 140,0 C 0,0 0,280 140,280 L 280,280 L 280,340 Z";

/* Pipeline variant: red → purple → blue → navy → teal */
const LAYERS = [
  { fill: "#c93b3b", scale: 1 },
  { fill: "#7b41d6", scale: 0.618 },
  { fill: "#3e60cf", scale: 0.382 },
  { fill: "#2a2a4e", scale: 0.236 },
  { fill: "#2a8f6a", scale: 0.146 },
];

export function HeartLoader({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Loading"
    >
      <defs>
        <style>{`
          /* ── right lobe (original P) ── */
          .hl-right {
            animation: hl-unfold-r 5s ease-in-out infinite;
          }

          /* ── left lobe (mirrored P) ── */
          .hl-left {
            animation: hl-unfold-l 5s ease-in-out infinite;
          }

          /* ── heartbeat wrapper ── */
          .hl-pulse {
            animation: hl-beat 5s ease-in-out infinite;
            transform-origin: 240px 340px;
          }

          /*
           * Right half: P centered → rotate CW into right heart lobe.
           * The bowl of the P becomes the top-right lobe, the stem
           * points down toward the heart's bottom point.
           *
           * P state:     translate(70,70)   rotate(0)    scale(1)   translate(0,0)
           * Heart state: translate(240,440)  rotate(-45)  scale(0.5) translate(-30,-340)
           */
          @keyframes hl-unfold-r {
            0%, 18% {
              transform:
                translate(70px, 70px)
                rotate(0deg)
                scale(1)
                translate(0px, 0px);
            }
            38%, 68% {
              transform:
                translate(240px, 430px)
                rotate(-40deg)
                scale(0.5)
                translate(10px, -340px);
            }
            88%, 100% {
              transform:
                translate(70px, 70px)
                rotate(0deg)
                scale(1)
                translate(0px, 0px);
            }
          }

          /*
           * Left half: starts collapsed at heart pivot → grows + rotates
           * into left heart lobe, then collapses back.
           *
           * P state:     translate(240,430) rotate(0)    scale(0.001) translate(-350,-340)
           * Heart state: translate(240,430) rotate(40)   scale(0.5)   translate(-350,-340)
           */
          @keyframes hl-unfold-l {
            0%, 18% {
              transform:
                translate(240px, 430px)
                rotate(0deg)
                scale(0.001)
                translate(-350px, -340px);
              opacity: 0;
            }
            38%, 68% {
              transform:
                translate(240px, 430px)
                rotate(40deg)
                scale(0.5)
                translate(-350px, -340px);
              opacity: 1;
            }
            88%, 100% {
              transform:
                translate(240px, 430px)
                rotate(0deg)
                scale(0.001)
                translate(-350px, -340px);
              opacity: 0;
            }
          }

          /* Lub-dub while in heart formation */
          @keyframes hl-beat {
            0%, 40%, 62%, 100% { transform: scale(1); }
            47% { transform: scale(1.07); }
            50% { transform: scale(1); }
            55% { transform: scale(1.05); }
            58% { transform: scale(1); }
          }

          @media (prefers-reduced-motion: reduce) {
            .hl-right, .hl-left, .hl-pulse {
              animation: none !important;
            }
            .hl-right {
              transform: translate(70px, 70px);
            }
            .hl-left {
              opacity: 0;
            }
          }
        `}</style>
      </defs>

      <g className="hl-pulse">
        {/* Right lobe — original P path, layers scale from (0,0) */}
        <g className="hl-right">
          {LAYERS.map((l, i) => (
            <path
              key={`r${i}`}
              d={P_PATH}
              fill={l.fill}
              transform={`scale(${l.scale})`}
            />
          ))}
        </g>

        {/* Left lobe — mirrored P path, layers scale from (340,0) */}
        <g className="hl-left">
          {LAYERS.map((l, i) => (
            <path
              key={`l${i}`}
              d={P_MIRROR}
              fill={l.fill}
              transform={`translate(${(340 * (1 - l.scale)).toFixed(1)}, 0) scale(${l.scale})`}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
