import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const SushiV2MintsQuery = graphql(`
query V2Mints($address: String!, $chainId: Int!) {
  v2Mints(address: $address, chainId: $chainId) {
    id
    logIndex
    amountUSD
    amount1
    amount0
    liquidity
    sender
    transaction {
      createdAtBlock
      createdAtTimestamp
      id
    }
  }
}
`)

export type GetSushiV2Mints = VariablesOf<typeof SushiV2MintsQuery>

export async function getSushiV2Mints(
  { ...variables }: GetSushiV2Mints,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: SushiV2MintsQuery, variables },
    options,
  )

  if (result) {
    return result.v2Mints
  }

  throw new Error(`Failed to fetch swaps for ${variables.chainId}`)
}

export type SushiV2Mints = Awaited<ReturnType<typeof getSushiV2Mints>>
