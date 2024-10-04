import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../graphql'
import { STRAPI_GRAPHQL_URL } from 'src/subgraphs/strapi/constants'
import { ImageFieldsFragment } from '../fragments/image-fields'
import { transformImage } from '../transforms/transform-image'

export const StrapiFaqProductsQuery = graphql(
  `query FaqProducts($filters: FaqProductFiltersInput, $pagination: PaginationArg, $publicationState: PublicationState = LIVE, $sort: [String] = ["publishedAt:desc"]) {
    faqProducts(filters: $filters, pagination: $pagination, publicationState: $publicationState, sort: $sort) {
      data {
        id
        attributes {
          name
          description
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
          image {
            data {
              ...ImageFields
            }
          }
        }
      }
    }
  }`,
  [ImageFieldsFragment],
)

export type GetFaqProducts = VariablesOf<typeof StrapiFaqProductsQuery>

export type FaqProducts = Awaited<ReturnType<typeof getFaqProducts>>

export async function getFaqProducts(
  variables: GetFaqProducts = {},
  options?: RequestOptions,
) {
  const result = await request(
    {
      url: STRAPI_GRAPHQL_URL,
      document: StrapiFaqProductsQuery,
      variables,
    },
    options,
  )

  if (!result.faqProducts) {
    throw new Error('Failed to fetch Products')
  }

  const products = result.faqProducts.data.map((product) => ({
    name: product.attributes.name,
    description: product.attributes.description,
    url: `/faq/${
      product.attributes.faqAnswerGroup?.data?.attributes.faqCategory.data
        ?.attributes.slug
    }/${product.attributes.faqAnswerGroup!.data?.attributes.slug}`,
    image: product.attributes.image.data
      ? transformImage(product.attributes.image.data)
      : null,
  }))

  return products
}
