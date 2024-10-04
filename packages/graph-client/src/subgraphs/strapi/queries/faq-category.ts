import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../graphql'
import { STRAPI_GRAPHQL_URL } from 'src/subgraphs/strapi/constants'

export const StrapiFaqCategoryQuery = graphql(
  `query FaqCategory($slug: String!) {
    faqCategories(filters: { slug: { eq: $slug } }) {
      data {
        id
        attributes {
          name
          slug
          faqAnswerGroups(publicationState: LIVE) {
            data {
              attributes {
                name
                slug
                faqDefaultAnswer {
                  data {
                    attributes {
                      name
                      slug
                    }
                  }
                }
                faqAnswers {
                  data {
                    attributes {
                      name
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
  }`,
)

export type GetFaqCategory = VariablesOf<typeof StrapiFaqCategoryQuery>

export type FaqCategory = Awaited<ReturnType<typeof getFaqCategory>>

export async function getFaqCategory(
  variables: GetFaqCategory,
  options?: RequestOptions,
) {
  const result = await request(
    {
      url: STRAPI_GRAPHQL_URL,
      document: StrapiFaqCategoryQuery,
      variables,
    },
    options,
  )

  const data = result.faqCategories.data[0]?.attributes

  if (!data) {
    throw new Error('Failed to fetch category')
  }

  const category = {
    name: data.name,
    slug: data.slug,
    answerGroups: data.faqAnswerGroups.data.map((group) => ({
      name: group.attributes.name,
      slug: group.attributes.slug,
      defaultAnswer: group.attributes.faqDefaultAnswer?.data
        ? {
            name: group.attributes.faqDefaultAnswer.data.attributes.name,
            slug: group.attributes.faqDefaultAnswer.data.attributes.slug,
          }
        : null,
      answers: group.attributes.faqAnswers.data.map((answer) => ({
        name: answer.attributes.name,
        slug: answer.attributes.slug,
      })),
    })),
  }

  return category
}
