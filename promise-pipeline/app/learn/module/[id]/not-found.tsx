import Link from "next/link";

export default function ModuleNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
        Module Not Found
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        This module doesn&apos;t exist. There are 8 modules in the curriculum.
      </p>
      <Link
        href="/learn"
        className="text-sm font-medium text-blue-800 hover:underline"
      >
        ← Back to Learn
      </Link>
    </div>
  );
}
