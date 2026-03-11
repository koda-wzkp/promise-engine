"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Blog
        </Link>

        <article className="mt-6">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>

          <div className="mt-8 rounded-lg bg-blue-50 p-6 text-sm text-blue-700">
            <p className="font-medium">Content coming soon</p>
            <p className="mt-1">
              This post will be loaded from Sanity CMS once configured. Set your{" "}
              <code className="rounded bg-blue-100 px-1">NEXT_PUBLIC_SANITY_PROJECT_ID</code> environment
              variable to connect.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
