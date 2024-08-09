import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const SushiV2SwapsQuery = graphql(`
query V2Swaps($address: String!, $chainId: Int!) {
  v2Swaps(address: $address, chainId: $chainId) {
    transaction {
      createdAtBlock
      createdAtTimestamp
      id
    }
    logIndex
    amountUSD
    amount1Out
    amount0Out
    amount1In
    amount0In
    to
    sender
    id
  }
}
`)

export type GetSushiV2Swaps = VariablesOf<typeof SushiV2SwapsQuery>

export async function getSushiV2Swaps(
  { ...variables }: GetSushiV2Swaps,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: SushiV2SwapsQuery, variables },
    options,
  )

  if (result) {
    return result.v2Swaps
  }

  throw new Error(`Failed to fetch swaps for ${variables.chainId}`)
}

export type SushiV2Swaps = Awaited<ReturnType<typeof getSushiV2Swaps>>
