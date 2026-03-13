import { Promise as PromiseType, Agent, Domain } from "@/lib/types/promise";
import { CascadeResult } from "@/lib/types/simulation";

export interface SimulationState {
  cascadeResult: CascadeResult | null;
  selectedPromise: string | null;
}

export interface PromiseGraphViewProps {
  promises: PromiseType[];
  agents: Agent[];
  domains: Domain[];
  simulationState: SimulationState;
  onPromiseClick: (promiseId: string) => void;
  width: number;
  height: number;
}
