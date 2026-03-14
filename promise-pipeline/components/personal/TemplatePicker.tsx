"use client";

import { useState, useCallback } from "react";
import {
  STARTER_TEMPLATES,
  TemplateSet,
  PromiseTemplate,
} from "@/lib/quality/templates";
import { PromiseQualityEvaluation } from "@/lib/types/quality";

interface TemplatePickerProps {
  onAddTemplates: (
    templates: Array<{
      body: string;
      domain: string;
      quality_evaluation: PromiseQualityEvaluation;
    }>,
  ) => void;
}

function buildTemplateEvaluation(): PromiseQualityEvaluation {
  return {
    autonomous: { pass: true, reason: "Within your control." },
    observable: { pass: true, reason: "This is verifiable." },
    specific: { pass: true, reason: "Clear action with bounds." },
    affirmative: { pass: true, reason: "Framed as positive action." },
    passes_all: true,
    reframes: [],
    encouragement: "Pre-validated template \u2014 ready to commit.",
    evaluated_by: "rules",
    evaluated_at: new Date().toISOString(),
    was_overridden: false,
    reframe_selected: null,
  };
}

export default function TemplatePicker({ onAddTemplates }: TemplatePickerProps) {
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<
    Set<string>
  >(new Set());

  const toggleSet = useCallback(
    (id: string) => {
      setExpandedSet((prev) => (prev === id ? null : id));
      setSelectedTemplates(new Set());
    },
    [],
  );

  const toggleTemplate = useCallback((key: string) => {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const addSelected = useCallback(() => {
    if (!expandedSet) return;
    const set = STARTER_TEMPLATES.find((s) => s.id === expandedSet);
    if (!set) return;

    const toAdd = set.templates
      .filter((_, i) => selectedTemplates.has(`${expandedSet}-${i}`))
      .map((t) => ({
        body: t.body,
        domain: t.domain,
        quality_evaluation: buildTemplateEvaluation(),
      }));

    if (toAdd.length > 0) {
      onAddTemplates(toAdd);
      setExpandedSet(null);
      setSelectedTemplates(new Set());
    }
  }, [expandedSet, selectedTemplates, onAddTemplates]);

  const currentSet = STARTER_TEMPLATES.find((s) => s.id === expandedSet);

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium text-gray-500">
        Start with a template (or write your own below)
      </p>

      {/* Template set pills */}
      <div className="flex flex-wrap gap-2">
        {STARTER_TEMPLATES.map((set) => (
          <button
            key={set.id}
            type="button"
            onClick={() => toggleSet(set.id)}
            aria-expanded={expandedSet === set.id}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              expandedSet === set.id
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            {set.name}
          </button>
        ))}
      </div>

      {/* Expanded template set */}
      {currentSet && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-sm text-gray-700">{currentSet.description}</p>
          {currentSet.citation && (
            <p className="mt-1 text-xs italic text-gray-400">
              {currentSet.citation}
            </p>
          )}

          <div className="mt-3 space-y-2">
            {currentSet.templates.map((template, i) => {
              const key = `${currentSet.id}-${i}`;
              const checked = selectedTemplates.has(key);

              return (
                <label
                  key={key}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTemplate(key)}
                    className="mt-0.5 rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{template.body}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        {template.frequency}
                      </span>
                      {template.note && (
                        <span className="text-[10px] text-gray-400 truncate">
                          {template.note}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedTemplates.size > 0 && (
            <button
              type="button"
              onClick={addSelected}
              className="mt-3 rounded bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Add {selectedTemplates.size} selected
            </button>
          )}
        </div>
      )}
    </div>
  );
}
