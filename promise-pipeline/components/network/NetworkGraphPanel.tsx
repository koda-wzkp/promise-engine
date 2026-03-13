"use client";

import { useState, useMemo } from "react";
import { Promise as PromiseType, Agent, Domain } from "@/lib/types/promise";
import { CascadeResult } from "@/lib/types/simulation";
import ViewSwitcher, { GraphView } from "./ViewSwitcher";
import PromiseGraph from "./PromiseGraph";
import WatershedView from "./WatershedView";
import CanopyView from "./CanopyView";
import StrataView from "./StrataView";
import { SimulationState } from "./types";
import { useContainerSize } from "@/lib/utils/useContainerSize";

interface NetworkGraphPanelProps {
  promises: PromiseType[];
  agents: Agent[];
  domains: Domain[];
  width?: number;
  height?: number;
  cascadeResult?: CascadeResult | null;
  selectedPromise?: string | null;
  onSelectPromise?: (id: string) => void;
}

export default function NetworkGraphPanel({
  promises,
  agents,
  domains,
  width: propWidth,
  height: propHeight = 700,
  cascadeResult = null,
  selectedPromise = null,
  onSelectPromise,
}: NetworkGraphPanelProps) {
  const [view, setView] = useState<GraphView>("watershed");
  const { ref: containerRef, width: measuredW, height: measuredH } = useContainerSize(
    propWidth ?? 900,
    propHeight,
  );

  // Use measured dimensions (responsive) unless explicit width/height props are given
  const width = propWidth ?? measuredW;
  const height = propWidth ? propHeight : measuredH;

  const simulationState: SimulationState = useMemo(
    () => ({ cascadeResult, selectedPromise }),
    [cascadeResult, selectedPromise],
  );

  const handlePromiseClick = (id: string) => {
    onSelectPromise?.(id);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* View switcher — top right, overlaid */}
      <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
        <ViewSwitcher active={view} onChange={setView} />
      </div>

      {/* Active view */}
      {view === "watershed" && (
        <WatershedView
          promises={promises}
          agents={agents}
          domains={domains}
          simulationState={simulationState}
          onPromiseClick={handlePromiseClick}
          width={width}
          height={height}
        />
      )}

      {view === "canopy" && (
        <CanopyView
          promises={promises}
          agents={agents}
          domains={domains}
          simulationState={simulationState}
          onPromiseClick={handlePromiseClick}
          width={width}
          height={height}
        />
      )}

      {view === "strata" && (
        <StrataView
          promises={promises}
          agents={agents}
          domains={domains}
          simulationState={simulationState}
          onPromiseClick={handlePromiseClick}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}
