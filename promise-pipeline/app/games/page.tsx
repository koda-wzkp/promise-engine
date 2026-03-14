import { Metadata } from "next";
import LivingRoom from "../../components/games/hub/LivingRoom";
import { getAllScenarios } from "../../lib/games/scenarios/index";

export const metadata: Metadata = {
  title: "Promise Governor — Promi-64 | Promise Pipeline",
  description:
    "Play Promise Governor scenarios on the Promi-64. Choose Mars Colony, Deep Sea Station, or Supply Station. Each game teaches a core Promise Theory mechanic through interactive governance simulation.",
  openGraph: {
    title: "Promise Governor — Promi-64",
    description:
      "Interactive Promise Theory games. Govern a Mars colony, a deep-sea station, or an orbital supply hub. Make promises. Manage cascades. Learn why systems fail.",
  },
};

export default function GamesHubPage() {
  const scenarios = getAllScenarios();

  return <LivingRoom scenarios={scenarios} />;
}
