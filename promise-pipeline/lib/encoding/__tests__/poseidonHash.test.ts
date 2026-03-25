import {
  stringToField,
  dateToField,
  STATUS_TO_FIELD,
  VERIFICATION_METHOD_TO_FIELD,
  promiseToFieldElements,
  poseidonHashPromise,
  poseidonMerkleRoot,
  generateMerkleProof,
} from "../poseidonHash";
import { computeNetworkFingerprints } from "../computeFingerprints";
import { agents, promises } from "../../data/hb2021";

// Use a known HB 2021-style promise for deterministic testing
const TEST_PROMISE = {
  id: "P001",
  ref: "§3(1)(a)",
  promiser: "PGE",
  promisee: "ORL",
  body: "Reduce GHG emissions 80% below 2010 levels by 2030",
  domain: "Emissions",
  status: "degraded" as const,
  target: "2030-12-31",
  progress: 45,
  required: 80,
  note: "Behind schedule",
  verification: { method: "audit" as const, source: "Oregon DEQ" },
  depends_on: ["P002", "P006"],
};

describe("Poseidon hashing — field element encoding", () => {
  test("stringToField produces consistent output", () => {
    const a = stringToField("hello");
    const b = stringToField("hello");
    expect(a).toBe(b);
  });

  test("stringToField produces different output for different strings", () => {
    const a = stringToField("hello");
    const b = stringToField("world");
    expect(a).not.toBe(b);
  });

  test("stringToField output is within BN254 field", () => {
    const FIELD_ORDER =
      21888242871839275222246405745257275088548364400416034343698204186575808495617n;
    const val = stringToField("test string");
    expect(val).toBeGreaterThanOrEqual(0n);
    expect(val).toBeLessThan(FIELD_ORDER);
  });

  test("dateToField converts ISO date to Unix timestamp", () => {
    const val = dateToField("2030-12-31");
    expect(val).toBeGreaterThan(0n);
    // 2030-12-31 should be roughly 1924905600
    expect(val).toBeGreaterThan(1900000000n);
    expect(val).toBeLessThan(2000000000n);
  });

  test("dateToField returns 0n for undefined", () => {
    expect(dateToField(undefined)).toBe(0n);
  });
});

describe("Poseidon hashing — promise encoding", () => {
  test("promiseToFieldElements returns 12 elements", () => {
    const fields = promiseToFieldElements(TEST_PROMISE);
    expect(fields).toHaveLength(12);
  });

  test("all field elements are BigInts", () => {
    const fields = promiseToFieldElements(TEST_PROMISE);
    for (const f of fields) {
      expect(typeof f).toBe("bigint");
    }
  });

  test("status maps correctly", () => {
    const fields = promiseToFieldElements(TEST_PROMISE);
    expect(fields[4]).toBe(STATUS_TO_FIELD["degraded"]);
    expect(fields[4]).toBe(3n);
  });

  test("verification method maps correctly", () => {
    const fields = promiseToFieldElements(TEST_PROMISE);
    expect(fields[8]).toBe(VERIFICATION_METHOD_TO_FIELD["audit"]);
    expect(fields[8]).toBe(2n);
  });

  test("progress and required encode as BigInts", () => {
    const fields = promiseToFieldElements(TEST_PROMISE);
    expect(fields[6]).toBe(45n); // progress
    expect(fields[7]).toBe(80n); // required
  });
});

describe("Poseidon hashing — promise hash", () => {
  test("poseidonHashPromise is deterministic", () => {
    const a = poseidonHashPromise(TEST_PROMISE);
    const b = poseidonHashPromise(TEST_PROMISE);
    expect(a).toBe(b);
  });

  test("poseidonHashPromise returns a positive BigInt", () => {
    const hash = poseidonHashPromise(TEST_PROMISE);
    expect(hash).toBeGreaterThan(0n);
  });

  test("different promises produce different hashes", () => {
    const a = poseidonHashPromise(TEST_PROMISE);
    const b = poseidonHashPromise({ ...TEST_PROMISE, id: "P999" });
    expect(a).not.toBe(b);
  });

  test("changing status changes the hash", () => {
    const a = poseidonHashPromise(TEST_PROMISE);
    const b = poseidonHashPromise({ ...TEST_PROMISE, status: "verified" });
    expect(a).not.toBe(b);
  });
});

