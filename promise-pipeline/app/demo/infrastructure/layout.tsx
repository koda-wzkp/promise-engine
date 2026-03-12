import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infrastructure Delivery — Promise Pipeline",
  description: "Monitor infrastructure delivery commitments across agencies.",
  openGraph: {
    title: "Infrastructure Delivery — Promise Pipeline",
    description: "Monitor infrastructure delivery commitments across agencies.",
  },
};

export default function InfraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
