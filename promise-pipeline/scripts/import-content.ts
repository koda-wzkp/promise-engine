/**
 * One-time import script: reads /content/*.md files and pushes them to Sanity.
 *
 * Usage:
 *   SANITY_API_TOKEN=<editor-token> npx tsx scripts/import-content.ts
 *
 * Get a token at: https://www.sanity.io/manage/project/cwvex1ty → API → Tokens
 * Create a token with "Editor" permissions.
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

const client = createClient({
  projectId: 'cwvex1ty',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Metadata for each content file
const posts = [
  {
    file: 'welcome.md',
    title: 'Welcome to the Promise Pipeline Blog',
    slug: 'welcome',
    excerpt:
      "An introduction to what you'll find here — case studies, Promise Theory explainers, technical posts, and changelog.",
    vertical: 'general',
    publishedAt: '2026-03-01T00:00:00Z',
    categories: ['General'],
  },
  {
    file: 'trust-primitive.md',
    title: 'The Trust Primitive: What It Means for Commitments to Nest, Compose, and Scale',
    slug: 'trust-primitive',
    excerpt:
      'Why promise graphs are a foundational building block for modeling trust — and why that matters for accountability at every scale.',
    vertical: 'general',
    publishedAt: '2026-03-02T00:00:00Z',
    categories: ['Promise Theory'],
  },
  {
    file: 'aca-hb2021-analysis.md',
    title: 'Did They Keep Their Promises? The ACA and Oregon HB 2021',
    slug: 'aca-hb2021-analysis',
    excerpt:
      'Comparing the promise networks of the Affordable Care Act and Oregon HB 2021 reveals identical structural patterns in how legislation fails.',
    vertical: 'civic',
    publishedAt: '2026-03-05T00:00:00Z',
    categories: ['Case Study', 'Civic'],
  },
  {
    file: 'agents-break-promises.md',
    title: 'When Agents Break Promises Nobody Made',
    slug: 'agents-break-promises',
    excerpt:
      "What Truffle Security's controlled experiment reveals about instrumental convergence, implicit promise networks, and the verification gaps in AI safety.",
    vertical: 'ai',
    publishedAt: '2026-03-08T00:00:00Z',
    categories: ['Case Study', 'AI Safety'],
  },
  {
    file: 'entropy-problem.md',
    title: 'Your Promise Network Has an Entropy Problem',
    slug: 'entropy-problem',
    excerpt:
      'New simulation engine capabilities: network entropy, bridge node detection via betweenness centrality, certainty cascades, and cryptographic verification.',
    vertical: 'general',
    publishedAt: '2026-03-10T00:00:00Z',
    categories: ['Technical'],
  },
  {
    file: 'jcpoa-promise-network.md',
    title: 'The JCPOA Promise Network: When Verification Is a Promise That Can Break',
    slug: 'jcpoa-promise-network',
    excerpt:
      'Decomposing the Iran nuclear deal into 22 promises across 8 domains reveals a cascade that collapsed the entire network in 3.5 years — and changed how the simulation engine works.',
    vertical: 'international',
    publishedAt: '2026-03-12T00:00:00Z',
    categories: ['Case Study'],
  },
]

/**
 * Converts markdown text to Sanity Portable Text blocks.
 * Handles headings, blockquotes, horizontal rules, paragraphs, and lists.
 * Inline formatting (bold, italic, links) is preserved as plain text for this
 * initial import — edit posts in the Studio to add inline marks back.
 */
