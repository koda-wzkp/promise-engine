import { agents, promises } from "../../data/hb2021";
import {
  encodePromiseHeader,
  fingerprintPromise,
  fingerprintNetwork,
  PromiseHexInput,
} from "../promiseHex";

// Build index maps: agent ID → numeric index, promise ID → numeric index
const agentIndex = new Map(agents.map((a, i) => [a.id, i]));
const promiseIndex = new Map(promises.map((p, i) => [p.id, i]));

// Map agent ID to agent type
const agentTypeMap = new Map(agents.map((a) => [a.id, a.type]));

function promiseToHexInput(p: (typeof promises)[number]): PromiseHexInput {
  return {
    promiseIndex: promiseIndex.get(p.id) ?? 0,
    promiserIndex: agentIndex.get(p.promiser) ?? 0,
    promiseeIndex: agentIndex.get(p.promisee) ?? 0,
    status: p.status,
    verificationMethod: p.verification.method,
    polarity: p.polarity ?? "give",
    origin: p.origin ?? "voluntary",
    violationType: p.violationType ?? "none",
    domain: p.domain,
    agentType: agentTypeMap.get(p.promiser) ?? "stakeholder",
    progress: p.progress ?? null,
    required: p.required ?? null,
    confidence: null,
    targetDate: p.target ?? null,
    dependencyCount: p.depends_on.length,
  };
}

describe("HB 2021 Network Fingerprint", () => {
  test("all 20 promises encode to valid 32-char hex strings", () => {
    for (const p of promises) {
      const input = promiseToHexInput(p);
      const hex = encodePromiseHeader(input);
      expect(hex.length).toBe(32);
      expect(/^[0-9A-F]{32}$/.test(hex)).toBe(true);
    }
  });

  test("all 20 promises produce unique hex headers", () => {
    const hexes = promises.map((p) => encodePromiseHeader(promiseToHexInput(p)));
    const unique = new Set(hexes);
    expect(unique.size).toBe(promises.length);
  });

  test("all 20 promises produce 96-char fingerprints", () => {
    for (const p of promises) {
      const input = promiseToHexInput(p);
      const fp = fingerprintPromise(input, p.body, p.note, p.ref);
      expect(fp.length).toBe(96);
    }
  });

  test("network fingerprint is a 64-char SHA-256 hex digest", () => {
    const fingerprints = promises.map((p) => {
      const input = promiseToHexInput(p);
      return fingerprintPromise(input, p.body, p.note, p.ref);
    });

    const networkFp = fingerprintNetwork(fingerprints);
    expect(networkFp.length).toBe(64);
    expect(/^[0-9A-F]{64}$/.test(networkFp)).toBe(true);

    // Log the result for the proof of concept
    console.log(`HB 2021 network fingerprint: ${networkFp}`);
  });

  test("network fingerprint is deterministic", () => {
    const computeNetworkFp = () => {
      const fingerprints = promises.map((p) => {
        const input = promiseToHexInput(p);
        return fingerprintPromise(input, p.body, p.note, p.ref);
      });
      return fingerprintNetwork(fingerprints);
    };

    expect(computeNetworkFp()).toBe(computeNetworkFp());
  });

  test("changing one promise status changes the network fingerprint", () => {
    const fingerprints = promises.map((p) => {
      const input = promiseToHexInput(p);
      return fingerprintPromise(input, p.body, p.note, p.ref);
    });
    const original = fingerprintNetwork(fingerprints);

    // Modify P001's status from degraded to violated
    const modifiedFingerprints = promises.map((p) => {
      const input = promiseToHexInput(p);
      if (p.id === "P001") {
        input.status = "violated";
      }
      return fingerprintPromise(input, p.body, p.note, p.ref);
    });
    const modified = fingerprintNetwork(modifiedFingerprints);

    expect(original).not.toBe(modified);
  });
});
