import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../graphql'
import { STRAPI_GRAPHQL_URL } from 'src/subgraphs/strapi/constants'

export const StrapiFaqAnswerSearchQuery = graphql(
  `query FaqAnswerSearch($search: String!) {
    faqAnswers(filters: { name: { containsi: $search } }) {
      data {
        attributes {
          name
          slug
          faqAnswerGroup {
            data {
              attributes {
                slug
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
        }
      }
    }

    faqAnswerGroups(filters: { name: { containsi: $search } }) {
      data {
        attributes {
          name
          slug
          faqDefaultAnswer {
            data {
              attributes {
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

export type GetFaqAnswerSearch = VariablesOf<typeof StrapiFaqAnswerSearchQuery>

export type FaqAnswerSearch = Awaited<ReturnType<typeof getFaqAnswerSearch>>

/**
 * @brief Purposefully built for the search box
 */
export async function getFaqAnswerSearch(
  variables: GetFaqAnswerSearch,
  options?: RequestOptions,
) {
  const result = await request(
    {
      url: STRAPI_GRAPHQL_URL,
      document: StrapiFaqAnswerSearchQuery,
      variables,
    },
    options,
  )

  if (!result.faqAnswerGroups || !result.faqAnswers) {
    throw new Error('Failed to fetch for search')
  }

  const faqAnswerGroups = result.faqAnswerGroups.data
  const faqAnswers = result.faqAnswers.data

  const answerGroups = faqAnswerGroups.map((group) => ({
    name: group.attributes.name,
    slug: `${group.attributes.faqCategory.data?.attributes.slug}/${group.attributes.slug}/${group.attributes.faqDefaultAnswer?.data?.attributes.slug}`,
  }))

  const answers = faqAnswers.map((answer) => ({
    name: answer.attributes.name,
    slug: `${answer.attributes.faqAnswerGroup.data?.attributes.faqCategory.data?.attributes.slug}/${answer.attributes.faqAnswerGroup.data?.attributes.slug}/${answer.attributes.slug}`,
  }))

  return { answers, answerGroups }
}
