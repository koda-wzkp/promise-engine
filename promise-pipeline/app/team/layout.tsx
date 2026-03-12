import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Promises — Promise Pipeline",
  description:
    "Shared commitments and mutual accountability. Track team promises with kanban boards and health scoring.",
  openGraph: {
    title: "Team Promises — Promise Pipeline",
    description: "Shared commitments and mutual accountability for teams.",
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
