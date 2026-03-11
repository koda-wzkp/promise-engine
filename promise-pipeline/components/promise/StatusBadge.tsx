import { PromiseStatus } from "@/lib/types/promise";
import { statusColors, statusBgColors, statusLabels } from "@/lib/utils/colors";

interface StatusBadgeProps {
  status: PromiseStatus;
  size?: "sm" | "md";
  simulated?: boolean;
}

export default function StatusBadge({ status, size = "md", simulated }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${simulated ? "ring-2 ring-offset-1 ring-yellow-400" : ""}`}
      style={{
        color: statusColors[status],
        backgroundColor: statusBgColors[status],
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
