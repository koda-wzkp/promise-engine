import Link from "next/link";
import { notFound } from "next/navigation";
import { studioModules } from "@/lib/data/studio-curriculum";

interface ModulePageProps {
  params: Promise<{ id: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { id } = await params;
  const moduleNumber = parseInt(id, 10);
  const mod = studioModules.find((m) => m.number === moduleNumber);

  if (!mod) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav className="mb-8 text-sm text-gray-500">
        <Link
          href="/learn"
          className="hover:text-gray-900 transition-colors"
        >
          Learn
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">
          Module {mod.number}: {mod.title}
        </span>
      </nav>

      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
        Module {mod.number}: {mod.title}
      </h1>
      <p className="text-sm text-gray-600 mb-8">{mod.description}</p>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500">
          Module content is coming soon. Check back for the full lesson.
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        {mod.number > 1 && (
          <Link
            href={`/learn/module/${mod.number - 1}`}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            &larr; Module {mod.number - 1}
          </Link>
        )}
        <div />
        {mod.number < 8 && (
          <Link
            href={`/learn/module/${mod.number + 1}`}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Module {mod.number + 1} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
