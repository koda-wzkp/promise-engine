import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Promise Network — Promise Pipeline",
  description:
    "Track labor, environmental, and transparency promises across global supply chains.",
  openGraph: {
    title: "Supply Chain Promise Network — Promise Pipeline",
    description:
      "Track labor, environmental, and transparency promises across global supply chains.",
    url: "https://promise-engine.vercel.app/demo/supply-chain",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function SupplyChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
