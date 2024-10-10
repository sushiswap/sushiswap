import { useMemo } from 'react'
import { useBaseTokens } from '~aptos/_common/lib/common/use-base-tokens'
import { useStablePrices } from '~aptos/_common/lib/common/use-stable-prices'
import { usePools } from './use-pools'

export type PoolExtended = NonNullable<
  ReturnType<typeof usePoolsExtended>['data']
>[number]

export function usePoolsExtended() {
  const { data: pools, isLoading: isPoolsLoading } = usePools()

  const tokens = useMemo(() => {
    return [...new Set(pools?.flatMap((pool) => [pool.token0, pool.token1]))]
  }, [pools])

  const { data: prices, isLoading: isPricesLoading } = useStablePrices({
    currencies: tokens,
  })

  const { data: baseTokens } = useBaseTokens()

  const data = useMemo(() => {
    if (!pools || !prices || !baseTokens) {
      return undefined
    }

    return pools.map((pool) => {
      let token0 = pool.token0
      let token1 = pool.token1

      token0 = baseTokens[token0.address] || token0
      token1 = baseTokens[token1.address] || token1

      const tokenPrice0USD = prices[token0.address]
      const tokenPrice1USD = prices[token1.address]

      const reserve0USD =
        tokenPrice0USD * (Number(pool.reserve0) / 10 ** token0.decimals)
      const reserve1USD =
        tokenPrice1USD * (Number(pool.reserve1) / 10 ** token1.decimals)

      return {
        ...pool,
        id: pool.id,
        type: pool.type,
        token0,
        token1,
        reserve0USD: reserve0USD,
        reserve1USD: reserve1USD,
        reserveUSD: reserve0USD + reserve1USD,
      }
    })
  }, [pools, prices, baseTokens])

  return { data, isLoading: isPoolsLoading || isPricesLoading }
}
