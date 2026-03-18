/**
 * Sky gradient based on overall garden reliability score.
 * See also: getSkyGradientByCount for the onboarding / promise-count-based progression.
 */

interface GradientStop {
  minScore: number;
  gradient: string;
}

const GRADIENT_BANDS: GradientStop[] = [
  {
    minScore: 80,
    gradient:
      "linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E0F6FF 70%, #FFF8E1 100%)",
  },
  {
    minScore: 60,
    gradient:
      "linear-gradient(180deg, #90A4AE 0%, #B0BEC5 40%, #CFD8DC 70%, #ECEFF1 100%)",
  },
  {
    minScore: 40,
    gradient:
      "linear-gradient(180deg, #78909C 0%, #90A4AE 40%, #B0BEC5 100%)",
  },
  {
    minScore: 20,
    gradient:
      "linear-gradient(180deg, #546E7A 0%, #78909C 40%, #90A4AE 100%)",
  },
  {
    minScore: 0,
    gradient:
      "linear-gradient(180deg, #37474F 0%, #455A64 40%, #546E7A 100%)",
  },
];

export function getSkyGradient(reliabilityScore: number): string {
  const pct = reliabilityScore * 100;
  for (const band of GRADIENT_BANDS) {
    if (pct >= band.minScore) return band.gradient;
  }
  return GRADIENT_BANDS[GRADIENT_BANDS.length - 1].gradient;
}

/**
 * Sky gradient driven by raw promise count rather than reliability score.
 * Used during onboarding and as the ambient reward signal as the garden grows.
 *
 * 0 promises  — overcast grey (clearcut)
 * 1 promise   — lighter grey with warm horizon band
 * 2 promises  — near-white with wider warm band
 * 3–4         — first blue wash breaking through
 * 5–9         — clear sky emerging
 * 10+         — full blue sky
 */
export function getSkyGradientByCount(count: number): string {
  if (count === 0) {
    return "linear-gradient(180deg, #9ca3af 0%, #d1d5db 100%)";
  }
  if (count === 1) {
    return "linear-gradient(180deg, #d1d5db 0%, #e5e7eb 70%, #fef3c7 100%)";
  }
  if (count === 2) {
    return "linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 55%, #fef3c7 80%, #fdf6b2 100%)";
  }
  if (count < 5) {
    return "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 100%)";
  }
  if (count < 10) {
    return "linear-gradient(180deg, #93c5fd 0%, #dbeafe 100%)";
  }
  return "linear-gradient(180deg, #60a5fa 0%, #bfdbfe 100%)";
}
