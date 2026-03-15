export type CheckInResponse = "kept" | "partial" | "missed";

export interface CheckIn {
  id: string;
  promiseId: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD), one per promise per day
  response: CheckInResponse;
  reflection?: string;
  createdAt: string; // ISO timestamp
}

export const checkInResponseMeta: Record<
  CheckInResponse,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  kept: {
    label: "Kept",
    color: "#14532d",
    bgColor: "#f0fdf4",
    icon: "check",
  },
  partial: {
    label: "Partially",
    color: "#78350f",
    bgColor: "#fffbeb",
    icon: "minus",
  },
  missed: {
    label: "Missed",
    color: "#991b1b",
    bgColor: "#fef2f2",
    icon: "x",
  },
};
