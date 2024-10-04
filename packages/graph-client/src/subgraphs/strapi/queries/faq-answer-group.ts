import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../graphql'
import { STRAPI_GRAPHQL_URL } from 'src/subgraphs/strapi/constants'

export const StrapiFaqAnswerGroupQuery = graphql(
  `query FaqAnswerGroup($slug: String!) {
    faqAnswerGroups(filters: { slug: { eq: $slug } }) {
      data {
        attributes {
          name
          slug
          faqAnswers(pagination: { limit: 10000 }) {
            data {
              attributes {
                name
                slug
                ghostSlug
              }
            }
          }
          faqDefaultAnswer {
            data {
              attributes {
                name
                slug
              }
            }
          }
          faqCategory {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
  }`,
)

export type GetFaqAnswerGroup = VariablesOf<typeof StrapiFaqAnswerGroupQuery>

export type FaqAnswerGroup = Awaited<ReturnType<typeof getFaqAnswerGroup>>

export async function getFaqAnswerGroup(
  variables: GetFaqAnswerGroup,
  options?: RequestOptions,
) {
  const result = await request(
    {
      url: STRAPI_GRAPHQL_URL,
      document: StrapiFaqAnswerGroupQuery,
      variables,
    },
    options,
  )

  const data = result.faqAnswerGroups?.data[0]?.attributes

  if (!data) {
    throw new Error('Failed to fetch AnswerGroup')
  }

  const answerGroup = {
    name: data.name,
    slug: data.slug,
    answers: data.faqAnswers.data.map((answer) => ({
      name: answer.attributes.name,
      slug: answer.attributes.slug,
      ghostSlug: answer.attributes.ghostSlug,
    })),
    defaultAnswer: data.faqDefaultAnswer?.data
      ? {
          name: data.faqDefaultAnswer.data.attributes.name,
          slug: data.faqDefaultAnswer.data.attributes.slug,
        }
      : null,
    category: { slug: data.faqCategory.data!.attributes.slug },
  }

  return answerGroup
}
