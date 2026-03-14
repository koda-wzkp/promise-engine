"use client";

import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromiseForm from "@/components/network/PromiseForm";
import PromiseCard from "@/components/network/PromiseCard";
import NetworkHealth from "@/components/network/NetworkHealth";
import DataExportImport from "@/components/network/DataExportImport";
import { usePromiseNetwork } from "@/lib/hooks/usePromiseNetwork";
import { PromiseStatus } from "@/lib/types/promise";
import { NetworkPromise, NetworkAgent, StatusChangeContext, AgentStats } from "@/lib/types/network";

const TEAM_NETWORK_ID = "net-team-default";

type TabId = "board" | "members" | "simulation" | "settings";

// ─── SETUP FLOW ───

function TeamSetupFlow({ onComplete }: { onComplete: (name: string, members: Omit<NetworkAgent, "id">[]) => void }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([
    { name: "", role: "" },
    { name: "", role: "" },
  ]);

  const addMember = () => setMembers([...members, { name: "", role: "" }]);

  const updateMember = (idx: number, field: "name" | "role", value: string) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMembers = members
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        type: "member" as const,
        short: m.name.trim().charAt(0).toUpperCase(),
        role: m.role.trim() || undefined,
        active: true,
      }));

    if (validMembers.length < 2 || !teamName.trim()) return;
    onComplete(teamName.trim(), validMembers);
  };

  return (
    <div className="mx-auto max-w-lg px-1">
      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Set Up Your Team</h2>
      <p className="text-sm text-gray-500 mb-6">Create a shared promise network for your team.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
            Team name
          </label>
          <input
            id="team-name"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Kitchen Team, Engineering"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team members (at least 2)
          </label>
          <div className="space-y-2.5">
            {members.map((m, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  placeholder="Name"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  aria-label={`Member ${i + 1} name`}
                  required={i < 2}
                />
                <input
                  type="text"
                  value={m.role}
                  onChange={(e) => updateMember(i, "role", e.target.value)}
                  placeholder="Role (optional)"
                  className="sm:w-36 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  aria-label={`Member ${i + 1} role`}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMember}
            className="mt-3 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
          >
            + Add another member
          </button>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-950 transition-colors"
        >
          Create Team
        </button>
      </form>
    </div>
  );
}

// ─── KANBAN BOARD ───

function KanbanBoard({
  promises,
  agents,
  config,
  domains,
  onStatusChange,
}: {
  promises: NetworkPromise[];
  agents: NetworkAgent[];
  config: any;
  domains: any[];
  onStatusChange: (id: string, status: PromiseStatus) => void;
}) {
  const columns: { status: PromiseStatus; label: string }[] = [
    { status: "declared", label: config.statusLabels?.["declared"] ?? "Committed" },
    { status: "degraded", label: config.statusLabels?.["degraded"] ?? "At Risk" },
    { status: "verified", label: config.statusLabels?.["verified"] ?? "Delivered" },
    { status: "violated", label: config.statusLabels?.["violated"] ?? "Failed" },
  ];

  const handleDragStart = (e: React.DragEvent, promiseId: string) => {
    e.dataTransfer.setData("text/plain", promiseId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: PromiseStatus) => {
    e.preventDefault();
    const promiseId = e.dataTransfer.getData("text/plain");
    if (promiseId) {
      onStatusChange(promiseId, targetStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="overflow-x-auto -mx-4 px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-none"
      role="region"
      aria-label="Kanban board"
    >
      <div className="flex gap-3 sm:gap-4 min-w-[720px] sm:min-w-0 sm:grid sm:grid-cols-4">
        {columns.map((col) => {
          const items = promises.filter((p) => p.status === col.status);
          return (
            <div
              key={col.status}
              className="flex-1 min-w-[200px] sm:min-w-0 rounded-lg bg-gray-50 p-3 min-h-[200px]"
              onDrop={(e) => handleDrop(e, col.status)}
              onDragOver={handleDragOver}
              role="list"
              aria-label={`${col.label} column`}
            >
              <div className="mb-3 flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-700">{col.label}</h4>
                <span className="rounded-full bg-gray-200/80 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    className="cursor-grab active:cursor-grabbing"
                    role="listitem"
                  >
                    <PromiseCard
                      promise={p}
                      agents={agents}
                      domains={domains}
                      config={config}
                      variant="kanban"
                      onStatusChange={(newStatus) => onStatusChange(p.id, newStatus)}
                      showActions={false}
                    />
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <p className="py-4 text-center text-xs text-gray-300">
                  Drop promises here
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MEMBER LOAD VIEW ───

function MemberLoadView({
  agents,
  stats,
}: {
  agents: NetworkAgent[];
  stats: Map<string, AgentStats>;
}) {
  const sorted = [...agents]
    .filter((a) => a.active)
    .sort((a, b) => (stats.get(b.id)?.loadScore ?? 0) - (stats.get(a.id)?.loadScore ?? 0));

  return (
    <div className="space-y-4">
      {sorted.map((agent) => {
        const s = stats.get(agent.id);
        if (!s) return null;
        const loadColor = s.loadScore >= 80 ? "#991b1b" : s.loadScore >= 60 ? "#78350f" : "#1a5f4a";

        return (
          <div key={agent.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
                {agent.role && <span className="ml-2 text-xs text-gray-400">{agent.role}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{s.activePromiseCount} active</span>
                <span>{Math.round(s.keptRate * 100)}% kept</span>
                {s.overloaded && (
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-600 font-medium">Overloaded</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${s.loadScore}%`, backgroundColor: loadColor }}
              />
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span>Streak: {s.currentStreak}</span>
              <span className="capitalize">Trend: {s.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CAPACITY SIMULATOR ───

function CapacitySimulator({
  network,
  runCapacitySimulation,
}: {
  network: any;
  runCapacitySimulation: any;
}) {
  const [result, setResult] = useState<any>(null);
  const [assignee, setAssignee] = useState(network.agents[0]?.id ?? "");
  const [body, setBody] = useState("");

  const handleSimulate = () => {
    if (!body.trim()) return;
    const r = runCapacitySimulation({
      hypotheticalPromise: {
        body: body.trim(),
        promiser: assignee,
        promisee: "network",
        domain: network.domains[0]?.id ?? "",
      },
    });
    setResult(r);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Capacity Simulator</h3>
      <p className="text-xs text-gray-500 mb-3">What happens if we add a new promise?</p>

      <div className="space-y-2 mb-3">
        <label htmlFor="cap-body" className="sr-only">Promise description</label>
        <input
          id="cap-body"
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hypothetical promise..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="cap-assignee" className="sr-only">Assignee</label>
          <select
            id="cap-assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm sm:flex-1"
          >
            {network.agents.filter((a: NetworkAgent) => a.active).map((a: NetworkAgent) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            onClick={handleSimulate}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-950 transition-colors"
          >
            Simulate
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-3 rounded bg-gray-50 p-3 text-sm" role="status" aria-live="polite">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-semibold ${result.canAbsorb ? "text-green-700" : "text-red-700"}`}>
              {result.canAbsorb ? "Can absorb" : "Overloaded"}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Load: {result.assigneeCurrentLoad}% → {result.assigneeProjectedLoad}%</span>
          </div>
          <p className="text-xs text-gray-600">{result.recommendation}</p>
          {result.atRiskPromises.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-orange-600">At-risk promises:</p>
              {result.atRiskPromises.map((p: any) => (
                <p key={p.promiseId} className="text-xs text-gray-500 ml-2">{p.reason}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ABSENCE SIMULATOR ───

function AbsenceSimulator({
  network,
  runAbsenceSimulation,
}: {
  network: any;
  runAbsenceSimulation: any;
}) {
  const [result, setResult] = useState<any>(null);
  const [agentId, setAgentId] = useState(network.agents[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSimulate = () => {
    if (!startDate || !endDate) return;
    const r = runAbsenceSimulation({ agentId, startDate, endDate });
    setResult(r);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Absence Simulator</h3>
      <p className="text-xs text-gray-500 mb-3">What happens if a member is unavailable?</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 mb-3">
        <div>
          <label htmlFor="abs-agent" className="block text-xs font-medium text-gray-600 mb-1 sm:sr-only">
            Team member
          </label>
          <select
            id="abs-agent"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            {network.agents.filter((a: NetworkAgent) => a.active).map((a: NetworkAgent) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="abs-start" className="block text-xs font-medium text-gray-600 mb-1 sm:sr-only">
            From
          </label>
          <input
            id="abs-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="abs-end" className="block text-xs font-medium text-gray-600 mb-1 sm:sr-only">
            Until
          </label>
          <input
            id="abs-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSimulate}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-950 transition-colors"
          >
            Simulate
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-3 rounded bg-gray-50 p-3 text-sm" role="status" aria-live="polite">
          <p className="text-xs text-gray-700 mb-2">{result.summary}</p>

          {result.affectedPromises.length > 0 && (
            <div className="space-y-1">
              {result.affectedPromises.map((p: any) => (
                <div key={p.promiseId} className="flex items-center gap-2 text-xs">
                  <span className={`rounded px-1 py-0.5 font-medium ${
                    p.risk === "high" ? "bg-red-50 text-red-600" :
                    p.risk === "medium" ? "bg-orange-50 text-orange-600" :
                    "bg-gray-50 text-gray-500"
                  }`}>
                    {p.risk}
                  </span>
                  <span className="text-gray-600 truncate">{p.body}</span>
                </div>
              ))}
            </div>
          )}

          {result.reassignmentSuggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Reassignment suggestions:</p>
              {result.reassignmentSuggestions.map((s: any) => (
                <p key={s.promiseId} className="text-xs text-gray-500">{s.reason} (load: {s.projectedLoad}%)</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN TEAM PAGE ───

export default function TeamPage() {
  const hook = usePromiseNetwork(TEAM_NETWORK_ID, "team");
  const {
    network,
    isLoaded,
    createPromise,
    updateStatus,
    addAgent,
    networkHealth,
    agentStats,
    runCapacitySimulation,
    runAbsenceSimulation,
    updateConfig,
    exportNetwork,
    importNetwork,
  } = hook;

  const [activeTab, setActiveTab] = useState<TabId>("board");
  const [showForm, setShowForm] = useState(false);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  // Determine if we need setup
  useMemo(() => {
    if (!isLoaded) return;
    if (network.agents.length <= 1 && network.promises.length === 0 && network.name === "My Team") {
      setNeedsSetup(true);
    } else {
      setNeedsSetup(false);
    }
  }, [isLoaded, network.agents.length, network.promises.length, network.name]);

  const handleSetupComplete = useCallback((name: string, members: Omit<NetworkAgent, "id">[]) => {
    for (const m of members) {
      addAgent(m);
    }
    setNeedsSetup(false);
  }, [addAgent]);

  const handleStatusChange = useCallback((id: string, newStatus: PromiseStatus) => {
    updateStatus(id, newStatus);
  }, [updateStatus]);

  if (!isLoaded || needsSetup === null) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Navbar />
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-gray-400 py-12">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Navbar />
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6">
          <TeamSetupFlow onComplete={handleSetupComplete} />
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "board", label: "Board" },
    { id: "members", label: "Members" },
    { id: "simulation", label: "Simulation" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Header — stacks on mobile */}
        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">{network.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {network.agents.filter((a) => a.active).length} members · {network.promises.length} promises
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NetworkHealth health={networkHealth} config={network.config} variant="compact" />
              <button
                onClick={() => setShowForm(!showForm)}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 active:bg-gray-950 transition-colors"
              >
                + New Promise
              </button>
            </div>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6">
            <PromiseForm
              mode="create"
              complexity="detailed"
              agents={network.agents}
              domains={network.domains}
              existingPromises={network.promises}
              config={network.config}
              onSubmit={(input) => {
                createPromise(input);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Tab navigation — sticky */}
        <div
          className="sticky top-[57px] z-30 -mx-4 mb-4 border-b border-gray-200 bg-[#faf9f6]/95 backdrop-blur-sm px-4"
          role="tablist"
          aria-label="Team views"
        >
          <div className="flex gap-1 sm:gap-4 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-2 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`}>
          {activeTab === "board" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Health overview at top of board */}
              <div className="grid gap-4 sm:grid-cols-2">
                <NetworkHealth health={networkHealth} config={network.config} variant="full" />
                <div className="hidden sm:block">
                  <MemberLoadView agents={network.agents} stats={agentStats} />
                </div>
              </div>

              <KanbanBoard
                promises={network.promises}
                agents={network.agents}
                config={network.config}
                domains={network.domains}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {activeTab === "members" && (
            <MemberLoadView agents={network.agents} stats={agentStats} />
          )}

          {activeTab === "simulation" && (
            <div className="space-y-4">
              <CapacitySimulator network={network} runCapacitySimulation={runCapacitySimulation} />
              <AbsenceSimulator network={network} runAbsenceSimulation={runAbsenceSimulation} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Domains</h3>
                <div className="space-y-2">
                  {network.domains.map((d) => (
                    <div key={d.id} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-700">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Help improve Promise Pipeline</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Share anonymized promise patterns. Content is never shared — only structure.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={network.config.dataContribution.enabled}
                    onChange={(e) => updateConfig({
                      dataContribution: { ...network.config.dataContribution, enabled: e.target.checked },
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Enable anonymous data sharing</span>
                </label>
              </div>

              <DataExportImport
                networkName={network.name}
                onExport={exportNetwork}
                onImport={importNetwork}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
