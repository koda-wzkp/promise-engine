export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatHealthScore(score: number): string {
  return `${Math.round(score)}/100`;
}

export function computeGrade(healthScore: number): string {
  if (healthScore >= 93) return "A";
  if (healthScore >= 90) return "A-";
  if (healthScore >= 87) return "B+";
  if (healthScore >= 83) return "B";
  if (healthScore >= 80) return "B-";
  if (healthScore >= 77) return "C+";
  if (healthScore >= 73) return "C";
  if (healthScore >= 70) return "C-";
  if (healthScore >= 67) return "D+";
  if (healthScore >= 63) return "D";
  if (healthScore >= 60) return "D-";
  return "F";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}
