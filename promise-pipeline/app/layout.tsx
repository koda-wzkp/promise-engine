import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promise Pipeline — Commitment Network Simulation",
  description:
    "From accountability tracking to predictive simulation of commitment networks. See what happens when promises break.",
  metadataBase: new URL("https://promisepipeline.org"),
  openGraph: {
    title: "Promise Pipeline — Commitment Network Simulation",
    description:
      "Map who promised what to whom, connect dependencies, and run cascade simulations to find hidden risks.",
    type: "website",
    siteName: "Promise Pipeline",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1a1a2e] focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
