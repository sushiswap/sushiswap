import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../graphql'
import { STRAPI_GRAPHQL_URL } from 'src/subgraphs/strapi/constants'

export const StrapiFaqCategoriesQuery = graphql(
  `query FaqCategories($filters: FaqCategoryFiltersInput, $pagination: PaginationArg, $publicationState: PublicationState = LIVE, $sort: [String] = ["publishedAt:desc"]) {
    faqCategories(filters: $filters, pagination: $pagination, publicationState: $publicationState, sort: $sort) {
      data {
        id
        attributes {
          name
          slug
        }
      }
    }
  }`,
)

export type GetFaqCategories = VariablesOf<typeof StrapiFaqCategoriesQuery>

export type FaqCategories = Awaited<ReturnType<typeof getFaqCategories>>

export async function getFaqCategories(
  variables: GetFaqCategories = {},
  options?: RequestOptions,
) {
  const result = await request(
    {
      url: STRAPI_GRAPHQL_URL,
      document: StrapiFaqCategoriesQuery,
      variables,
    },
    options,
  )

  if (!result.faqCategories) {
    throw new Error('Failed to fetch categories')
  }

  const categories = result.faqCategories.data.map((category) => ({
    name: category.attributes.name,
    slug: category.attributes.slug,
    url: `/faq/${category.attributes.slug}`,
  }))

  return categories
}
