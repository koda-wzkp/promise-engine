"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Placeholder posts until Sanity is configured
const PLACEHOLDER_POSTS = [
  {
    _id: "1",
    title: "Introducing Promise Pipeline v2",
    slug: { current: "introducing-promise-pipeline-v2" },
    excerpt:
      "From accountability tracker to simulation engine — how Promise Theory transforms the way we think about commitments.",
    publishedAt: "2026-03-01",
    author: "Koda Nolan-Finkel",
  },
  {
    _id: "2",
    title: "The Verification Gap in Oregon's HB 2021",
    slug: { current: "verification-gap-hb2021" },
    excerpt:
      "Why powerful agents get filing-based verification while community promises remain unverifiable — and what it means for equity.",
    publishedAt: "2026-02-15",
    author: "Koda Nolan-Finkel",
  },
  {
    _id: "3",
    title: "Cascade Simulation: Predicting Promise Failures",
    slug: { current: "cascade-simulation" },
    excerpt:
      "How BFS propagation through dependency graphs reveals hidden systemic risks in commitment networks.",
    publishedAt: "2026-02-01",
    author: "Koda Nolan-Finkel",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-serif text-4xl font-bold text-gray-900">Blog</h1>
        <p className="mt-2 text-sm text-gray-500">
          Research notes, case studies, and updates from the Promise Pipeline project.
        </p>

        <div className="mt-8 space-y-6">
          {PLACEHOLDER_POSTS.map((post) => (
            <article
              key={post._id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/blog/${post.slug.current}`}>
                <h2 className="font-serif text-xl font-semibold text-gray-900 hover:text-blue-700">
                  {post.title}
                </h2>
              </Link>
              <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{post.author}</span>
                <span>·</span>
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-xs text-blue-700">
          Blog posts are placeholder content. Connect Sanity CMS to publish real articles.
        </div>
      </main>

      <Footer />
    </div>
  );
}
