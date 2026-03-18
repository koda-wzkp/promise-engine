import React from 'react';
import './NestedPLogo.css';

const LAYERS = [
  { fill: '#1a1a2e', scale: 1 },
  { fill: '#1a5f4a', scale: 0.618 },
  { fill: '#1e40af', scale: 0.382 },
  { fill: '#5b21b6', scale: 0.236 },
  { fill: '#991b1b', scale: 0.146 },
];

const BREATHE_OFFSETS = ['0s', '0.8s', '1.6s', '2.4s', '3.2s'];

/**
 * Small nav-sized nested-P mark (28×28 default).
 */
export const NavMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 340 340"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="nav-mark-svg"
  >
    <defs>
      <path
        id="pp-mark"
        d="M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z"
      />
      <style>{`
        @keyframes pp-breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        .pp-layer { animation: pp-breathe 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pp-layer { animation: none !important; }
        }
      `}</style>
    </defs>
    {LAYERS.map((layer, i) => (
      <use
        key={i}
        href="#pp-mark"
        fill={layer.fill}
        transform={layer.scale === 1 ? undefined : `scale(${layer.scale})`}
        className="pp-layer"
        style={{ animationDelay: BREATHE_OFFSETS[i] }}
      />
    ))}
  </svg>
);

/**
 * Larger hero-sized nested-P mark (120×120 default, responsive).
 */
export const HeroMark = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 340 340"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Promise Pipeline logo — nested P shapes representing trust at every scale"
    className="hero-mark-svg"
  >
    <defs>
      <path
        id="pp-hero"
        d="M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z"
      />
      <style>{`
        @keyframes pp-hero-appear {
          from { opacity: 0; transform: scale(1.08); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pp-hero-breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        .pp-hero-layer {
          opacity: 0;
          animation:
            pp-hero-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            pp-hero-breathe 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-hero-layer {
            opacity: 1;
            animation: none !important;
          }
        }
      `}</style>
    </defs>
    {LAYERS.map((layer, i) => (
      <use
        key={i}
        href="#pp-hero"
        fill={layer.fill}
        transform={layer.scale === 1 ? undefined : `scale(${layer.scale})`}
        className="pp-hero-layer"
        style={{ animationDelay: `${0.1 + i * 0.2}s, ${BREATHE_OFFSETS[i]}` }}
      />
    ))}
  </svg>
);
