import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Accountability — Promise Pipeline",
  description: "Verify sustainability and labor promises across global supply chains.",
  openGraph: {
    title: "Supply Chain Accountability — Promise Pipeline",
    description: "Verify sustainability and labor promises across global supply chains.",
  },
};

export default function SupplyChainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
