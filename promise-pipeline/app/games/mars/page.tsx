import type { Metadata } from "next";
import Navbar from "../../../components/layout/Navbar";
import MarsGame from "../../../components/games/mars/MarsGame";

export const metadata: Metadata = {
  title: "Promise Governor: Mars Colony | Promise Pipeline",
  description:
    "Can you keep a Mars colony alive while satisfying shareholders? An interactive simulation that teaches cascade failure, verification gaps, and structural conflict in promise networks.",
  openGraph: {
    title: "Promise Governor: Mars Colony",
    description:
      "Govern a corporate Mars colony. Balance survival against profit. Learn why promises break.",
    url: "https://promisepipeline.com/games/mars",
    type: "website",
  },
};

export default function MarsColonyPage() {
  return (
    <>
      <Navbar />
      <MarsGame />
    </>
  );
}
