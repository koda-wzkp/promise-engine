export const allPostsQuery = `*[_type == "post"] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "categories": categories[]->title,
  "author": author->name,
  vertical
}`

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  title,
  "slug": slug.current,
  body,
  publishedAt,
  excerpt,
  "categories": categories[]->title,
  "author": author->{name, bio},
  vertical,
  relatedPromises
}`

export const postSlugsQuery = `*[_type == "post" && defined(slug.current)][].slug.current`

export const caseStudiesQuery = `*[_type == "caseStudy"] | order(publishedAt desc) {
  title, slug, vertical, promiseCount, agentCount, keyFinding, publishedAt
}`

export const postsByVerticalQuery = `*[_type == "post" && vertical == $vertical] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  excerpt,
  publishedAt
}`
