import { z } from 'zod'
import { strapi } from './strapi'

const schema = z.array(
  z
    .object({
      id: z.number(),
      attributes: z.object({
        createdAt: z.string().transform(Date),
        updatedAt: z.string().transform(Date),
        publishedAt: z.string().transform(Date),
        faq_answer_group: z.object({
          data: z.object({
            id: z.number(),
            attributes: z.object({
              name: z.string(),
              slug: z.string(),
              createdAt: z.string().transform(Date),
              updatedAt: z.string().transform(Date),
              publishedAt: z.string().transform(Date),
              faqDefaultAnswer: z.object({
                data: z.object({
                  attributes: z.object({
                    name: z.string(),
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
      question: data.attributes.faq_answer_group.data.attributes.name,
      url: `/faq/${data.attributes.faq_answer_group.data.attributes.slug}/${data.attributes.faq_answer_group.data.attributes.faqDefaultAnswer.data.attributes.slug}`,
    })),
)

export type MostSearchedListEntry = z.infer<typeof schema>[number]

export async function getFaqMostSearchedList() {
  const { data } = await strapi.find('faq-most-searcheds', {
    populate: ['faq_answer_group', 'faq_answer_group.faqDefaultAnswer'],
  })

  return schema.parse(data)
}
