import { z } from 'zod'
import { strapi } from './strapi'

const schema = z
  .array(
    z
      .object({
        id: z.number(),
        attributes: z.object({
          name: z.string(),
          slug: z.string(),
          faqAnswers: z.object({
            data: z.array(
              z.object({
                attributes: z.object({
                  name: z.string(),
                  slug: z.string(),
                  ghostSlug: z.string(),
                }),
              }),
            ),
          }),
          faqDefaultAnswer: z.object({
            data: z.object({
              attributes: z.object({
                name: z.string(),
                slug: z.string(),
              }),
            }),
          }),
          faqCategory: z.object({
            data: z.object({
              attributes: z.object({
                slug: z.string(),
              }),
            }),
          }),
        }),
      })
      .transform((data) => ({
        name: data.attributes.name,
        slug: data.attributes.slug,
        answers: data.attributes.faqAnswers.data.map((answer) => ({
          name: answer.attributes.name,
          slug: answer.attributes.slug,
          ghostSlug: answer.attributes.ghostSlug,
        })),
        defaultAnswer: {
          name: data.attributes.faqDefaultAnswer.data.attributes.name,
          slug: data.attributes.faqDefaultAnswer.data.attributes.slug,
        },
        category: { slug: data.attributes.faqCategory.data.attributes.slug },
      })),
  )
  .transform((data) => data[0])

export type AnswerGroup = z.infer<typeof schema>

export async function getFaqAnswerGroup(id: string) {
  const { data } = await strapi.find('faq-answer-groups', {
    fields: ['name', 'slug'],
    populate: ['faqAnswers', 'faqDefaultAnswer', 'faqCategory.slug'],
    filters: {
      slug: { $eq: id },
    },
  })

  return schema.parse(data)
}
