import {
  encodePromiseHeader,
  decodePromiseHeader,
  hashPromiseContent,
  fingerprintPromise,
  fingerprintNetwork,
} from "../promiseHex";

describe("Promise Hex Encoding", () => {
  const p001Input = {
    promiseIndex: 1,
    promiserIndex: 2,
    promiseeIndex: 0,
    status: "verified",
    verificationMethod: "audit",
    polarity: "give",
    origin: "imposed",
    violationType: "none",
    domain: "Emissions",
    agentType: "utility",
    progress: 45,
    required: 80,
    confidence: 90,
    targetDate: "2030-12-31",
    dependencyCount: 2,
  };

  test("roundtrip: encode then decode recovers all fields", () => {
    const hex = encodePromiseHeader(p001Input);
    const decoded = decodePromiseHeader(hex);
    expect(decoded.promiseIndex).toBe(p001Input.promiseIndex);
    expect(decoded.promiserIndex).toBe(p001Input.promiserIndex);
    expect(decoded.promiseeIndex).toBe(p001Input.promiseeIndex);
    expect(decoded.status).toBe(p001Input.status);
    expect(decoded.verificationMethod).toBe(p001Input.verificationMethod);
    expect(decoded.polarity).toBe(p001Input.polarity);
    expect(decoded.origin).toBe(p001Input.origin);
    expect(decoded.violationType).toBe(p001Input.violationType);
    expect(decoded.domain).toBe(p001Input.domain);
    expect(decoded.agentType).toBe(p001Input.agentType);
    expect(decoded.progress).toBe(p001Input.progress);
    expect(decoded.required).toBe(p001Input.required);
    expect(decoded.confidence).toBe(p001Input.confidence);
    expect(decoded.targetDate).toBe(p001Input.targetDate);
    expect(decoded.dependencyCount).toBe(p001Input.dependencyCount);
  });

  test("hex string is exactly 32 characters", () => {
    const hex = encodePromiseHeader(p001Input);
    expect(hex.length).toBe(32);
    expect(/^[0-9A-F]{32}$/.test(hex)).toBe(true);
  });

  test("null fields encode as sentinel values", () => {
    const nullInput = {
      ...p001Input,
      progress: null,
      required: null,
      confidence: null,
      targetDate: null,
    };
    const hex = encodePromiseHeader(nullInput);
    const decoded = decodePromiseHeader(hex);
    expect(decoded.progress).toBeNull();
    expect(decoded.required).toBeNull();
    expect(decoded.confidence).toBeNull();
    expect(decoded.targetDate).toBeNull();
  });

  test("different statuses produce different hex", () => {
    const verified = encodePromiseHeader({ ...p001Input, status: "verified" });
    const violated = encodePromiseHeader({ ...p001Input, status: "violated" });
    expect(verified).not.toBe(violated);
  });

  test("content hash is deterministic", () => {
    const hash1 = hashPromiseContent(
      "Reduce emissions 80% by 2030",
      "On track per DEQ audit",
      "§3(1)(a)",
    );
    const hash2 = hashPromiseContent(
      "Reduce emissions 80% by 2030",
      "On track per DEQ audit",
      "§3(1)(a)",
    );
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  test("content hash changes when body changes", () => {
    const hash1 = hashPromiseContent(
      "Reduce emissions 80% by 2030",
      "note",
      "ref",
    );
    const hash2 = hashPromiseContent(
      "Reduce emissions 50% by 2030",
      "note",
      "ref",
    );
    expect(hash1).not.toBe(hash2);
  });

  test("full fingerprint is 96 hex chars (32 header + 64 content hash)", () => {
    const fp = fingerprintPromise(p001Input, "body", "note", "ref");
    expect(fp.length).toBe(96);
  });

  test("network fingerprint changes when one promise changes", () => {
    const fp1 = fingerprintPromise(p001Input, "body", "note");
    const fp2 = fingerprintPromise(
      { ...p001Input, promiseIndex: 2 },
      "body2",
      "note2",
    );

    const net1 = fingerprintNetwork([fp1, fp2]);

    const fp1_changed = fingerprintPromise(
      { ...p001Input, status: "violated" },
      "body",
      "note",
    );
    const net2 = fingerprintNetwork([fp1_changed, fp2]);

    expect(net1).not.toBe(net2);
  });

  test("network fingerprint is order-independent", () => {
    const fp1 = fingerprintPromise(p001Input, "body1", "note1");
    const fp2 = fingerprintPromise(
      { ...p001Input, promiseIndex: 2 },
      "body2",
      "note2",
    );

    const net_a = fingerprintNetwork([fp1, fp2]);
    const net_b = fingerprintNetwork([fp2, fp1]);
    expect(net_a).toBe(net_b);
  });
});
