import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infrastructure SLA Promise Network — Promise Pipeline",
  description:
    "Model SLA dependencies across cloud providers. Simulate outage cascades with sensor-based verification.",
  openGraph: {
    title: "Infrastructure SLA Promise Network — Promise Pipeline",
    description:
      "Model SLA dependencies across cloud providers. Simulate outage cascades with sensor-based verification.",
    url: "https://promise-engine.vercel.app/demo/infrastructure",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function InfraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
