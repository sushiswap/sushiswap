import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { ChainId, SushiSwapProtocol, type PoolBase, type PoolV3 } from 'sushi'
import { isSushiSwapV3ChainId } from 'sushi/config'
import type { Address } from 'viem'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'

export const V3PoolsQuery = graphql(
  `
    query V3Pools($chainId: Int!) {
    v3Pools(chainId: $chainId) {
      id
      address
      chainId
      protocol
      name
      createdAt
      isProtocolFeeEnabled
      swapFee
      token0 {
        id
        chainId
        address
        name
        symbol
        decimals
      }
      token1 {
        id
        chainId
        address
        name
        symbol
        decimals
      }
      source
      reserve0
      reserve1
      liquidity
      token0Price
      token1Price
      sqrtPrice
      tick
      observationIndex
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
      volumeUSD
      liquidityUSD
      feesUSD
      txCount
    }
  }
`,
)

export type GetV3BasePools = VariablesOf<typeof V3PoolsQuery>

export async function getV3BasePools(
  variables: GetV3BasePools,
  options?: RequestOptions,
): Promise<PoolV3<PoolBase>[]> {
  const url = `https://${SUSHI_DATA_API_HOST}`
  const chainId = variables.chainId as ChainId

  if (!isSushiSwapV3ChainId(chainId)) {
    throw new Error('Invalid chainId')
  }

  const result = await request(
    {
      url,
      document: V3PoolsQuery,
      variables: {
        chainId: chainId,
      },
      requestHeaders: SUSHI_REQUEST_HEADERS,
    },
    options,
  )

  if (result.v3Pools) {
    return result.v3Pools.map(
      (pool) =>
        ({
          id: pool.id as `${string}:0x${string}`,
          address: pool.address as Address,
          chainId,
          name: pool.name,
          swapFee: pool.swapFee,
          protocol: SushiSwapProtocol.SUSHISWAP_V3,
          isProtocolFeeEnabled: pool.isProtocolFeeEnabled,
          token0: {
            id: pool.token0.id as `${string}:0x${string}`,
            address: pool.token0.address as Address,
            chainId,
            decimals: pool.token0.decimals,
            name: pool.token0.name,
            symbol: pool.token0.symbol,
          },
          token1: {
            id: pool.token1.id as `${string}:0x${string}`,
            address: pool.token1.address as Address,
            chainId,
            decimals: pool.token1.decimals,
            name: pool.token1.name,
            symbol: pool.token1.symbol,
          },

          reserve0: BigInt(pool.reserve0),
          reserve1: BigInt(pool.reserve1),
          liquidity: BigInt(pool.liquidity),
          token0Price: pool.token0Price,
          token1Price: pool.token1Price,

          sqrtPrice: BigInt(pool.sqrtPrice),
          tick: BigInt(pool.tick),
          observationIndex: BigInt(pool.observationIndex),
          feeGrowthGlobal0X128: BigInt(pool.feeGrowthGlobal0X128),
          feeGrowthGlobal1X128: BigInt(pool.feeGrowthGlobal1X128),

          liquidityUSD: pool.liquidityUSD,
          volumeUSD: pool.volumeUSD,
          feesUSD: pool.feesUSD,
          txCount: pool.txCount,
        }) satisfies PoolV3<PoolBase>,
    )
  }
  return []
}


export type V3BasePool = NonNullable<Awaited<ReturnType<typeof getV3BasePools>>>[0]