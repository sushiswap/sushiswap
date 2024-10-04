import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../graphql'
import { STRAPI_GRAPHQL_URL } from 'src/subgraphs/strapi/constants'

export const StrapiFaqAnswersQuery = graphql(
  `query FaqAnswers($filters: FaqAnswerFiltersInput, $pagination: PaginationArg, $publicationState: PublicationState = LIVE, $sort: [String] = ["publishedAt:desc"]) {
    faqAnswers(filters: $filters, pagination: $pagination, publicationState: $publicationState, sort: $sort) {
      data {
        id
        attributes {
          name
          slug
          ghostSlug
        }
      }
    }
  }`,
)

export type GetFaqAnswers = VariablesOf<typeof StrapiFaqAnswersQuery>

export type FaqAnswer = Awaited<ReturnType<typeof getFaqAnswers>>[number]

export async function getFaqAnswers(
  variables: GetFaqAnswers = {},
  options?: RequestOptions,
) {
  const result = await request(
    {
      url: STRAPI_GRAPHQL_URL,
      document: StrapiFaqAnswersQuery,
      variables,
    },
    options,
  )

  if (!result.faqAnswers) {
    throw new Error('Failed to fetch answers')
  }

  const answers = result.faqAnswers.data.map((article) => ({
    id: article.id,
    name: article.attributes.name,
    slug: article.attributes.slug,
    ghostSlug: article.attributes.ghostSlug,
  }))

  return answers
}

export async function getFaqAnswer({ slug }: { slug: string }) {
  const answers = await getFaqAnswers({
    filters: {
      slug: { eq: slug },
    },
  })

  const answer = answers[0]

  if (!answer) {
    throw new Error('Failed to fetch answer')
  }

  return answer
}
