import { useCustomTokens } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'
import { useAllPrices } from 'src/lib/hooks/react-query'
import { SushiSwapV3ChainId } from 'sushi/config'
import { Amount, Token } from 'sushi/currency'
import { Position, SushiSwapV3Pool } from 'sushi/pool/sushiswap-v3'

import { useMemo } from 'react'
import { Address } from 'viem'
import { useConfig } from 'wagmi'
import { usePrices } from '~evm/_common/ui/price-provider/price-provider/use-prices'
import { getConcentratedLiquidityPool } from '../../pools/actions/getConcentratedLiquidityPool'
import {
  getTokenWithCacheQueryFn,
  getTokenWithQueryCacheHydrate,
} from '../../tokens/useTokenWithCache'
import { getConcentratedLiquidityPositions } from '../actions/getConcentratedLiquidityPositions'
import { ConcentratedLiquidityPosition } from '../types'

interface UseConcentratedLiquidityPositionsData
  extends ConcentratedLiquidityPosition {
  pool: SushiSwapV3Pool
  position: {
    position: Position
    positionUSD: number
    unclaimedUSD: number
  }
}

interface UseConcentratedLiquidityPositionsParams {
  account: Address | undefined
  chainIds: SushiSwapV3ChainId[]
  enabled?: boolean
}

export const useConcentratedLiquidityPositions = ({
  account,
  chainIds,
  enabled = true,
}: UseConcentratedLiquidityPositionsParams) => {
  const { data: customTokens, hasToken } = useCustomTokens()

  const {
    data: allPrices,
    isError: isAllPricesError,
    isLoading: isAllPricesInitialLoading,
  } = useAllPrices({
    enabled: chainIds.length > 1,
  })
  const {
    data: chainPrices,
    isError: isChainPricesError,
    isLoading: isChainPricesInitialLoading,
  } = usePrices({
    chainId: chainIds?.length === 1 ? chainIds[0] : undefined,
  })

  const prices = useMemo(() => {
    if (chainIds.length > 1) {
      return allPrices
    }

    if (chainIds.length === 1 && chainPrices) {
      return new Map([[chainIds[0], chainPrices]])
    }
  }, [allPrices, chainPrices, chainIds])
  const isPriceInitialLoading =
    isAllPricesInitialLoading || isChainPricesInitialLoading
  const isPriceError = isAllPricesError || isChainPricesError

  const config = useConfig()

  const {
    data: positions,
    isError: isPositionsError,
    isLoading: isPositionsInitialLoading,
  } = useQuery({
    queryKey: [
      'useConcentratedLiquidityPositions',
      { chainIds, account, prices },
    ],
    queryFn: async () => {
      const data = await getConcentratedLiquidityPositions({
        account: account,
        chainIds,
        config,
      })

      if (data && (prices || isPriceError)) {
        const pools = await Promise.allSettled(
          data.map(async (el) => {
            const [token0Data, token1Data] = await Promise.all([
              getTokenWithCacheQueryFn({
                chainId: el.chainId,
                hasToken,
                customTokens,
                address: el.token0,
                config,
              }),
              getTokenWithCacheQueryFn({
                chainId: el.chainId,
                hasToken,
                customTokens,
                address: el.token1,
                config,
              }),
            ])

            const token0 = getTokenWithQueryCacheHydrate(el.chainId, token0Data)
            const token1 = getTokenWithQueryCacheHydrate(el.chainId, token1Data)

            const pool = (await getConcentratedLiquidityPool({
              chainId: el.chainId,
              token0,
              token1,
              feeAmount: el.fee,
              config,
            })) as SushiSwapV3Pool

            const position = new Position({
              pool,
              liquidity: el.liquidity,
              tickLower: el.tickLower,
              tickUpper: el.tickUpper,
            })

            const amountToUsd = (amount: Amount<Token>) => {
              const _price = prices
                ?.get(el.chainId)
                ?.get(amount.currency.address)

              if (!amount?.greaterThan(0n) || !_price) return 0
              const price = Number(
                Number(amount.toExact()) * Number(_price.toFixed(10)),
              )
              if (Number.isNaN(price) || price < 0.000001) {
                return 0
              }

              return price
            }

            const positionUSD =
              amountToUsd(position.amount0) + amountToUsd(position.amount1)
            const unclaimedUSD =
              amountToUsd(
                Amount.fromRawAmount(pool.token0, el.fees?.[0] || 0),
              ) +
              amountToUsd(Amount.fromRawAmount(pool.token1, el.fees?.[1] || 0))

            return {
              pool,
              position: {
                position,
                positionUSD,
                unclaimedUSD,
              },
            }
          }),
        )

        return pools.reduce<UseConcentratedLiquidityPositionsData[]>(
          (acc, el, i) => {
            if (el.status === 'fulfilled') {
              acc.push({
                ...data[i],
                ...el.value,
              })
            }

            return acc
          },
          [],
        )
      }

      return []
    },
    refetchInterval: Infinity,
    enabled: Boolean(
      account && chainIds && enabled && (prices || isPriceError),
    ),
  })

  return {
    data: positions,
    isError: isPositionsError || isPriceError,
    isInitialLoading: isPositionsInitialLoading || isPriceInitialLoading,
  }
}
