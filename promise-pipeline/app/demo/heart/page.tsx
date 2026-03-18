import { HeartLoader } from "@/components/layout/HeartLoader";

export default function HeartLoaderDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3rem",
        background: "#0a0a0a",
      }}
    >
      <h1 style={{ color: "#fff", fontFamily: "monospace", fontSize: "1.2rem" }}>
        HeartLoader demo
      </h1>
      <HeartLoader size={200} />
      <div style={{ display: "flex", gap: "2rem", alignItems: "end" }}>
        <HeartLoader size={60} />
        <HeartLoader size={100} />
        <HeartLoader size={140} />
      </div>
    </div>
  );
}
