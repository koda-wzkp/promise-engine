"use client";

import { useState } from "react";
import { PersonalPromise } from "@/lib/types/personal";

interface PromiseCreatorProps {
  onAdd: (promise: PersonalPromise) => void;
}

const DOMAINS = ["Health", "Career", "Finance", "Relationships", "Learning", "Creativity", "Community"];

export default function PromiseCreator({ onAdd }: PromiseCreatorProps) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("Health");
  const [target, setTarget] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    const now = new Date().toISOString();
    const promise: PersonalPromise = {
      id: `personal-${Date.now()}`,
      promiser: "me",
      promisee: "me",
      body: body.trim(),
      domain,
      status: "declared",
      target: target || undefined,
      note: "",
      verification: { method: "self-report" },
      depends_on: [],
      isPersonal: true,
    };

    onAdd(promise);
    setBody("");
    setTarget("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        + Make a new promise
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">New Promise</h3>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What are you committing to?"
        className="mb-3 w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none"
        rows={2}
        autoFocus
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {DOMAINS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDomain(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              domain === d
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Target date (optional)"
        className="mb-3 w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-800"
        >
          Commit
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
