import { NestedPLogo } from "@/components/brand/NestedPLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
      <div className="max-w-md text-center px-6">
        <NestedPLogo mode="glitch" size={120} className="mx-auto mb-8" />
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "#1f2937" }}
        >
          Promise not found.
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          The commitment you&apos;re looking for doesn&apos;t exist in this network.
        </p>
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
