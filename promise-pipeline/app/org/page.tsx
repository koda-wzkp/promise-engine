"use client";

import { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

// Core state
import { gardenReducer, loadGardenState, saveGardenState } from "@/lib/garden/gardenReducer";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  subscribeToOrg,
  unsubscribeFromOrg,
  fetchOrg,
  createOrg as createOrgRemote,
  addTeamToOrg,
  createOrgPromise as createOrgPromiseRemote,
  updateOrgPromiseStatus,
} from "@/lib/supabase/orgSync";
import { syncCivicDependencies } from "@/lib/civic/civicFeed";
import type { PromiseStatus } from "@/lib/types/promise";
import type {
  Org,
  OrgPromise,
  ExternalDependency,
  ApiKey,
  WebhookConfig,
  WebhookEvent,
} from "@/lib/types/phase4";

// Components
import { OrgGarden } from "@/components/org/OrgGarden";
import { OrgDashboard } from "@/components/org/OrgDashboard";
import { OrgCascadeSimulator } from "@/components/org/OrgCascadeSimulator";
import { DependencyMap } from "@/components/org/DependencyMap";
import { CivicZoomTransition } from "@/components/org/CivicZoomTransition";
import { CreateOrgFlow } from "@/components/org/settings/CreateOrgFlow";
import { OrgApiKeys } from "@/components/org/settings/OrgApiKeys";
import { WebhookSettings } from "@/components/org/settings/WebhookSettings";
import { CivicLinkSetup } from "@/components/org/settings/CivicLinkSetup";
import { OrgBilling } from "@/components/org/settings/OrgBilling";
import { buildZoomChain } from "@/lib/civic/civicFeed";

type View = "garden" | "dashboard" | "cascade" | "dependencies" | "settings";

type ActiveModal =
  | null
  | { type: "create-org" }
  | { type: "civic-link"; promiseId: string; promiseBody: string; existingDeps: ExternalDependency[] };

