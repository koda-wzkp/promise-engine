import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Promise Pipeline — Make Common Sense Computable",
  description:
    "A trust primitive for commitment networks. 267,000+ observations analyzed across 6 institutions.",
  openGraph: {
    title: "Promise Pipeline — Make Common Sense Computable",
    description:
      "A trust primitive for commitment networks. 267,000+ observations analyzed across 6 institutions.",
    url: "https://promise-engine.vercel.app",
    siteName: "Promise Pipeline",
    type: "website",
    images: [
      {
        url: "https://promise-engine.vercel.app/og-image.png",
        width: 1512,
        height: 720,
        alt: "Promise Pipeline — Make Common Sense Computable",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promise Pipeline — Make Common Sense Computable",
    description:
      "A trust primitive for commitment networks. 267,000+ observations analyzed across 6 institutions.",
    images: ["https://promise-engine.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
