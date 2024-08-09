import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const PortfolioHistoryQuery = graphql(
  `
query PortfolioHistory($id: ID!) {
  portfolioHistory(id: $id) {
    category
    approve {
      amount
      id
      isCore
      isScam
      isSuspicious
      isVerified
      logoUrl
      name
      symbol
      type
    }
    chain
    chainId
    functionName
    gasFeeNative
    gasFeeUSD
    projectName
    protocolLogo
    receives {
      amount
      id
      isCore
      isScam
      isSuspicious
      isVerified
      logoUrl
      name
      symbol
      type
    }
    sends {
      amount
      id
      isCore
      isScam
      isSuspicious
      isVerified
      logoUrl
      name
      symbol
      type
    }
    timestamp
    txHash
  }
}
`,
)

export type GetPortfolioHistory = VariablesOf<typeof PortfolioHistoryQuery>

export async function getPortfolioHistory(
  variables: GetPortfolioHistory,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: PortfolioHistoryQuery, variables },
    options,
  )
  if (result) {
    return result.portfolioHistory
  }

  throw new Error('No portfolio history')
}

export type PortfolioHistory = Awaited<ReturnType<typeof getPortfolioHistory>>

export type PortfolioTransaction = PortfolioHistory[0]
