"use client";

import { useState } from "react";
import type { ApiKey } from "@/lib/types/phase4";

interface OrgApiKeysProps {
  apiKeys: ApiKey[];
  onCreateKey: (label: string) => void;
  onRevokeKey: (keyId: string) => void;
}

export function OrgApiKeys({ apiKeys, onCreateKey, onRevokeKey }: OrgApiKeysProps) {
  const [newLabel, setNewLabel] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">API Keys</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="text-xs px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Create Key
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        API keys grant access to org and team promise data. Rate limit: 1,000 requests/day.
      </p>

      {showCreate && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <label htmlFor="api-key-label" className="block text-xs font-medium text-gray-600 mb-1">
            Key Label
          </label>
          <div className="flex gap-2">
            <input
              id="api-key-label"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 border rounded-lg px-2 py-1 text-sm"
              placeholder="e.g., Production, Staging"
            />
            <button
              onClick={() => {
                if (newLabel.trim()) {
                  onCreateKey(newLabel.trim());
                  setNewLabel("");
                  setShowCreate(false);
                }
              }}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <p className="text-xs text-gray-400">No API keys created yet.</p>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-700">{key.label}</p>
                <p className="text-[10px] text-gray-400 font-mono">{key.keyPrefix}...</p>
                <p className="text-[10px] text-gray-300">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => onRevokeKey(key.id)}
                className="text-[10px] px-2 py-0.5 text-red-600 border border-red-200 rounded hover:bg-red-50"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