export default function OrgPage() {
  const [gardenState, dispatch] = useReducer(gardenReducer, null, () => loadGardenState());
  const [view, setView] = useState<View>("garden");
  const [loaded, setLoaded] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | null>(null);

  const org = gardenState.org;

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveGardenState(gardenState);
  }, [gardenState, loaded]);

  // Subscribe to org real-time updates
  useEffect(() => {
    if (org?.id && isSupabaseConfigured()) {
      subscribeToOrg(org.id, dispatch);
      return () => unsubscribeFromOrg();
    }
  }, [org?.id]);

  // Sync civic dependencies periodically (on mount and when org changes)
  useEffect(() => {
    if (!org) return;
    syncCivicDependencies(org).then((changes) => {
      for (const change of changes) {
        dispatch({
          type: "CIVIC_STATUS_UPDATE",
          civicPromiseId: change.dep.civicPromiseId!,
          civicDashboard: change.dep.civicDashboard!,
          newStatus: change.newStatus,
        });
      }
    });
  }, [org?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Team names map (for display)
  const teamNames = useMemo(() => {
    const map: Record<string, string> = {};
    // In a full implementation, we'd fetch team names from Supabase.
    // For now, use team IDs as labels.
    if (org) {
      for (const teamId of org.teams) {
        map[teamId] = teamId;
      }
    }
    return map;
  }, [org]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateOrg = useCallback(
    async (name: string, teamIds: string[]) => {
      const userId = gardenState.userId ?? `user-${Date.now()}`;
      if (!gardenState.userId) {
        dispatch({ type: "SET_USER_ID", userId });
      }

      const newOrg = await createOrgRemote(name, userId);
      if (newOrg) {
        for (const teamId of teamIds) {
          await addTeamToOrg(newOrg.id, teamId);
        }
        newOrg.teams = teamIds;
        dispatch({ type: "CREATE_ORG", org: newOrg });
      } else {
        // Fallback for when Supabase isn't configured — create locally
        const localOrg: Org = {
          id: `org-${Date.now()}`,
          name,
          teams: teamIds,
          orgPromises: [],
          domains: [],
          createdAt: new Date().toISOString(),
          createdBy: userId,
        };
        dispatch({ type: "CREATE_ORG", org: localOrg });
      }
      setActiveModal(null);
    },
    [gardenState.userId]
  );

  const handleCreateOrgPromise = useCallback(
    (promise: OrgPromise) => {
      dispatch({ type: "CREATE_ORG_PROMISE", promise });
      if (org) createOrgPromiseRemote(org.id, promise);
    },
    [org]
  );

  const handleOrgPromiseStatus = useCallback(
    (promiseId: string, status: PromiseStatus) => {
      dispatch({ type: "UPDATE_ORG_PROMISE_STATUS", promiseId, newStatus: status });
      updateOrgPromiseStatus(promiseId, status);
    },
    []
  );

  const handleAddExternalDep = useCallback(
    (promiseId: string, dep: ExternalDependency) => {
      dispatch({ type: "ADD_EXTERNAL_DEPENDENCY", promiseId, dep });
    },
    []
  );

  const handleRemoveExternalDep = useCallback(
    (promiseId: string, depLabel: string) => {
      dispatch({ type: "REMOVE_EXTERNAL_DEPENDENCY", promiseId, depLabel });
    },
    []
  );

  const handleCreateApiKey = useCallback(
    (label: string) => {
      const key: ApiKey = {
        id: `key-${Date.now()}`,
        orgId: org?.id ?? "",
        label,
        keyPrefix: `pk_${Math.random().toString(36).slice(2, 10)}`,
        createdAt: new Date().toISOString(),
        rateLimitDaily: 1000,
      };
      dispatch({ type: "ADD_API_KEY", key });
    },
    [org?.id]
  );

  const handleRevokeApiKey = useCallback((keyId: string) => {
    dispatch({ type: "REVOKE_API_KEY", keyId });
  }, []);

  const handleAddWebhook = useCallback(
    (url: string, events: WebhookEvent[], healthThreshold?: number) => {
      const webhook: WebhookConfig = {
        id: `wh-${Date.now()}`,
        orgId: org?.id ?? "",
        url,
        events,
        healthThreshold,
        active: true,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_WEBHOOK", webhook });
    },
    [org?.id]
  );

  const handleRemoveWebhook = useCallback((webhookId: string) => {
    dispatch({ type: "REMOVE_WEBHOOK", webhookId });
  }, []);

  const handleToggleWebhook = useCallback((webhookId: string, active: boolean) => {
    dispatch({ type: "UPDATE_WEBHOOK", webhookId, updates: { active } });
  }, []);

  // Build zoom chain for selected promise
  const zoomChain = useMemo(() => {
    if (!selectedPromiseId || !org) return [];
    return buildZoomChain(
      selectedPromiseId,
      gardenState.promises as any[],
      gardenState.team?.name,
      org
    );
  }, [selectedPromiseId, org, gardenState.promises, gardenState.team?.name]);

  // ── Loading gate ──────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading org data...</p>
      </div>
    );
  }

  // ── No org — create one ───────────────────────────────────────────────────

  if (!org) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-8">
            <NestedPLogo mode="flow" size={48} />
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">Organization</h1>
              <p className="text-sm text-gray-500">Connect teams into one promise network</p>
            </div>
          </div>

          <div className="text-center py-16 bg-white rounded-xl border">
            <h3 className="font-serif text-lg font-semibold text-gray-700 mb-2">
              No organization yet
            </h3>
            <p className="text-sm text-gray-500 mb-2 max-w-md mx-auto">
              Create an org to connect multiple teams, track cross-team dependencies,
              and link to civic/regulatory promises.
            </p>
            <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto">
              The full zoom: personal → team → org → civic → state-level
            </p>
            <button
              onClick={() => setActiveModal({ type: "create-org" })}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Create Organization
            </button>
          </div>

          {activeModal?.type === "create-org" && (
            <CreateOrgFlow
              existingTeams={
                gardenState.team
                  ? [{ id: gardenState.team.id, name: gardenState.team.name }]
                  : []
              }
              onCreate={handleCreateOrg}
              onClose={() => setActiveModal(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Org exists — full view ────────────────────────────────────────────────

  const views: { id: View; label: string }[] = [
    { id: "garden", label: "Garden" },
    { id: "dashboard", label: "Dashboard" },
    { id: "cascade", label: "What If" },
    { id: "dependencies", label: "Dependencies" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <NestedPLogo mode="flow" size={48} />
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">{org.name}</h1>
              <p className="text-sm text-gray-500">
                {org.teams.length} teams · {org.orgPromises.length} org promises
              </p>
            </div>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-2 mb-6">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === v.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={selectedPromiseId ? "lg:col-span-2" : "lg:col-span-3"}>
            {view === "garden" && (
              <OrgGarden
                org={org}
                teamNames={teamNames}
                onSelectPromise={setSelectedPromiseId}
                onStatusUpdate={handleOrgPromiseStatus}
              />
            )}

            {view === "dashboard" && (
              <OrgDashboard
                org={org}
                teamNames={teamNames}
                onRunSimulation={(id) => {
                  setSelectedPromiseId(id);
                  setView("cascade");
                }}
              />
            )}

            {view === "cascade" && (
              <OrgCascadeSimulator org={org} teamNames={teamNames} />
            )}

            {view === "dependencies" && (
              <DependencyMap
                org={org}
                teamNames={teamNames}
                onSelectPromise={(id) => {
                  const promise = org.orgPromises.find((p) => p.id === id);
                  if (promise) {
                    setActiveModal({
                      type: "civic-link",
                      promiseId: id,
                      promiseBody: promise.body,
                      existingDeps: promise.externalDependencies,
                    });
                  }
                }}
              />
            )}

            {view === "settings" && (
              <div className="space-y-6">
                <OrgApiKeys
                  apiKeys={gardenState.apiKeys ?? []}
                  onCreateKey={handleCreateApiKey}
                  onRevokeKey={handleRevokeApiKey}
                />
                <WebhookSettings
                  webhooks={gardenState.webhooks ?? []}
                  onAdd={handleAddWebhook}
                  onRemove={handleRemoveWebhook}
                  onToggle={handleToggleWebhook}
                />
                <OrgBilling
                  org={org}
                  onManageBilling={() => {
                    // In production, redirect to Stripe customer portal
                  }}
                />
              </div>
            )}
          </div>

          {/* Zoom chain sidebar */}
          {selectedPromiseId && zoomChain.length > 0 && (
            <div className="lg:col-span-1">
              <CivicZoomTransition
                chain={zoomChain}
                onSelectLevel={() => {}}
                onViewCivicDashboard={(dashboard) => {
                  window.open(`/demo/${dashboard}`, "_blank");
                }}
              />
              <button
                onClick={() => setSelectedPromiseId(null)}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600"
              >
                Close zoom chain
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal?.type === "create-org" && (
        <CreateOrgFlow
          existingTeams={
            gardenState.team
              ? [{ id: gardenState.team.id, name: gardenState.team.name }]
              : []
          }
          onCreate={handleCreateOrg}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === "civic-link" && (
        <CivicLinkSetup
          promiseId={activeModal.promiseId}
          promiseBody={activeModal.promiseBody}
          existingDeps={activeModal.existingDeps}
          onAddDep={handleAddExternalDep}
          onRemoveDep={handleRemoveExternalDep}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
