import Link from "next/link";

interface InlineServiceCTAProps {
  variant: "analysis" | "blog";
  linkTo?: string;
}

export default function InlineServiceCTA({ variant, linkTo = "/services#start" }: InlineServiceCTAProps) {
  if (variant === "blog") {
    return (
      <div className="mt-8 rounded-lg border-l-4 border-gray-300 bg-[#faf9f6] px-6 py-5">
        <p className="text-sm font-medium text-gray-700">
          Want to see your commitments mapped like this?
        </p>
        <Link
          href={linkTo}
          className="mt-2 inline-block text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
        >
          Request a promise graph &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border-l-4 border-gray-300 bg-[#faf9f6] px-6 py-5">
      <p className="text-sm font-medium text-gray-700">
        This analysis was built with Promise Pipeline.
      </p>
      <p className="mt-1 text-sm text-gray-500">
        We build interactive promise graphs for organizations, journalists, and advocates.
      </p>
      <Link
        href={linkTo}
        className="mt-3 inline-block text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
      >
        Get your promises mapped &rarr;
      </Link>
    </div>
  );
}
