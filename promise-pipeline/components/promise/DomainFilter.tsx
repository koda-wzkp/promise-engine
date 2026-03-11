"use client";

import { Domain } from "@/lib/types/promise";

interface DomainFilterProps {
  domains: Domain[];
  selected: string | null;
  onSelect: (domain: string | null) => void;
}

export default function DomainFilter({ domains, selected, onSelect }: DomainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selected === null
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {domains.map((d) => (
        <button
          key={d.name}
          onClick={() => onSelect(d.name === selected ? null : d.name)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === d.name
              ? "text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={selected === d.name ? { backgroundColor: d.color } : undefined}
        >
          {d.name} ({d.promiseCount})
        </button>
      ))}
    </div>
  );
}
