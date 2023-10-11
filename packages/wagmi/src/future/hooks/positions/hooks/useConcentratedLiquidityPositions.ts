import { Amount, Token } from 'sushi/currency'
import { useCustomTokens, useLocalStorage } from '@sushiswap/hooks'
import { useAllPrices } from '@sushiswap/react-query'
import {
  Position,
  SushiSwapV3ChainId,
  SushiSwapV3Pool,
} from '@sushiswap/v3-sdk'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'wagmi'

import { getConcentratedLiquidityPool } from '../../pools'
import {
  getTokenWithCacheQueryFn,
  getTokenWithQueryCacheHydrate,
} from '../../tokens'
import { getConcentratedLiquidityPositions } from '../actions'
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
  const [tokenApi] = useLocalStorage('tokenApi', true)
  const { data: customTokens, hasToken } = useCustomTokens()
  const { data: prices, isError: isPriceError } = useAllPrices()

  return useQuery({
    queryKey: [
      'useConcentratedLiquidityPositions',
      { chainIds, account, prices, tokenApi },
    ],
    queryFn: async () => {
      const data = await getConcentratedLiquidityPositions({
        account: account,
        chainIds,
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
                tokenApi,
              }),
              getTokenWithCacheQueryFn({
                chainId: el.chainId,
                hasToken,
                customTokens,
                address: el.token1,
                tokenApi,
              }),
            ])

            const token0 = getTokenWithQueryCacheHydrate(
              el.chainId,
              token0Data,
              false,
            )
            const token1 = getTokenWithQueryCacheHydrate(
              el.chainId,
              token1Data,
              false,
            )

            const pool = (await getConcentratedLiquidityPool({
              chainId: el.chainId,
              token0,
              token1,
              feeAmount: el.fee,
            })) as SushiSwapV3Pool

            const position = new Position({
              pool,
              liquidity: el.liquidity,
              tickLower: el.tickLower,
              tickUpper: el.tickUpper,
            })

            const amountToUsd = (amount: Amount<Token>) => {
              if (
                !amount?.greaterThan(0n) ||
                !prices?.[el.chainId]?.[amount.currency.wrapped.address]
              )
                return 0
              const price = Number(
                Number(amount.toExact()) *
                  Number(
                    prices[el.chainId][amount.currency.wrapped.address].toFixed(
                      10,
                    ),
                  ),
              )
              if (isNaN(price) || price < 0.000001) {
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
    refetchInterval: 3000,
    enabled: Boolean(account && chainIds && enabled),
  })
}
