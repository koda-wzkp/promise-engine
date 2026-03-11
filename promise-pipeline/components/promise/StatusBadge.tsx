import { PromiseStatus } from "@/lib/types/promise";
import { statusColors, statusBgColors, statusLabels } from "@/lib/utils/colors";

interface StatusBadgeProps {
  status: PromiseStatus;
  size?: "sm" | "md";
  simulated?: boolean;
}

export default function StatusBadge({ status, size = "md", simulated }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClasses} ${simulated ? "ring-2 ring-offset-1 ring-yellow-400" : ""}`}
      style={{
        color: statusColors[status],
        backgroundColor: statusBgColors[status],
        border: `1px solid ${statusColors[status]}20`,
      }}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${simulated ? "cascade-pulse" : ""}`}
        style={{ backgroundColor: statusColors[status] }}
      />
      {statusLabels[status]}
      {simulated && <span className="text-[10px] text-yellow-600">(sim)</span>}
    </span>
  );
}
