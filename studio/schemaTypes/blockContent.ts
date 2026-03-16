import { defineType, defineArrayMember } from 'sanity'
export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
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
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              { title: 'URL', name: 'href', type: 'url' },
              { title: 'Open in new tab', name: 'blank', type: 'boolean', initialValue: true },
            ],
          },
          {
            title: 'Promise Reference',
            name: 'promiseRef',
            type: 'object',
            fields: [
              { title: 'Promise ID', name: 'promiseId', type: 'string', description: 'e.g., P001, AI-003' },
              {
                title: 'Vertical', name: 'vertical', type: 'string',
                options: { list: ['hb2021', 'ai', 'infrastructure', 'supply-chain'] },
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text', validation: (R: any) => R.required() },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    }),
    defineArrayMember({
      title: 'Code Block',
      name: 'codeBlock',
      type: 'object',
      fields: [
        { title: 'Language', name: 'language', type: 'string', options: { list: ['typescript', 'javascript', 'python', 'bash', 'json', 'sql'] } },
        { title: 'Code', name: 'code', type: 'text' },
      ],
    }),
    defineArrayMember({
      title: 'Callout',
      name: 'callout',
      type: 'object',
      fields: [
        { title: 'Type', name: 'type', type: 'string', options: { list: ['finding', 'warning', 'insight'] } },
        { title: 'Body', name: 'body', type: 'text' },
      ],
    }),
  ],
})
