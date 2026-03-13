"use client";

import { useState } from "react";
import {
  NetworkPromise,
  NetworkAgent,
  NetworkDomain,
  NetworkConfig,
  StatusChangeContext,
} from "@/lib/types/network";
import { PromiseStatus } from "@/lib/types/promise";
import StatusBadge from "@/components/promise/StatusBadge";

interface PromiseCardProps {
  promise: NetworkPromise;
  agents: NetworkAgent[];
  domains: NetworkDomain[];
  config: NetworkConfig;
  variant: "timeline" | "kanban" | "list" | "detail";
  onStatusChange?: (newStatus: PromiseStatus, context?: StatusChangeContext) => void;
  onRenegotiate?: (newBody: string, newTarget?: string) => void;
  onDelete?: () => void;
  onClick?: () => void;
  showDependencies?: boolean;
  showActions?: boolean;
  isDraggable?: boolean;
}

const priorityColors: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-400",
  normal: "border-l-gray-300",
  low: "border-l-gray-200",
};

export default function PromiseCard({
  promise,
  agents,
  domains,
  config,
  variant,
  onStatusChange,
  onRenegotiate,
  onDelete,
  onClick,
  showDependencies = false,
  showActions = true,
  isDraggable = false,
}: PromiseCardProps) {
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState("");
  const [showRenegotiate, setShowRenegotiate] = useState(false);
  const [newBody, setNewBody] = useState(promise.body);
  const [newTarget, setNewTarget] = useState(promise.target ?? "");

  const domain = domains.find((d) => d.id === promise.domain);
  const promiserAgent = agents.find((a) => a.id === promise.promiser);
  const promiseeAgent = agents.find((a) => a.id === promise.promisee);
  const validTransitions = config.validTransitions[promise.status] ?? [];

  const handleStatusChange = (newStatus: PromiseStatus) => {
    if (showReflection && reflection.trim()) {
      onStatusChange?.(newStatus, { reflection: reflection.trim() });
      setReflection("");
      setShowReflection(false);
    } else if (newStatus === "verified" || newStatus === "violated") {
      setShowReflection(true);
      // Store the intended status for when reflection is submitted
      setReflection("");
    } else {
      onStatusChange?.(newStatus);
    }
  };

  const handleRenegotiate = () => {
    if (newBody.trim() && newBody.trim() !== promise.body) {
      onRenegotiate?.(newBody.trim(), newTarget || undefined);
      setShowRenegotiate(false);
    }
  };

  const isCompact = variant === "kanban" || variant === "list";
  const borderClass = promise.priority ? priorityColors[promise.priority] : "border-l-gray-200";

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isCompact ? "p-3" : "p-4"
      } border-l-4 ${borderClass} ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
      draggable={isDraggable}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-gray-900 ${isCompact ? "text-sm" : "text-base"} ${promise.status === "verified" || promise.status === "violated" ? "line-through opacity-60" : ""}`}>
            {promise.body}
          </p>
          {promise.renegotiatedFrom && (
            <p className="mt-0.5 text-xs text-gray-400 italic line-through">
              {promise.renegotiatedFrom}
            </p>
          )}
        </div>
        <StatusBadge status={promise.status} labels={config.statusLabels} size={isCompact ? "sm" : "md"} />
      </div>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {domain && (
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: domain.color }} aria-hidden="true" />
            {domain.name}
          </span>
        )}
        {promiserAgent && variant !== "timeline" && (
          <span>{promiserAgent.name}</span>
        )}
        {promiseeAgent && promiseeAgent.id !== "self" && promiseeAgent.id !== "network" && (
          <span className="text-gray-400">→ {promiseeAgent.name}</span>
        )}
        {promise.target && (
          <span className={isOverdue(promise.target) && promise.status !== "verified" ? "text-red-500 font-medium" : ""}>
            Due {promise.target}
          </span>
        )}
        {promise.priority && promise.priority !== "normal" && (
          <span className={`font-medium ${promise.priority === "critical" ? "text-red-600" : promise.priority === "high" ? "text-orange-600" : "text-gray-400"}`}>
            {promise.priority}
          </span>
        )}
        {promise.estimatedHours && (
          <span>{promise.estimatedHours}h est.</span>
        )}
        {promise.recurring && (
          <span className="text-blue-500">{promise.recurring.frequency}</span>
        )}
      </div>

      {/* Tags */}
      {promise.tags && promise.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {promise.tags.map((tag) => (
            <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Dependencies */}
      {showDependencies && promise.depends_on.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          Depends on {promise.depends_on.length} promise{promise.depends_on.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Reflection */}
      {promise.reflection && !isCompact && (
        <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600 italic">
          {promise.reflection}
        </div>
      )}

      {/* Actions */}
      {showActions && validTransitions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {validTransitions.map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(status as PromiseStatus);
              }}
              className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label={`Change status to ${config.statusLabels[status] ?? status}`}
            >
              {config.statusLabels[status] ?? status}
            </button>
          ))}
          {onRenegotiate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRenegotiate(!showRenegotiate);
              }}
              className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Renegotiate
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded border border-red-100 px-2 py-1 text-xs text-red-400 hover:bg-red-50 transition-colors ml-auto"
              aria-label="Delete promise"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Reflection input */}
      {showReflection && (
        <div className="mt-3 space-y-2" role="region" aria-label="Add reflection">
          <label htmlFor={`reflection-${promise.id}`} className="block text-xs font-medium text-gray-600">
            Reflection (optional)
          </label>
          <textarea
            id={`reflection-${promise.id}`}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What did you learn?"
            className="w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            {validTransitions.filter((s) => s === "verified" || s === "violated").map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange?.(status as PromiseStatus, { reflection: reflection.trim() || undefined });
                  setReflection("");
                  setShowReflection(false);
                }}
                className="rounded bg-gray-900 px-3 py-1 text-xs text-white hover:bg-gray-800"
              >
                Mark as {config.statusLabels[status] ?? status}
              </button>
            ))}
            <button
              onClick={() => setShowReflection(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Renegotiate form */}
      {showRenegotiate && (
        <div className="mt-3 space-y-2" role="region" aria-label="Renegotiate promise">
          <label htmlFor={`renegotiate-${promise.id}`} className="block text-xs font-medium text-gray-600">
            Updated commitment
          </label>
          <textarea
            id={`renegotiate-${promise.id}`}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            className="w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none"
            rows={2}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <label htmlFor={`renegotiate-target-${promise.id}`} className="text-xs text-gray-600">New deadline:</label>
            <input
              id={`renegotiate-target-${promise.id}`}
              type="date"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="rounded border border-gray-200 px-2 py-1 text-sm"
            />
            <button
              onClick={handleRenegotiate}
              className="rounded bg-gray-900 px-3 py-1 text-xs text-white hover:bg-gray-800"
            >
              Save
            </button>
            <button
              onClick={() => setShowRenegotiate(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function isOverdue(target: string): boolean {
  return new Date(target) < new Date();
}
