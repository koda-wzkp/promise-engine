"use client";

import { useState, useCallback } from "react";
import {
  NetworkPromise,
  NetworkAgent,
  NetworkDomain,
  NetworkConfig,
  PromiseCreateInput,
} from "@/lib/types/network";
import { PromiseQualityEvaluation } from "@/lib/types/quality";
import PromiseQualityGate from "@/components/personal/PromiseQualityGate";

interface PromiseFormProps {
  mode: "create" | "edit" | "renegotiate";
  complexity: "simple" | "detailed";
  agents: NetworkAgent[];
  domains: NetworkDomain[];
  existingPromises: NetworkPromise[];
  config: NetworkConfig;
  onSubmit: (input: PromiseCreateInput) => void;
  onCancel?: () => void;
  initialValues?: Partial<PromiseCreateInput>;
}

export default function PromiseForm({
  mode,
  complexity,
  agents,
  domains,
  existingPromises,
  config,
  onSubmit,
  onCancel,
  initialValues,
}: PromiseFormProps) {
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [promiser, setPromiser] = useState(initialValues?.promiser ?? agents[0]?.id ?? "");
  const [promisee, setPromisee] = useState(initialValues?.promisee ?? (complexity === "simple" ? "self" : "network"));
  const [domain, setDomain] = useState(initialValues?.domain ?? domains[0]?.id ?? "");
  const [target, setTarget] = useState(initialValues?.target ?? "");
  const [priority, setPriority] = useState<"critical" | "high" | "normal" | "low">(initialValues?.priority ?? "normal");
  const [estimatedHours, setEstimatedHours] = useState(initialValues?.estimatedHours?.toString() ?? "");
  const [tags, setTags] = useState(initialValues?.tags?.join(", ") ?? "");
  const [dependsOn, setDependsOn] = useState<string[]>(initialValues?.depends_on ?? []);
  const [recurring, setRecurring] = useState<"" | "daily" | "weekly" | "biweekly" | "monthly">(
    initialValues?.recurring?.frequency ?? ""
  );
  const [qualityEvaluation, setQualityEvaluation] = useState<PromiseQualityEvaluation | undefined>(
    undefined
  );

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    const input: PromiseCreateInput = {
      body: body.trim(),
      promiser,
      promisee,
      domain,
      target: target || undefined,
      depends_on: dependsOn.length > 0 ? dependsOn : undefined,
      priority: complexity === "detailed" ? priority : undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      recurring: recurring ? { frequency: recurring } : undefined,
      quality_evaluation: qualityEvaluation,
    };

    onSubmit(input);
    // Reset form
    setBody("");
    setTarget("");
    setEstimatedHours("");
    setTags("");
    setDependsOn([]);
    setQualityEvaluation(undefined);
  }, [body, promiser, promisee, domain, target, priority, estimatedHours, tags, dependsOn, recurring, complexity, onSubmit, qualityEvaluation]);

  const toggleDependency = useCallback((id: string) => {
    setDependsOn((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }, []);

  const activePromises = existingPromises.filter((p) => p.status === "declared" || p.status === "degraded");

  const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="space-y-4">
        {/* Body */}
        <div>
          <label htmlFor="promise-body" className="block text-sm font-medium text-gray-700 mb-1.5">
            {mode === "renegotiate" ? "Updated commitment" : "What are you committing to?"}
          </label>
          <textarea
            id="promise-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={complexity === "simple" ? "I promise to..." : "Describe the commitment..."}
            className={`${inputClass} min-h-[80px]`}
            rows={2}
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Promiser (team/detailed only) */}
          {complexity === "detailed" && agents.length > 1 && (
            <div>
              <label htmlFor="promise-promiser" className="block text-xs font-medium text-gray-600 mb-1">
                Who is making this promise?
              </label>
              <select
                id="promise-promiser"
                value={promiser}
                onChange={(e) => setPromiser(e.target.value)}
                className={inputClass}
              >
                {agents.filter((a) => a.active).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}{a.role ? ` (${a.role})` : ""}</option>
                ))}
              </select>
            </div>
          )}

          {/* Promisee */}
          <div>
            <label htmlFor="promise-promisee" className="block text-xs font-medium text-gray-600 mb-1">
              To whom?
            </label>
            <select
              id="promise-promisee"
              value={promisee}
              onChange={(e) => setPromisee(e.target.value)}
              className={inputClass}
            >
              {complexity === "simple" && <option value="self">Myself</option>}
              <option value="network">{complexity === "simple" ? "Someone else" : "The team"}</option>
              {agents.filter((a) => a.active && a.id !== promiser).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Domain */}
          <div>
            <label htmlFor="promise-domain" className="block text-xs font-medium text-gray-600 mb-1">
              Domain
            </label>
            <select
              id="promise-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className={inputClass}
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="promise-target" className="block text-xs font-medium text-gray-600 mb-1">
              Deadline
            </label>
            <input
              id="promise-target"
              type="date"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Team-specific fields */}
        {complexity === "detailed" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="promise-priority" className="block text-xs font-medium text-gray-600 mb-1">
                Priority
              </label>
              <select
                id="promise-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className={inputClass}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="promise-hours" className="block text-xs font-medium text-gray-600 mb-1">
                Estimated hours
              </label>
              <input
                id="promise-hours"
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="promise-tags" className="block text-xs font-medium text-gray-600 mb-1">
                Tags (comma-separated)
              </label>
              <input
                id="promise-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
                placeholder="e.g. sprint-3, frontend"
              />
            </div>
          </div>
        )}

        {/* Recurring (personal) */}
        {complexity === "simple" && (
          <div>
            <label htmlFor="promise-recurring" className="block text-xs font-medium text-gray-600 mb-1">
              Recurring?
            </label>
            <select
              id="promise-recurring"
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as typeof recurring)}
              className={inputClass}
            >
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        {/* Quality Gate (personal/simple mode only) */}
        {complexity === "simple" && mode === "create" && (
          <PromiseQualityGate
            promiseText={body}
            domain={domains.find((d) => d.id === domain)?.name}
            onTextChange={(newText) => setBody(newText)}
            onEvaluationComplete={(evaluation) => setQualityEvaluation(evaluation)}
          />
        )}

        {/* Dependencies */}
        {activePromises.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Depends on (optional)
            </label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-100 p-2 space-y-0.5">
              {activePromises.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={dependsOn.includes(p.id)}
                    onChange={() => toggleDependency(p.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="truncate">{p.body}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-950 transition-colors"
          >
            {mode === "create" ? (complexity === "simple" ? "Make Promise" : "Add Promise") : mode === "edit" ? "Save" : "Renegotiate"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