describe("Poseidon Merkle tree", () => {
  test("poseidonMerkleRoot handles single promise", () => {
    const root = poseidonMerkleRoot([TEST_PROMISE]);
    expect(root).toBeGreaterThan(0n);
  });

  test("poseidonMerkleRoot handles two promises", () => {
    const promises = [TEST_PROMISE, { ...TEST_PROMISE, id: "P002" }];
    const root = poseidonMerkleRoot(promises);
    expect(root).toBeGreaterThan(0n);
  });

  test("poseidonMerkleRoot handles odd-length arrays (pads to power of 2)", () => {
    const promises = [
      TEST_PROMISE,
      { ...TEST_PROMISE, id: "P002" },
      { ...TEST_PROMISE, id: "P003" },
    ];
    const root = poseidonMerkleRoot(promises);
    expect(root).toBeGreaterThan(0n);
  });

  test("poseidonMerkleRoot is deterministic", () => {
    const promises = [TEST_PROMISE, { ...TEST_PROMISE, id: "P002" }];
    const a = poseidonMerkleRoot(promises);
    const b = poseidonMerkleRoot(promises);
    expect(a).toBe(b);
  });

  test("poseidonMerkleRoot returns 0n for empty array", () => {
    expect(poseidonMerkleRoot([])).toBe(0n);
  });

  test("changing one promise changes the root", () => {
    const promises = [TEST_PROMISE, { ...TEST_PROMISE, id: "P002" }];
    const a = poseidonMerkleRoot(promises);
    const modified = [
      { ...TEST_PROMISE, status: "violated" as const },
      { ...TEST_PROMISE, id: "P002" },
    ];
    const b = poseidonMerkleRoot(modified);
    expect(a).not.toBe(b);
  });
});

describe("Merkle proof generation", () => {
  test("generateMerkleProof returns valid proof", () => {
    const promises = [TEST_PROMISE, { ...TEST_PROMISE, id: "P002" }];
    const proof = generateMerkleProof(promises, "P001");
    expect(proof).not.toBeNull();
    expect(proof!.path.length).toBeGreaterThan(0);
    expect(proof!.indices.length).toBe(proof!.path.length);
  });

  test("generateMerkleProof returns null for missing promise", () => {
    const proof = generateMerkleProof([TEST_PROMISE], "NONEXISTENT");
    expect(proof).toBeNull();
  });

  test("generateMerkleProof returns null for empty array", () => {
    const proof = generateMerkleProof([], "P001");
    expect(proof).toBeNull();
  });

  test("proof path length equals log2(padded size)", () => {
    // 3 promises → padded to 4 → depth 2
    const promises = [
      TEST_PROMISE,
      { ...TEST_PROMISE, id: "P002" },
      { ...TEST_PROMISE, id: "P003" },
    ];
    const proof = generateMerkleProof(promises, "P001");
    expect(proof).not.toBeNull();
    expect(proof!.path.length).toBe(2); // log2(4) = 2
  });

  test("proof leaf matches poseidonHashPromise output", () => {
    const proof = generateMerkleProof([TEST_PROMISE], "P001");
    expect(proof).not.toBeNull();
    const directHash = poseidonHashPromise(TEST_PROMISE);
    expect(proof!.leaf).toBe(directHash);
  });
});

describe("Dual fingerprints — HB 2021 network", () => {
  test("dual fingerprints are both computed for HB 2021", () => {
    const fp = computeNetworkFingerprints(promises, agents);
    expect(fp.sha256).toHaveLength(64);
    expect(fp.poseidonRoot).toHaveLength(64);
    expect(fp.promiseCount).toBe(20);
    // SHA-256 and Poseidon should be DIFFERENT (different hash functions)
    expect(fp.sha256).not.toBe(fp.poseidonRoot);
  });

  test("dual fingerprints are deterministic", () => {
    const a = computeNetworkFingerprints(promises, agents);
    const b = computeNetworkFingerprints(promises, agents);
    expect(a.sha256).toBe(b.sha256);
    expect(a.poseidonRoot).toBe(b.poseidonRoot);
  });

  test("SHA-256 fingerprint is uppercase hex", () => {
    const fp = computeNetworkFingerprints(promises, agents);
    expect(/^[0-9A-F]{64}$/.test(fp.sha256)).toBe(true);
  });

  test("Poseidon root is lowercase hex (field element)", () => {
    const fp = computeNetworkFingerprints(promises, agents);
    expect(/^[0-9a-f]{64}$/.test(fp.poseidonRoot)).toBe(true);
  });
});
