"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TeamKanban from "@/components/team/TeamKanban";
import TeamHealthBar from "@/components/team/TeamHealthBar";
import MemberLoad from "@/components/team/MemberLoad";
import { TeamPromise, TeamMember } from "@/lib/types/team";
import { PromiseStatus } from "@/lib/types/promise";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";
import { loadFromStorage, saveToStorage } from "@/lib/utils/storage";

const STORAGE_KEY_PROMISES = "promise-pipeline-team-promises";
const STORAGE_KEY_MEMBERS = "promise-pipeline-team-members";

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "tm-1", name: "Alice", type: "stakeholder", short: "A", role: "Lead", activePromiseCount: 0, keptRate: 100, loadScore: 0 },
  { id: "tm-2", name: "Bob", type: "stakeholder", short: "B", role: "Developer", activePromiseCount: 0, keptRate: 100, loadScore: 0 },
  { id: "tm-3", name: "Carol", type: "stakeholder", short: "C", role: "Designer", activePromiseCount: 0, keptRate: 100, loadScore: 0 },
];

function computeMemberStats(members: TeamMember[], promises: TeamPromise[]): TeamMember[] {
  return members.map((m) => {
    const mine = promises.filter((p) => p.promiser === m.id);
    const active = mine.filter((p) => p.status === "declared" || p.status === "degraded");
    const completed = mine.filter((p) => p.status === "verified" || p.status === "violated");
    const kept = completed.filter((p) => p.status === "verified");
    return {
      ...m,
      activePromiseCount: active.length,
      keptRate: completed.length > 0 ? (kept.length / completed.length) * 100 : 100,
      loadScore: Math.min(100, active.length * 25),
    };
  });
}

export default function TeamPage() {
  const [promises, setPromises] = useState<TeamPromise[]>([]);
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [showForm, setShowForm] = useState(false);
  const [newBody, setNewBody] = useState("");
  const [newAssignee, setNewAssignee] = useState(DEFAULT_MEMBERS[0].id);
  const [newPriority, setNewPriority] = useState<"critical" | "high" | "normal" | "low">("normal");

  useEffect(() => {
    const loaded = loadFromStorage<TeamPromise[]>(STORAGE_KEY_PROMISES, []);
    setPromises(loaded);
    const savedMembers = loadFromStorage<TeamMember[]>(STORAGE_KEY_MEMBERS, DEFAULT_MEMBERS);
    setMembers(savedMembers);
  }, []);

  const persist = useCallback((updated: TeamPromise[]) => {
    setPromises(updated);
    saveToStorage(STORAGE_KEY_PROMISES, updated);
  }, []);

  const handleUpdateStatus = useCallback(
    (id: string, status: PromiseStatus) => {
      persist(promises.map((p) => (p.id === id ? { ...p, status } : p)));
    },
    [promises, persist]
  );

  const handleAdd = useCallback(() => {
    if (!newBody.trim()) return;
    const p: TeamPromise = {
      id: `team-${Date.now()}`,
      promiser: newAssignee,
      promisee: "team",
      body: newBody.trim(),
      domain: "Team",
      status: "declared",
      note: "",
      verification: { method: "self-report" },
      depends_on: [],
      isTeam: true,
      priority: newPriority,
    };
    persist([p, ...promises]);
    setNewBody("");
    setShowForm(false);
  }, [newBody, newAssignee, newPriority, promises, persist]);

  const updatedMembers = useMemo(() => computeMemberStats(members, promises), [members, promises]);
  const health = useMemo(() => calculateNetworkHealth(promises), [promises]);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Team Promises</h1>
            <p className="mt-1 text-sm text-gray-500">
              Shared commitments, mutual accountability.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            + New Promise
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="What is this team member committing to?"
              className="mb-3 w-full rounded border border-gray-200 p-2 text-sm focus:border-blue-400 focus:outline-none"
              rows={2}
              autoFocus
            />
            <div className="flex items-center gap-3">
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="rounded border border-gray-200 px-2 py-1.5 text-sm"
              >
                {updatedMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as typeof newPriority)}
                className="rounded border border-gray-200 px-2 py-1.5 text-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              <button
                onClick={handleAdd}
                className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-800"
              >
                Add
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <TeamHealthBar health={health} />
          <MemberLoad members={updatedMembers} />
        </div>

        <TeamKanban promises={promises} onUpdateStatus={handleUpdateStatus} />
      </main>

      <Footer />
    </div>
  );
}
