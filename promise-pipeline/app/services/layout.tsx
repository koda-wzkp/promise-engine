import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Your Promises Mapped — Promise Pipeline",
  description:
    "We turn commitment structures into interactive, auditable promise graphs.",
  openGraph: {
    title: "Get Your Promises Mapped — Promise Pipeline",
    description:
      "We turn commitment structures into interactive, auditable promise graphs.",
    url: "https://promise-engine.vercel.app/services",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
