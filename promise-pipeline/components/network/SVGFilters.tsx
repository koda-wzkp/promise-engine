/**
 * Shared SVG filter definitions used across all three visualization views.
 * Include this <defs> block once per SVG.
 */
export default function SVGFilters() {
  return (
    <defs>
      {/* Organic texture for terrain/layers */}
      <filter id="organic-texture" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves={4}
          seed={1}
          result="turb"
        />
        <feDisplacementMap in="SourceGraphic" in2="turb" scale={3} />
      </filter>

      {/* Subtle texture for strata layers */}
      <filter id="strata-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.03"
          numOctaves={3}
          seed={7}
          result="grain"
        />
        <feColorMatrix
          type="saturate"
          values="0"
          in="grain"
          result="gray-grain"
        />
        <feBlend in="SourceGraphic" in2="gray-grain" mode="soft-light" />
      </filter>

      {/* Glow for cascade source nodes */}
      <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Stronger glow for headwater springs */}
      <filter id="spring-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={5} result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Atmospheric depth blur */}
      <filter id="depth-blur" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={1.5} />
      </filter>

      {/* Red haze for violated trees */}
      <filter id="red-haze" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={6} result="blur" />
        <feColorMatrix
          type="matrix"
          in="blur"
          values="1 0 0 0 0.2  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0"
        />
      </filter>

      {/* Canopy edge organic distortion */}
      <filter id="canopy-wobble" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.06"
          numOctaves={2}
          seed={3}
          result="wobble"
        />
        <feDisplacementMap in="SourceGraphic" in2="wobble" scale={2} />
      </filter>

      {/* Crack pattern for violated strata blocks */}
      <pattern
        id="crack-pattern"
        patternUnits="userSpaceOnUse"
        width={16}
        height={16}
        patternTransform="rotate(30)"
      >
        <line x1={0} y1={0} x2={10} y2={16} stroke="#991b1b" strokeWidth={0.8} opacity={0.5} />
        <line x1={8} y1={0} x2={16} y2={10} stroke="#991b1b" strokeWidth={0.5} opacity={0.3} />
      </pattern>

      {/* Arrow markers */}
      <marker
        id="stream-arrow"
        viewBox="0 0 8 6"
        refX={8}
        refY={3}
        markerWidth={6}
        markerHeight={4}
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" opacity={0.5} />
      </marker>
    </defs>
  );
}
