import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Safety Promise Network — Promise Pipeline",
  description:
    "Map safety commitments from AI labs. Track voluntary promises vs. imposed obligations.",
  openGraph: {
    title: "AI Safety Promise Network — Promise Pipeline",
    description:
      "Map safety commitments from AI labs. Track voluntary promises vs. imposed obligations.",
    url: "https://promise-engine.vercel.app/demo/ai",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
