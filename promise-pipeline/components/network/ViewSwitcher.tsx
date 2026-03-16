"use client";

export type ViewMode = "watershed" | "canopy" | "strata";

interface ViewSwitcherProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const views: { id: ViewMode; label: string; description: string }[] = [
  {
    id: "watershed",
    label: "Watershed",
    description: "Top-down flow: roots at top, dependents flow downward like tributaries",
  },
  {
    id: "canopy",
    label: "Canopy",
    description: "Bottom-up tree: root promises are trunks, dependents branch upward",
  },
  {
    id: "strata",
    label: "Strata",
    description: "Geological layers: promises grouped by domain into horizontal bands",
  },
];

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5" role="tablist" aria-label="Visualization mode">
      {views.map((view) => (
        <button
          key={view.id}
          role="tab"
          aria-selected={activeView === view.id}
          aria-label={`${view.label}: ${view.description}`}
          onClick={() => onViewChange(view.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeView === view.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
