import { z } from 'zod'
import { getGhostBody } from '../ghost/ghost'
import { strapi } from './strapi'

const schema = z
  .array(
    z
      .object({
        id: z.number(),
        attributes: z.object({
          name: z.string(),
          slug: z.string(),
          ghostSlug: z.string(),
          // createdAt: z.string().transform(Date),
          // updatedAt: z.string().transform(Date),
          // publishedAt: z.string().transform(Date),
        }),
      })
      .transform((data) => ({
        name: data.attributes.name,
        slug: data.attributes.slug,
        ghostSlug: data.attributes.ghostSlug,
      })),
  )
  .transform((data) => data[0])

export type Answer = z.infer<typeof schema>

export async function getFaqAnswer(id: string) {
  const { data } = await strapi.find('faq-answers', {
    fields: ['name', 'slug', 'ghostSlug'],
    filters: {
      slug: { $eq: id },
    },
  })

  const parsed = schema.parse(data)

  const body = await getGhostBody(parsed.ghostSlug)

  return {
    ...parsed,
    body,
  }
}
