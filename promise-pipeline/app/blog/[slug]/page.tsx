import Link from "next/link";
import PortableTextRenderer from "@/components/blog/PortableTextRenderer";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import { getPostBySlug } from "@/lib/blog";

// Individual blog post page — tries Sanity first, falls back to local markdown.

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post: any = null;
  let isLocalMarkdown = false;

  // Try Sanity first
  try {
    const { client } = await import("@/sanity/lib/client");
    const { postBySlugQuery } = await import("@/sanity/lib/queries");
    post = await client.fetch(postBySlugQuery, { slug: params.slug });
  } catch {
    // Sanity not configured
  }

  // Fall back to local markdown
  if (!post) {
    const localPost = getPostBySlug(params.slug);
    if (localPost) {
      post = {
        title: localPost.title,
        slug: { current: localPost.slug },
        body: localPost.body,
        publishedAt: localPost.publishedAt,
        author: localPost.author ? { name: localPost.author } : null,
        vertical: localPost.vertical,
      };
      isLocalMarkdown = true;
    }
  }

  if (!post) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-500 mb-4">
            This post doesn&apos;t exist.
          </p>
          <Link
            href="/blog"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          &larr; Back to blog
        </Link>

        <article>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            {(post.author?.name || post.author) && (
              <span>By {post.author?.name || post.author}</span>
            )}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            )}
            {post.vertical && (
              <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                {post.vertical}
              </span>
            )}
          </div>

          <div className="prose prose-gray max-w-none">
            {isLocalMarkdown ? (
              <MarkdownRenderer content={post.body} />
            ) : post.body ? (
              <PortableTextRenderer value={post.body} />
            ) : (
              <p className="text-gray-500 italic">
                This post has no content yet.
              </p>
            )}
          </div>

          {/* Related promises (Sanity posts only) */}
          {post.relatedPromises && post.relatedPromises.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border">
              <h3 className="font-serif font-semibold text-gray-900 mb-2">
                Promises Referenced
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.relatedPromises.map((id: string) => (
                  <Link
                    key={id}
                    href={`/demo/hb2021#${id}`}
                    className="px-2 py-1 text-xs font-mono bg-white border rounded hover:bg-gray-100"
                  >
                    {id}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
