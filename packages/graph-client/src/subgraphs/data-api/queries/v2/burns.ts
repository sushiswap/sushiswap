import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const SushiV2BurnsQuery = graphql(`
query V2Burns($address: String!, $chainId: Int!) {
  v2Burns(address: $address, chainId: $chainId) {
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

export type GetSushiV2Burns = VariablesOf<typeof SushiV2BurnsQuery>

export async function getSushiV2Burns(
  { ...variables }: GetSushiV2Burns,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: SushiV2BurnsQuery, variables },
    options,
  )

  if (result) {
    return result.v2Burns
  }

  throw new Error(`Failed to fetch burns for ${variables.chainId}`)
}

export type SushiV2Burns = Awaited<ReturnType<typeof getSushiV2Burns>>
