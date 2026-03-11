import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HB 2021 Climate Policy Dashboard — Promise Pipeline",
  description:
    "Interactive simulation of Oregon's HB 2021 clean energy commitments. Map 20+ interdependent promises across utilities, regulators, and communities.",
  openGraph: {
    title: "HB 2021 Climate Policy Dashboard — Promise Pipeline",
    description: "Interactive simulation of Oregon's HB 2021 clean energy commitments.",
  },
};

export default function HB2021Layout({ children }: { children: React.ReactNode }) {
  return children;
}
