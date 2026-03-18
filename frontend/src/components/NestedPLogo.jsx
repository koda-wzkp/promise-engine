import React from 'react';
import './NestedPLogo.css';

/* Fibonacci scales for concentric P layers */
const SCALES = [1, 0.618, 0.382, 0.236, 0.146];

/* Pipeline: light-to-dark (outermost lightest, innermost darkest) */
const PIPELINE_FILLS = ['#b8d4c8', '#6b9e8a', '#1a5f4a', '#134436', '#0d2e24'];

/* Garden: dark-to-light (outermost darkest, innermost lightest) */
const GARDEN_FILLS = ['#0d2e24', '#134436', '#1a5f4a', '#6b9e8a', '#b8d4c8'];

const getLayers = (variant = 'pipeline') => {
  const fills = variant === 'garden' ? GARDEN_FILLS : PIPELINE_FILLS;
  return SCALES.map((scale, i) => ({ fill: fills[i], scale }));
};

const BREATHE_OFFSETS = ['0s', '0.8s', '1.6s', '2.4s', '3.2s'];

/* Raw P path anchored at top-left (0,0) */
const P_PATH = 'M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z';

/**
 * Small nav-sized nested-P mark (28×28 default).
 * Each layer is scaled from (0,0) so smaller P's nest into
 * the top-left corner of the outer P.
 */
export const NavMark = ({ variant = 'pipeline' } = {}) => {
  const layers = getLayers(variant);
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 340 340"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="nav-mark-svg"
    >
      <defs>
        <style>{`
          @keyframes pp-breathe {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.82; }
          }
          .pp-layer {
            animation: pp-breathe 5s ease-in-out infinite;
            transform-origin: 0 0;
          }
          @media (prefers-reduced-motion: reduce) {
            .pp-layer { animation: none !important; }
          }
        `}</style>
      </defs>
      {layers.map((layer, i) => (
        <path
          key={i}
          d={P_PATH}
          fill={layer.fill}
          transform={`scale(${layer.scale})`}
          className="pp-layer"
          style={{ animationDelay: BREATHE_OFFSETS[i] }}
        />
      ))}
    </svg>
  );
};

/**
 * Larger hero-sized nested-P mark (120×120 default, responsive).
 * Staggered entrance animation, then breathing.
 */
export const HeroMark = ({ variant = 'pipeline' } = {}) => {
  const layers = getLayers(variant);
  return (
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
        <style>{`
          @keyframes pp-hero-appear {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes pp-hero-breathe {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.82; }
          }
          .pp-hero-layer {
            transform-origin: 0 0;
            opacity: 0;
            animation:
              pp-hero-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
              pp-hero-breathe 5s ease-in-out 0.6s infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .pp-hero-layer {
              opacity: 1;
              animation: none !important;
            }
          }
        `}</style>
      </defs>
      {layers.map((layer, i) => (
        <path
          key={i}
          d={P_PATH}
          fill={layer.fill}
          transform={`scale(${layer.scale})`}
          className="pp-hero-layer"
          style={{ animationDelay: `${0.1 + i * 0.2}s, ${0.6 + i * 0.2}s` }}
        />
      ))}
    </svg>
  );
};
