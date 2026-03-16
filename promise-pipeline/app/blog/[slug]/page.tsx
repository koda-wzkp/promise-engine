import { client } from '@/sanity/lib/client'
import { postBySlugQuery, postSlugsQuery } from '@/sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const portableTextComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2
        className="font-serif text-2xl font-semibold mt-10 mb-4"
        style={{ color: '#1f2937' }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3
        className="font-serif text-xl font-semibold mt-8 mb-3"
        style={{ color: '#1f2937' }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4
        className="font-serif text-lg font-semibold mt-6 mb-2"
        style={{ color: '#1f2937' }}
      >
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote
        className="border-l-4 pl-5 my-6 italic"
        style={{ borderColor: '#4A90D9', color: '#4b5563' }}
      >
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p
        className="mb-5 leading-relaxed text-base"
        style={{ color: '#1f2937', fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em>{children}</em>,
    code: ({ children }: any) => (
      <code
        className="font-mono text-sm px-1.5 py-0.5 rounded"
        style={{ backgroundColor: '#f5f0eb', color: '#1f2937' }}
      >
        {children}
      </code>
    ),
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        className="underline underline-offset-2"
        style={{ color: '#1e40af' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    promiseRef: ({ value, children }: any) => (
      <a
        href={`/demo/${value?.vertical || 'hb2021'}#${value?.promiseId}`}
        className="underline font-mono text-sm"
        style={{ color: '#1a5f4a' }}
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-5 space-y-1.5" style={{ color: '#1f2937' }}>
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-5 space-y-1.5" style={{ color: '#1f2937' }}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
    number: ({ children }: any) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
  },
  types: {
    // Inline code block (from the existing blockContent schema's code object)
    code: ({ value }: any) => (
      <pre
        className="rounded-lg p-4 my-6 overflow-x-auto text-sm font-mono"
        style={{ backgroundColor: '#1f2937', color: '#f9fafb' }}
      >
        {value.language && (
          <div className="text-xs mb-2" style={{ color: '#9ca3af' }}>
            {value.language}
          </div>
        )}
        <code>{value.code}</code>
      </pre>
    ),
    // Callout blocks
    callout: ({ value }: any) => {
      const colors: Record<string, { bg: string; border: string; text: string }> = {
        info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
        warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
        insight: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
      }
      const c = colors[value.type] || colors.info
      return (
        <div
          className="rounded-lg p-4 my-6 border-l-4"
          style={{ backgroundColor: c.bg, borderColor: c.border }}
        >
          {value.title && (
            <p className="font-semibold text-sm mb-1" style={{ color: c.text }}>
              {value.title}
            </p>
          )}
          <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
            {value.body}
          </p>
        </div>
      )
    },
    image: ({ value }: any) => (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.sanity.io/images/cwvex1ty/production/${value.asset._ref
            .replace('image-', '')
            .replace(/-([a-z]+)$/, '.$1')}`}
          alt={value.alt || ''}
          className="rounded-lg w-full"
        />
        {value.caption && (
          <figcaption className="text-center text-sm mt-2" style={{ color: '#6b7280' }}>
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
}

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(postSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await client.fetch(postBySlugQuery, { slug: params.slug })
  if (!post) return {}
  return {
    title: `${post.title} — Promise Pipeline Blog`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch(postBySlugQuery, { slug: params.slug })
  if (!post) notFound()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="text-sm hover:underline mb-8 inline-block"
          style={{ color: '#6b7280' }}
        >
          ← Back to blog
        </Link>

        <article>
          <header className="mb-10">
            <h1
              className="font-serif text-3xl font-bold mb-4 leading-tight"
              style={{ color: '#1f2937' }}
            >
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6b7280' }}>
              {post.author?.name && <span>{post.author.name}</span>}
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
                    className="px-2 py-0.5 rounded capitalize text-xs font-medium"
                    style={{ backgroundColor: '#f5f0eb', color: '#6b7280' }}
                  >
                    {post.vertical}
                  </span>
                </>
              )}
              {post.categories?.map((cat: string) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}
                >
                  {cat}
                </span>
              ))}
            </div>

            {post.excerpt && (
              <p
                className="mt-5 text-base leading-relaxed"
                style={{ color: '#4b5563', borderLeft: '3px solid #e5e7eb', paddingLeft: '1rem' }}
              >
                {post.excerpt}
              </p>
            )}
          </header>

          <div className="pt-2">
            {post.body && (
              <PortableText value={post.body} components={portableTextComponents} />
            )}
          </div>

          {post.relatedPromises && post.relatedPromises.length > 0 && (
            <div
              className="mt-12 p-5 rounded-xl border"
              style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
            >
              <h3 className="font-serif font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Promises Referenced
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.relatedPromises.map((id: string) => (
                  <Link
                    key={id}
                    href={`/demo/hb2021#${id}`}
                    className="px-2 py-1 text-xs font-mono bg-white border rounded hover:bg-gray-50 transition-colors"
                    style={{ color: '#1a5f4a', borderColor: '#d1d5db' }}
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
  )
}
