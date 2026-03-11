import { Promise } from "./promise";

export interface PersonalPromise extends Promise {
  isPersonal: true;
  reflection?: string;
  renegotiatedFrom?: string;
  completedAt?: string;
}

export interface PersonalStats {
  totalPromises: number;
  activePromises: number;
  keptRate: number;
  averageDaysToComplete: number;
  byDomain: Record<string, {
    total: number;
    kept: number;
    broken: number;
    active: number;
    keptRate: number;
  }>;
  trend: { month: string; keptRate: number }[];
}
