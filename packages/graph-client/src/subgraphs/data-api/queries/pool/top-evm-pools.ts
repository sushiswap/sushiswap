import type { VariablesOf } from 'gql.tada'
import { type RequestOptions, request } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'
import { ChainId, isChainId } from 'sushi'

export const PoolsQuery = graphql(
  `
  query TopPools($chainId: String!) {
    topPools(chainId: $chainId) {
      id
      chainId
      name
      address
      createdAt
      swapFee
      protocol
      token0Price
      token1Price
      token0Address
      token1Address
      token0PriceUSD
      token1PriceUSD
      liquidityUSD
      txCount1h
      txCount1d
      feeUSD1h
      feeUSD1d
      volumeUSD1h
      volumeUSD1d
      feeApr1d
      totalApr1d
      incentiveApr
      isSmartPool
      isIncentivized
      wasIncentivized
      source
    }
  }
`,
)

export type GetPools = VariablesOf<typeof PoolsQuery>

export async function getTopPools(
  variables: GetPools,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`
  try {
    if (!isChainId(parseInt(variables.chainId))) {
      throw new Error(`Invalid chainId: ${variables.chainId}, this only supports evm networks and must be a number.`)
    }
    const chainId = parseInt(variables.chainId) as ChainId
    const result = await request(
      {
        url,
        document: PoolsQuery,
        variables,
        requestHeaders: SUSHI_REQUEST_HEADERS,
      },
      options,
    )
    if (result) {
      return (
        result.topPools.map((p) => ({
          ...p,
          chainId,
        })) ?? []
      )
    }
  } catch (error) {
    console.error('getTopPools error', error)
  }
  return []
}

export type TopPools = Awaited<ReturnType<typeof getTopPools>>
