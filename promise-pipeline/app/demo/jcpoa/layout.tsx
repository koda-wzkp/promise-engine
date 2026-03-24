import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JCPOA Promise Network — Promise Pipeline",
  description:
    "22 promises, 11 agents, 8 domains. The most precisely specified multinational promise network in modern diplomatic history.",
  openGraph: {
    title: "JCPOA Promise Network — Promise Pipeline",
    description:
      "22 promises, 11 agents, 8 domains. The most precisely specified multinational promise network in modern diplomatic history.",
    url: "https://promise-engine.vercel.app/demo/jcpoa",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function JCPOALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
