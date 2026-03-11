import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Safety Governance — Promise Pipeline",
  description: "Track AI safety promises from labs, auditors, and oversight bodies.",
  openGraph: {
    title: "AI Safety Governance — Promise Pipeline",
    description: "Track AI safety promises from labs, auditors, and oversight bodies.",
  },
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return children;
}
