import type { VariablesOf } from 'gql.tada'
import type { SushiSwapV3ChainId } from 'sushi/config'
import { SUSHISWAP_V3_SUBGRAPH_URL } from 'sushi/config/subgraph'

import { FetchError } from 'src/lib/fetch-error'
import type { RequestOptions } from 'src/lib/request'
import { requestPaged } from 'src/lib/request-paged'
import type { ChainIdVariable } from 'src/lib/types/chainId'
import { transformPoolV3ToBase } from 'src/subgraphs/sushi-v3/transforms/pool-v3-to-base'
import { PoolFieldsFragment } from '../fragments/pool-fields'
import { graphql } from '../graphql'

export const SushiV3PoolsWithFeesQuery = graphql(
  `
  query Pools($first: Int = 1000, $skip: Int = 0, $block: Block_height, $orderBy: Pool_orderBy, $orderDirection: OrderDirection, $where: Pool_filter) {
    pools(first: $first, skip: $skip, block: $block, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
      ...PoolFields,
      isProtocolFeeEnabled
    }
  }
`,
  [PoolFieldsFragment],
)

export type GetSushiV3PoolsWithFees = VariablesOf<
  typeof SushiV3PoolsWithFeesQuery
> &
  ChainIdVariable<SushiSwapV3ChainId>

export async function getSushiV3PoolsWithFees(
  { chainId, ...variables }: GetSushiV3PoolsWithFees,
  options?: RequestOptions,
) {
  const url = `https://${SUSHISWAP_V3_SUBGRAPH_URL[chainId]}`

  const result = await requestPaged({
    chainId,
    url,
    query: SushiV3PoolsWithFeesQuery,
    variables,
    options,
  })

  if (result) {
    return result.pools.map((pool) => ({
      ...transformPoolV3ToBase(pool, chainId),
      isProtocolFeeEnabled: pool.isProtocolFeeEnabled,
    }))
  }

  throw new FetchError(chainId, 'Failed to fetch pools')
}

export type SushiV3PoolsWithFees = Awaited<
  ReturnType<typeof getSushiV3PoolsWithFees>
>
