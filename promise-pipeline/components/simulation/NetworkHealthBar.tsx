interface NetworkHealthBarProps {
  score: number;
  label?: string;
  showLabel?: boolean;
}

function healthColor(score: number): string {
  if (score >= 80) return "#1a5f4a";
  if (score >= 60) return "#78350f";
  if (score >= 40) return "#78350f";
  return "#991b1b";
}

export default function NetworkHealthBar({ score, label, showLabel = true }: NetworkHealthBarProps) {
  const color = healthColor(score);

  return (
    <div className="space-y-1" role="meter" aria-label={`${label ?? "Network Health"} score: ${score} out of 100`} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
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
