export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
      <div className="max-w-md text-center px-6">
        <h1
          className="text-2xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "#1f2937" }}
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