function markdownToBlocks(markdown: string): any[] {
  const blocks: any[] = []
  const lines = markdown.split('\n')
  let i = 0
  let keyIdx = 0

  const nextKey = () => `block-${keyIdx++}`

  const stripInline = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\[([^\]]+)\]/g, '$1')

  const makeSpan = (text: string, key: string) => ({
    _type: 'span',
    _key: key,
    text,
    marks: [],
  })

  const makeBlock = (style: string, text: string) => {
    const k = nextKey()
    return {
      _type: 'block',
      _key: k,
      style,
      children: [makeSpan(stripInline(text), `${k}-s0`)],
      markDefs: [],
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    // H4
    if (line.startsWith('#### ')) {
      blocks.push(makeBlock('h4', line.slice(5)))
      i++
      continue
    }

    // H3
    if (line.startsWith('### ')) {
      blocks.push(makeBlock('h3', line.slice(4)))
      i++
      continue
    }

    // H2
    if (line.startsWith('## ')) {
      blocks.push(makeBlock('h2', line.slice(3)))
      i++
      continue
    }

    // H1 — skip (title stored separately)
    if (line.startsWith('# ')) {
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push(makeBlock('blockquote', line.slice(2)))
      i++
      continue
    }

    // Horizontal rule — skip
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      i++
      continue
    }

    // Unordered list
    if (/^[-*+] /.test(line)) {
      const listChildren: any[] = []
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        const k = nextKey()
        listChildren.push({
          _type: 'block',
          _key: k,
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [makeSpan(stripInline(lines[i].replace(/^[-*+] /, '')), `${k}-s0`)],
          markDefs: [],
        })
        i++
      }
      blocks.push(...listChildren)
      continue
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const listChildren: any[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const k = nextKey()
        listChildren.push({
          _type: 'block',
          _key: k,
          style: 'normal',
          listItem: 'number',
          level: 1,
          children: [makeSpan(stripInline(lines[i].replace(/^\d+\. /, '')), `${k}-s0`)],
          markDefs: [],
        })
        i++
      }
      blocks.push(...listChildren)
      continue
    }

    // Table — render as a plain paragraph noting it's a table
    if (line.startsWith('|')) {
      // Skip the whole table (collect rows, format as a callout-style note)
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const k = nextKey()
      blocks.push({
        _type: 'block',
        _key: k,
        style: 'normal',
        children: [makeSpan('[Table — edit in Sanity Studio to restore formatting]', `${k}-s0`)],
        markDefs: [],
      })
      continue
    }

    // Regular paragraph — collect consecutive non-special lines
    let paragraphLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('|') &&
      !/^(-{3,}|\*{3,})$/.test(lines[i].trim()) &&
      !/^[-*+] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i])
    ) {
      paragraphLines.push(lines[i])
      i++
    }

    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(' ')
      if (text.trim()) {
        blocks.push(makeBlock('normal', text))
      }
    }
  }

  return blocks
}

async function importContent() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Error: SANITY_API_TOKEN environment variable is required.')
    console.error('Get a token at: https://www.sanity.io/manage/project/cwvex1ty → API → Tokens')
    process.exit(1)
  }

  console.log('Starting content import to Sanity...\n')

  // Create author
  const authorId = 'author-conor'
  await client.createOrReplace({
    _id: authorId,
    _type: 'author',
    name: 'Conor Nolan-Finkel',
    bio: 'Builder of Promise Pipeline. Applying Promise Theory to civic accountability, AI safety, and organizational health.',
    slug: { _type: 'slug', current: 'conor-nolan-finkel' },
  })
  console.log('✓ Author: Conor Nolan-Finkel')

  // Create categories
  const allCategories = [
    'Promise Theory',
    'Case Study',
    'Changelog',
    'Technical',
    'Civic',
    'AI Safety',
    'General',
  ]
  const categoryMap: Record<string, string> = {}
  for (const cat of allCategories) {
    const catId = `category-${cat.toLowerCase().replace(/[\s/]+/g, '-')}`
    await client.createOrReplace({
      _id: catId,
      _type: 'category',
      title: cat,
    })
    categoryMap[cat] = catId
  }
  console.log(`✓ Categories: ${allCategories.join(', ')}\n`)

  // Resolve content directory (one level up from promise-pipeline/)
  const contentDir = path.resolve(__dirname, '..', '..', 'content')
  if (!fs.existsSync(contentDir)) {
    console.error(`Content directory not found: ${contentDir}`)
    process.exit(1)
  }

  // Import each post
  for (const meta of posts) {
    const filePath = path.join(contentDir, meta.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ File not found: ${filePath} — skipping`)
      continue
    }

    let markdown = fs.readFileSync(filePath, 'utf-8')

    // Strip frontmatter if present
    if (markdown.startsWith('---')) {
      const end = markdown.indexOf('---', 3)
      if (end !== -1) markdown = markdown.slice(end + 3).trim()
    }

    const body = markdownToBlocks(markdown)
    const postId = `post-${meta.slug}`

    await client.createOrReplace({
      _id: postId,
      _type: 'post',
      title: meta.title,
      slug: { _type: 'slug', current: meta.slug },
      author: { _type: 'reference', _ref: authorId },
      publishedAt: meta.publishedAt,
      excerpt: meta.excerpt,
      vertical: meta.vertical,
      categories: meta.categories.map((cat) => ({
        _type: 'reference',
        _ref: categoryMap[cat] ?? categoryMap['General'],
        _key: `catref-${cat.toLowerCase().replace(/[\s/]+/g, '-')}`,
      })),
      body,
    })

    console.log(`✓ Imported: ${meta.title}`)
  }

  console.log('\nDone! All content imported to Sanity.')
  console.log('→ Review posts at https://www.sanity.io/manage/project/cwvex1ty')
  console.log('→ Or visit /studio on your local dev server')
  console.log('→ Visit /blog to see the live blog')
}

importContent().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
