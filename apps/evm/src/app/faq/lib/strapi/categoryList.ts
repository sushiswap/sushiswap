import { z } from 'zod'
import { strapi } from './strapi'

const schema = z.array(
  z
    .object({
      id: z.number(),
      attributes: z.object({
        name: z.string(),
        slug: z.string(),
        createdAt: z.string().transform(Date),
        updatedAt: z.string().transform(Date),
        publishedAt: z.string().transform(Date),
      }),
    })
    .transform((data) => ({
      name: data.attributes.name,
      slug: data.attributes.slug,
      url: `/faq/${data.attributes.slug}`,
    })),
)

export type CategoryListEntry = z.infer<typeof schema>[number]

export async function getFaqCategoryList() {
  const { data } = await strapi.find('faq-categories')

  return schema.parse(data)
}
