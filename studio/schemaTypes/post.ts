import { defineType, defineField } from 'sanity'
export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 } }),
    defineField({ name: 'author', title: 'Author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'mainImage', title: 'Main image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'reference', to: [{ type: 'category' }] }] }),
    defineField({ name: 'body', title: 'Body', type: 'blockContent' }),
    defineField({
      name: 'relatedPromises',
      title: 'Related Promises',
      description: 'Promise IDs referenced in this post (e.g., P001, AI-003)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'vertical',
      title: 'Vertical',
      type: 'string',
      options: {
        list: [
          { title: 'Civic', value: 'civic' },
          { title: 'AI Safety', value: 'ai' },
          { title: 'Infrastructure', value: 'infrastructure' },
          { title: 'Supply Chain', value: 'supply-chain' },
          { title: 'Teams', value: 'teams' },
          { title: 'General', value: 'general' },
        ],
      },
    }),
  ],
})
