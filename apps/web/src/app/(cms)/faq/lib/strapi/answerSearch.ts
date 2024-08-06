import { z } from 'zod'
import { strapi } from './strapi'

const answerSchema = z.array(
  z
    .object({
      attributes: z.object({
        name: z.string(),
        slug: z.string(),
        faqAnswerGroup: z.object({
          data: z.object({
            attributes: z.object({
              name: z.string(),
              slug: z.string(),
            }),
          }),
        }),
      }),
    })
    .transform(({ attributes }) => ({
      name: attributes.name,
      slug: `${attributes.faqAnswerGroup.data.attributes.slug}/${attributes.slug}`,
    })),
)

const answerGroupSchema = z.array(
  z
    .object({
      attributes: z.object({
        name: z.string(),
        slug: z.string(),
        faqDefaultAnswer: z.object({
          data: z.object({
            attributes: z.object({
              name: z.string(),
              slug: z.string(),
            }),
          }),
        }),
      }),
    })
    .transform(({ attributes }) => ({
      name: attributes.name,
      slug: `${attributes.slug}/${attributes.faqDefaultAnswer.data.attributes.slug}`,
    })),
)

/**
 * @brief Purposefully built for the search box
 */
export async function getFaqAnswers(searchString: string) {
  const answersP = strapi.find('faq-answers', {
    fields: ['name', 'slug'],
    filters: {
      name: { $containsi: searchString },
    },
    populate: ['faqAnswerGroup'],
    pagination: { start: 0, limit: 5 },
  })
  const answerGroupsP = strapi.find('faq-answer-groups', {
    fields: ['name', 'slug'],
    populate: ['faqDefaultAnswer'],
    filters: {
      name: { $containsi: searchString },
    },
    pagination: { start: 0, limit: 3 },
  })

  const [answers, answerGroups] = await Promise.all([answersP, answerGroupsP])

  const answersParsed = answerSchema.parse(answers.data)
  const answerGroupsParsed = answerGroupSchema.parse(answerGroups.data)

  return { answers: answersParsed, answerGroups: answerGroupsParsed }
}
