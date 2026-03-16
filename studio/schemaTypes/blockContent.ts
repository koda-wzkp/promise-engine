import { defineType, defineArrayMember } from 'sanity'

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    // Standard rich text blocks
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          // External links
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
              },
              {
                name: 'blank',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: true,
              },
            ],
          },
          // Internal promise references (links to dashboard promise IDs)
          {
            name: 'promiseRef',
            type: 'object',
            title: 'Promise Reference',
            fields: [
              {
                name: 'promiseId',
                type: 'string',
                title: 'Promise ID',
                description: 'e.g. P001, AI-003',
              },
              {
                name: 'vertical',
                type: 'string',
                title: 'Vertical',
                options: {
                  list: ['hb2021', 'ai', 'infrastructure', 'supply-chain'],
                },
              },
            ],
          },
        ],
      },
    }),

    // Images with alt text and captions
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Required for accessibility',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),

    // Code blocks
    defineArrayMember({
      type: 'object',
      name: 'codeBlock',
      title: 'Code Block',
      fields: [
        {
          name: 'code',
          type: 'text',
          title: 'Code',
        },
        {
          name: 'language',
          type: 'string',
          title: 'Language',
          options: {
            list: ['typescript', 'javascript', 'python', 'bash', 'json', 'sql'],
          },
        },
      ],
      preview: {
        select: { language: 'language', code: 'code' },
        prepare({ language, code }) {
          return { title: `Code: ${language ?? 'unknown'}`, subtitle: code?.slice(0, 60) }
        },
      },
    }),

    // Callout / insight card (styled like dashboard insight cards)
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout',
      fields: [
        {
          name: 'type',
          type: 'string',
          title: 'Type',
          options: {
            list: [
              { title: 'Key Finding', value: 'finding' },
              { title: 'Warning', value: 'warning' },
              { title: 'Promise Insight', value: 'insight' },
            ],
          },
        },
        {
          name: 'body',
          type: 'text',
          title: 'Body',
        },
      ],
      preview: {
        select: { type: 'type', body: 'body' },
        prepare({ type, body }) {
          return { title: `Callout: ${type}`, subtitle: body?.slice(0, 60) }
        },
      },
    }),
  ],
})
