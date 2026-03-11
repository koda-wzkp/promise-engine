import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Promise Pipeline",
  description:
    "Research notes, case studies, and updates from the Promise Pipeline project. Exploring commitment networks and accountability.",
  openGraph: {
    title: "Blog — Promise Pipeline",
    description: "Research notes and case studies on commitment network simulation.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
