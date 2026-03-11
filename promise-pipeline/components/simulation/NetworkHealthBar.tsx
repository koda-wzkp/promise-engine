interface NetworkHealthBarProps {
  score: number;
  label?: string;
  showLabel?: boolean;
}

function healthColor(score: number): string {
  if (score >= 80) return "#1a5f4a";
  if (score >= 60) return "#b45309";
  if (score >= 40) return "#d97706";
  return "#b91c1c";
}

export default function NetworkHealthBar({ score, label, showLabel = true }: NetworkHealthBarProps) {
  const color = healthColor(score);

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{label ?? "Network Health"}</span>
          <span className="font-mono font-medium" style={{ color }}>
            {score}/100
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
