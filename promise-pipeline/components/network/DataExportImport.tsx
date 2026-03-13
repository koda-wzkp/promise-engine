"use client";

import { useRef, useState } from "react";
import { PromiseNetworkExport } from "@/lib/types/network";

interface DataExportImportProps {
  networkName: string;
  onExport: () => PromiseNetworkExport | null;
  onImport: (data: PromiseNetworkExport) => { success: boolean; error?: string };
}

export default function DataExportImport({ networkName, onExport, onImport }: DataExportImportProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleExport = () => {
    const data = onExport();
    if (!data) return;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${networkName.toLowerCase().replace(/\s+/g, "-")}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as PromiseNetworkExport;
        const result = onImport(data);
        if (result.success) {
          setImportStatus({ type: "success", message: "Network imported successfully." });
        } else {
          setImportStatus({ type: "error", message: result.error ?? "Import failed." });
        }
      } catch {
        setImportStatus({ type: "error", message: "Invalid JSON file." });
      }
    };
    reader.readAsText(file);

    // Reset so the same file can be imported again
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Portability</h3>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Export Network
        </button>

        <label className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
          Import Network
          <input
            ref={fileInput}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="sr-only"
          />
        </label>
      </div>

      {importStatus && (
        <div
          className={`mt-3 rounded p-2 text-xs ${
            importStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
          role="status"
          aria-live="polite"
        >
          {importStatus.message}
        </div>
      )}
    </div>
  );
}
