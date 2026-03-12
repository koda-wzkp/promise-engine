import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Promises — Promise Pipeline",
  description:
    "Track your personal commitments and build reliability over time with Promise Pipeline's personal accountability dashboard.",
  openGraph: {
    title: "Personal Promises — Promise Pipeline",
    description: "Track your personal commitments and build reliability over time.",
  },
};

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
