import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Promise Pipeline — Build a Promise Network in 2 Hours",
  description:
    "8 hands-on modules teaching Promise Theory by doing it. Create promises, connect dependencies, run cascade simulations, find verification gaps, and share your network. Free and self-guided.",
  openGraph: {
    title: "Learn Promise Pipeline — Build a Promise Network in 2 Hours",
    description:
      "8 hands-on modules teaching Promise Theory by doing it. Create promises, connect dependencies, run cascade simulations, find verification gaps, and share your network. Free and self-guided.",
    url: "https://promise-engine.vercel.app/learn",
    siteName: "Promise Pipeline",
    type: "website",
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      {children}
    </div>
  );
}
