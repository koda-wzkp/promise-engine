import { defineType, defineField } from 'sanity'
export const caseStudyType = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'vertical',
      title: 'Vertical',
      type: 'string',
      options: { list: ['civic', 'ai', 'infrastructure', 'supply-chain', 'teams'] },
    }),
    defineField({ name: 'promiseCount', title: 'Promises Analyzed', type: 'number' }),
    defineField({ name: 'agentCount', title: 'Agents Tracked', type: 'number' }),
    defineField({ name: 'domainCount', title: 'Domains Covered', type: 'number' }),
    defineField({ name: 'keyFinding', title: 'Key Finding', type: 'text' }),
    defineField({ name: 'body', title: 'Body', type: 'blockContent' }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' }),
  ],
})
