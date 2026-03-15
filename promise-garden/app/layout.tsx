import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promise Garden — Personal Promise Tracker",
  description:
    "Turn your commitments into a living landscape. Make a promise, plant a seed. Keep it, and watch it grow.",
  metadataBase: new URL("https://garden.promisepipeline.org"),
  openGraph: {
    title: "Promise Garden by Promise Pipeline",
    description: "Every forest starts somewhere.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--text-body)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
