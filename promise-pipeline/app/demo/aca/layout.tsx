import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affordable Care Act Dashboard — Promise Pipeline",
  description:
    "Interactive simulation of ACA commitments across federal agencies, insurers, and courts. Track legal challenges and cascade effects.",
  openGraph: {
    title: "Affordable Care Act Dashboard — Promise Pipeline",
    description: "Interactive simulation of ACA commitments with legal challenge tracking.",
  },
};

export default function ACALayout({ children }: { children: React.ReactNode }) {
  return children;
}
