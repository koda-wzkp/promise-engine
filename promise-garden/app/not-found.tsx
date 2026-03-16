export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="max-w-md text-center px-6">
        <h1
          className="text-2xl font-semibold mb-4"
          style={{ color: "var(--text-body)" }}
        >
          Page not found
        </h1>
        <a
          href="/"
          className="text-sm underline"
          style={{ color: "#1e40af" }}
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
