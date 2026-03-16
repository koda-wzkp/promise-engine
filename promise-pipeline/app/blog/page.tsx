import { client } from '@/sanity/lib/client'
import { allPostsQuery } from '@/sanity/lib/queries'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  const posts = await client.fetch(allPostsQuery)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-500 mb-10 text-sm">
          Promise Theory, case studies, and project updates.
        </p>

        {posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post: any) => (
              <article
                key={post.slug}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="font-serif text-xl font-semibold text-gray-900 hover:text-blue-800 mb-2 leading-snug">
                    {post.title}
                  </h2>
                </Link>

                {post.excerpt && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {post.author && <span>{post.author}</span>}
                  {post.publishedAt && (
                    <>
                      <span>·</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </>
                  )}
                  {post.vertical && (
                    <>
                      <span>·</span>
                      <span
                        className="px-2 py-0.5 rounded capitalize font-medium"
                        style={{ backgroundColor: '#f5f0eb', color: '#6b7280' }}
                      >
                        {post.vertical}
                      </span>
                    </>
                  )}
                  {post.categories?.map((cat: string) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-gray-700 mb-2">
              Blog launching soon
            </h3>
            <p className="text-sm text-gray-500">
              Check back for research notes, case studies, and updates.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
