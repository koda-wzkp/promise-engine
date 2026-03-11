import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promise Pipeline — Commitment Network Simulation",
  description:
    "From accountability tracking to predictive simulation of commitment networks. See what happens when promises break.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
