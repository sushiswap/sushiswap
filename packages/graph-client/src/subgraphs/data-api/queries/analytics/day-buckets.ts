import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { graphql } from '../../graphql'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'

export const AnalyticsDayBucketsQuery = graphql(
  `
  query SushiDayBuckets($chainId: Int!) {
  sushiDayBuckets(chainId: $chainId) {
    v2 {
      id
      date
      volumeUSD
      liquidityUSD

    }
    v3 {
      id
      date
      volumeUSD
      liquidityUSD
    }
  }
}
`,
)

export type GetAnalyticsDayBuckets = VariablesOf<
  typeof AnalyticsDayBucketsQuery
>

export async function getAnalyticsDayBuckets(
  variables: GetAnalyticsDayBuckets,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`
  try {
    const result = await request(
      {
        url,
        document: AnalyticsDayBucketsQuery,
        variables,
        requestHeaders: SUSHI_REQUEST_HEADERS,
      },
      options,
    )
    if (result) {
      return result.sushiDayBuckets
    }
  } catch {
    // TODO: handle error, probably return {data, error}? or message
  }
  return {
    v2: [],
    v3: [],
  }
}

export type AnalyticsDayBuckets = Awaited<
  ReturnType<typeof getAnalyticsDayBuckets>
>
