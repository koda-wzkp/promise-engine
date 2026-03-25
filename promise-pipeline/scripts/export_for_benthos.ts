/**
 * Export promise networks to JSON for Benthos import.
 *
 * Usage: npx tsx scripts/export_for_benthos.ts [output_dir]
 * Default output: ./exports/
 *
 * Each network becomes a single JSON file containing:
 * - promises array (full Promise type, unchanged)
 * - agents array (full Agent type, unchanged)
 * - metadata (network name, source citation, export timestamp)
 */

import fs from "fs";
import path from "path";

import {
  promises as hb2021Promises,
  agents as hb2021Agents,
} from "../lib/data/hb2021";
import {
  promises as jcpoaPromises,
  agents as jcpoaAgents,
} from "../lib/data/jcpoa";
import {
  issPromises,
  issAgents,
} from "../lib/data/iss";

import { computeNetworkFingerprints } from "../lib/encoding/computeFingerprints";
import { poseidonHashPromise } from "../lib/encoding/poseidonHash";
import type { Promise as PPPromise, Agent, NetworkFingerprint } from "../lib/types/promise";

interface ExportedNetwork {
  id: string;
  name: string;
  source: string;
  promiseCount: number;
  agentCount: number;
  domainCount: number;
  domains: string[];
  fingerprints: NetworkFingerprint;
  exportedAt: string;
  promises: unknown[];
  agents: unknown[];
}

const networks = [
  {
    id: "hb2021",
    name: "Oregon HB 2021",
    source: "Oregon House Bill 2021, 81st Legislative Assembly, 2021 Regular Session",
    promises: hb2021Promises,
    agents: hb2021Agents,
  },
  {
    id: "jcpoa",
    name: "Joint Comprehensive Plan of Action",
    source: "JCPOA, July 14, 2015",
    promises: jcpoaPromises,
    agents: jcpoaAgents,
  },
  {
    id: "iss",
    name: "International Space Station",
    source: "ISS Intergovernmental Agreement, January 29, 1998",
    promises: issPromises,
    agents: issAgents,
  },
];

const outputDir = process.argv[2] || "./exports";
fs.mkdirSync(outputDir, { recursive: true });

const manifest: {
  exportedAt: string;
  networks: { id: string; name: string; promiseCount: number; fingerprints: NetworkFingerprint }[];
} = {
  exportedAt: new Date().toISOString(),
  networks: [],
};

for (const net of networks) {
  const domains = [...new Set(net.promises.map((p) => p.domain))];

  // Compute dual fingerprints (SHA-256 + Poseidon)
  const fingerprints = computeNetworkFingerprints(net.promises, net.agents);

  // Attach per-promise Poseidon hash to _crypto field
  const promisesWithCrypto = net.promises.map((p) => ({
    ...p,
    _crypto: {
      poseidonHash: poseidonHashPromise(p).toString(16).padStart(64, "0"),
    },
  }));

  const exported: ExportedNetwork = {
    id: net.id,
    name: net.name,
    source: net.source,
    promiseCount: net.promises.length,
    agentCount: net.agents.length,
    domainCount: domains.length,
    domains,
    fingerprints,
    exportedAt: new Date().toISOString(),
    promises: promisesWithCrypto,
    agents: net.agents,
  };

  const outPath = path.join(outputDir, `${net.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(exported, null, 2));
  console.log(`Exported ${net.id}: ${net.promises.length} promises → ${outPath}`);

  manifest.networks.push({
    id: net.id,
    name: net.name,
    promiseCount: net.promises.length,
    fingerprints,
  });
}

fs.writeFileSync(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);
console.log(`\nManifest written. ${manifest.networks.length} networks exported.`);
