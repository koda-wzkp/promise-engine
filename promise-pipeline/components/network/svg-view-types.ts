import type { Promise as PromiseType } from "@/lib/types/promise";

/** Simplified node data for SVG views. */
export interface SVGNodeData {
  id: string;
  x: number;
  y: number;
  status: string;
  domain: string;
  downstreamCount: number;
  isSelected: boolean;
  isAffected: boolean;
  layerIndex: number;
}

/** Edge data for SVG views. */
export interface SVGEdgeData {
  edgeId: string;
  sourceId: string;
  targetId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceStatus: string;
  targetStatus: string;
  downstreamCount: number;
}

/** Domain band for strata view. */
export interface DomainBand {
  domain: string;
  y: number;
  height: number;
  layerIndex: number;
  dependedOnCount: number;
}

/** Shared props for all three SVG view components. */
export interface SVGViewProps {
  nodes: SVGNodeData[];
  edges: SVGEdgeData[];
  width: number;
  height: number;
  networkHealth: number;
  domainBands?: DomainBand[];
  onNodeClick?: (promiseId: string) => void;
  hoveredNodeId?: string | null;
  onNodeHover?: (nodeId: string) => void;
  onNodeBlur?: () => void;
  focusedNodeId?: string | null;
  affectedIds: Set<string>;
  cascadeActive: boolean;
  promiseMap: Map<string, PromiseType>;
  isMobile: boolean;
  reducedMotion: boolean;
  unobservablePercent: number | null;
}
