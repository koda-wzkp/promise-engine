import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISS Promise Network — Promise Pipeline",
  description:
    "27 promises, 21 agents, 9 domains. International Space Station commitment network analysis.",
  openGraph: {
    title: "ISS Promise Network — Promise Pipeline",
    description:
      "27 promises, 21 agents, 9 domains. International Space Station commitment network analysis.",
    url: "https://promise-engine.vercel.app/demo/iss",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function ISSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
