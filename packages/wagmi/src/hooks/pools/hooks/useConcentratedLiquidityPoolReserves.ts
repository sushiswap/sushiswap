import { useQuery } from '@tanstack/react-query'
import { SushiSwapV3ChainId } from 'sushi/config'
import { SushiSwapV3Pool } from 'sushi/pool'
import { useConfig } from 'wagmi'
import { getConcentratedLiquidityPoolReserves } from '../actions'

interface UseConcentratedLiquidityPoolReserves {
  pool: SushiSwapV3Pool | null | undefined
  chainId: SushiSwapV3ChainId
  enabled?: boolean
}

export const useConcentratedLiquidityPoolReserves = ({
  pool,
  chainId,
  enabled = true,
}: UseConcentratedLiquidityPoolReserves) => {
  const config = useConfig()

  return useQuery({
    queryKey: [
      'useConcentratedLiquidityPoolReserves',
      {
        token0: pool?.token0,
        token1: pool?.token1,
        feeAmount: pool?.fee,
        chainId,
      },
    ],
    queryFn: async () => {
      if (pool) {
        return getConcentratedLiquidityPoolReserves({
          pool,
          chainId,
          config,
        })
      }

      return null
    },
    refetchInterval: 10000,
    enabled: Boolean(enabled && pool),
  })
}
