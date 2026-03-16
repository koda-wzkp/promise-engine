"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
      <div className="max-w-md text-center px-6">
        <h1
          className="text-2xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "#1f2937" }}
        >
          Error in annotation tool
        </h1>
        <p className="text-sm mb-6" style={{ color: "#4b5563" }}>
          Something went wrong with the annotation tool. Please try again.
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
