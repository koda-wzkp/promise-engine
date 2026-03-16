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
        <h1 className="text-2xl font-semibold mb-4 text-[var(--text-body)]">
          Something went wrong
        </h1>
        <p className="text-sm mb-6 text-[#4b5563]">
          An unexpected error occurred. This has been noted.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded text-sm font-medium text-white bg-[var(--text-body)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
