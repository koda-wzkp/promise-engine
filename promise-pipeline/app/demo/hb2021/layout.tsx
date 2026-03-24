import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oregon HB 2021 Promise Network — Promise Pipeline",
  description:
    "20 promises, 11 agents, 7 domains. Interactive cascade simulation for Oregon's clean energy law.",
  openGraph: {
    title: "Oregon HB 2021 Promise Network — Promise Pipeline",
    description:
      "20 promises, 11 agents, 7 domains. Interactive cascade simulation for Oregon's clean energy law.",
    url: "https://promise-engine.vercel.app/demo/hb2021",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function HB2021Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
