import Link from "next/link";
import { BOOKING_URL } from "@/lib/constants/booking";

interface InlineServiceCTAProps {
  variant: "demo" | "blog";
}

export function InlineServiceCTA({ variant }: InlineServiceCTAProps) {
  if (variant === "demo") {
    return (
      <div
        className="mt-12 mb-8 p-6 rounded-lg border-l-4 border-[#1a5f4a]"
        style={{ backgroundColor: "#f5f0eb" }}
      >
        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">
          Want your commitments mapped like this?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We build interactive promise graphs for organizations, advocates, and
          policy teams.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Book a free demo call &rarr;
          </a>
          <Link
            href="/services"
            className="inline-block px-5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Learn more &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Blog variant — more compact
  return (
    <div
      className="mt-12 mb-8 p-4 sm:p-6 rounded-lg border-l-4 border-[#1a5f4a]"
      style={{ backgroundColor: "#f5f0eb" }}
    >
      <p className="text-sm text-gray-700 mb-3">
        <span className="font-semibold text-gray-900">
          Want to see your commitments mapped?
        </span>
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Book a demo call &rarr;
        </a>
        <Link
          href="/services"
          className="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Learn about our services &rarr;
        </Link>
      </div>
    </div>
  );
}
