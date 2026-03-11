import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Promise Pipeline",
  description:
    "Learn about Promise Theory, the promise graph as a trust primitive, and how Promise Pipeline transforms accountability tracking into predictive simulation.",
  openGraph: {
    title: "About — Promise Pipeline",
    description: "Learn about Promise Theory and how Promise Pipeline transforms accountability.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
