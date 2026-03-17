"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="max-w-md text-center px-6">
        <h1
          className="text-2xl font-semibold mb-4"
          style={{ color: "var(--text-body)" }}
        >
          Authentication error
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Something went wrong during authentication. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded text-sm font-medium text-white"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
