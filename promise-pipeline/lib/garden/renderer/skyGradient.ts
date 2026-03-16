/**
 * Sky gradient based on overall garden reliability score.
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
