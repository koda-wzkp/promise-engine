import { Metadata } from "next";
import { notFound } from "next/navigation";
import GameShell from "../../../components/games/engine/GameShell";
import { getScenario, getAllScenarios } from "../../../lib/games/scenarios/index";

interface Props {
  params: { scenarioId: string };
}

export async function generateStaticParams() {
  return getAllScenarios().map((s) => ({ scenarioId: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = getScenario(params.scenarioId);
  if (!config) return { title: "Not Found" };
  return {
    title: config.metadata.title,
    description: config.metadata.description,
    openGraph: {
      title: config.metadata.title,
      description: config.metadata.description,
      images: config.metadata.ogImage ? [config.metadata.ogImage] : undefined,
    },
  };
}

export default function ScenarioPage({ params }: Props) {
  const config = getScenario(params.scenarioId);
  if (!config) notFound();

  return (
    <main>
      <GameShell config={config!} />
    </main>
  );
}
