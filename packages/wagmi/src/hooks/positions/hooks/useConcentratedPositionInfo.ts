import { useQuery } from '@tanstack/react-query'
import { SushiSwapV3ChainId } from 'sushi/config'
import { Type } from 'sushi/currency'
import { Position } from 'sushi/pool'
import { stringify } from 'viem'

import { useConfig } from 'wagmi'
import { getConcentratedLiquidityPool } from '../../pools'
import { useConcentratedLiquidityPositionsFromTokenId } from './useConcentratedPositionsFromTokenId'

interface UseConcentratedLiquidityPositionsFromTokenIdParams {
  token0: Type | undefined
  token1: Type | undefined
  tokenId: number | string | undefined
  chainId: SushiSwapV3ChainId
  enabled?: boolean
}

export const useConcentratedPositionInfo = ({
  token0,
  token1,
  tokenId,
  chainId,
  enabled = true,
}: UseConcentratedLiquidityPositionsFromTokenIdParams) => {
  const { data: positionDetails } =
    useConcentratedLiquidityPositionsFromTokenId({
      chainId,
      tokenId,
    })

  const config = useConfig()

  return useQuery({
    queryKey: [
      'useConcentratedPositionInfo',
      { chainId, token0, token1, tokenId, positionDetails },
    ],
    queryFn: async () => {
      const pool = await getConcentratedLiquidityPool({
        chainId,
        token0,
        token1,
        feeAmount: positionDetails?.fee,
        config,
      })

      let position = null
      if (pool && positionDetails) {
        position = new Position({
          pool,
          liquidity: positionDetails.liquidity.toString(),
          tickLower: positionDetails.tickLower,
          tickUpper: positionDetails.tickUpper,
        })
      }

      return position
    },
    refetchInterval: 10000,
    enabled: Boolean(token0 && token1 && chainId && enabled && positionDetails),
    keepPreviousData: true,
    queryKeyHashFn: stringify,
  })
}
