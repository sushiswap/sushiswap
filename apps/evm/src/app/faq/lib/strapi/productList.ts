import { z } from 'zod'
import { imageSchema } from './image'
import { strapi } from './strapi'

const schema = z.array(
  z
    .object({
      id: z.number(),
      attributes: z.object({
        name: z.string(),
        description: z.string(),
        // createdAt: z.string().transform(Date),
        // updatedAt: z.string().transform(Date),
        // publishedAt: z.string().transform(Date),
        image: imageSchema,
        faqAnswerGroup: z.object({
          data: z.object({
            id: z.number(),
            attributes: z.object({
              name: z.string(),
              slug: z.string(),
              faqCategory: z.object({
                data: z.object({
                  attributes: z.object({
                    slug: z.string(),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    })
    .transform((data) => ({
      name: data.attributes.name,
      description: data.attributes.description,
      url: `/faq/${data.attributes.faqAnswerGroup.data.attributes.faqCategory.data.attributes.slug}/${data.attributes.faqAnswerGroup.data.attributes.slug}`,
      image: data.attributes.image,
    })),
)

export type ProductListEntry = z.infer<typeof schema>[number]

export async function getFaqProductList() {
  const { data } = await strapi.find('faq-products', {
    fields: ['id', 'name', 'description'],
    populate: ['image', 'faqAnswerGroup', 'faqAnswerGroup.faqCategory.slug'],
  })

  return schema.parse(data)
}
