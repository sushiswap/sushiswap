import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const SushiV3BurnsQuery = graphql(`
query V3Burns($address: String!, $chainId: Int!) {
  v3Burns(address: $address, chainId: $chainId) {
    id
    logIndex
    amountUSD
    amount1
    amount0
    amount
    origin
    owner
    transaction {
      id
      blockNumber
      timestamp
    }
  }
}
`)

export type GetSushiV3Burns = VariablesOf<typeof SushiV3BurnsQuery>

export async function getSushiV3Burns(
  { ...variables }: GetSushiV3Burns,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: SushiV3BurnsQuery, variables },
    options,
  )

  if (result) {
    return result.v3Burns
  }

  throw new Error(`Failed to fetch burns for ${variables.chainId}`)
}

export type SushiV3Burns = Awaited<ReturnType<typeof getSushiV3Burns>>
