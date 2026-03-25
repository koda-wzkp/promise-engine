import { notFound } from "next/navigation";
import { studioModules } from "@/lib/data/studio-curriculum";
import ModuleContent from "./ModuleContent";

interface ModulePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return studioModules.map((m) => ({ id: String(m.number) }));
}

export async function generateMetadata({ params }: ModulePageProps) {
  const { id } = await params;
  const mod = studioModules.find((m) => String(m.number) === id);
  if (!mod) return { title: "Module Not Found" };

  return {
    title: `Module ${mod.number}: ${mod.title} — Learn Promise Pipeline`,
    description: mod.description,
  };
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
      <ModuleContent mod={mod} />
    </div>
  );
}
