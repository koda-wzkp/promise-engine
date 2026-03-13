"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createStorageEngine, StorageEngine } from "@/lib/storage/local";
import { PromiseNetwork, NetworkScope } from "@/lib/types/network";
import Link from "next/link";

interface NetworkSummary {
  id: string;
  name: string;
  scope: NetworkScope;
  promiseCount: number;
  agentCount: number;
  updatedAt: string;
}

const scopeBadgeColors: Record<string, { bg: string; text: string }> = {
  personal: { bg: "#eff6ff", text: "#1e40af" },
  team: { bg: "#ecfdf5", text: "#1a5f4a" },
  org: { bg: "#f5f3ff", text: "#5b21b6" },
  civic: { bg: "#fef3c7", text: "#78350f" },
  treaty: { bg: "#fce7f3", text: "#9d174d" },
  custom: { bg: "#f3f4f6", text: "#374151" },
};

export default function NetworkBrowserPage() {
  const [networks, setNetworks] = useState<NetworkSummary[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storage = createStorageEngine();
    const ids = storage.listNetworks();
    const summaries: NetworkSummary[] = [];

    for (const id of ids) {
      const net = storage.getNetwork(id);
      if (net) {
        summaries.push({
          id: net.id,
          name: net.name,
          scope: net.scope,
          promiseCount: net.promises.length,
          agentCount: net.agents.filter((a) => a.active).length,
          updatedAt: net.updatedAt,
        });
      }
    }

    // Sort by most recently updated
    summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setNetworks(summaries);
    setIsLoaded(true);
  }, []);

  const getNetworkLink = (net: NetworkSummary): string => {
    if (net.scope === "personal") return "/personal";
    if (net.scope === "team") return "/team";
    return `/networks/${net.id}`;
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">My Networks</h1>
          <p className="mt-1 text-sm text-gray-500">
            All your promise networks in one place.
          </p>
        </div>

        {!isLoaded && (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        )}

        {isLoaded && networks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">No networks yet. Create your first one.</p>
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              <Link
                href="/personal"
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <h3 className="font-semibold text-gray-900">Personal Promises</h3>
                <p className="text-sm text-gray-500 mt-1">Track commitments to yourself and others.</p>
              </Link>
              <Link
                href="/team"
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <h3 className="font-semibold text-gray-900">Team Commitments</h3>
                <p className="text-sm text-gray-500 mt-1">Map your team&apos;s promise network.</p>
              </Link>
              <Link
                href="/demo/hb2021"
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <h3 className="font-semibold text-gray-900">Explore a Demo</h3>
                <p className="text-sm text-gray-500 mt-1">See Promise Pipeline applied to Oregon&apos;s clean energy law.</p>
              </Link>
            </div>
          </div>
        )}

        {isLoaded && networks.length > 0 && (
          <div className="space-y-3">
            {networks.map((net) => {
              const badge = scopeBadgeColors[net.scope] ?? scopeBadgeColors.custom;
              return (
                <Link
                  key={net.id}
                  href={getNetworkLink(net)}
                  className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{net.name}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {net.scope}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Updated {new Date(net.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                    <span>{net.promiseCount} promise{net.promiseCount !== 1 ? "s" : ""}</span>
                    <span>{net.agentCount} agent{net.agentCount !== 1 ? "s" : ""}</span>
                  </div>
                </Link>
              );
            })}

            <div className="pt-4 flex gap-3">
              <Link
                href="/personal"
                className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                + Personal Network
              </Link>
              <Link
                href="/team"
                className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                + Team Network
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
