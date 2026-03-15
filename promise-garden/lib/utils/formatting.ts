const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatPercentInt(value: number): string {
  return `${Math.round(value)}%`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dayOfWeek(iso: string): number {
  return new Date(iso).getDay();
}

export function dayOfMonth(iso: string): number {
  return new Date(iso).getDate();
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function isPromiseDueToday(
  frequency: { type: string; days?: number[]; day?: number },
  today: string
): boolean {
  const dow = dayOfWeek(today);
  const dom = dayOfMonth(today);

  switch (frequency.type) {
    case "daily":
      return true;
    case "specific_days":
      return (frequency.days ?? []).includes(dow);
    case "weekly":
      return frequency.day === dow;
    case "monthly":
      return frequency.day === dom;
    default:
      return false;
  }
}
