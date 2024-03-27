import { useQuery } from '@tanstack/react-query'
import { SushiSwapV3ChainId } from 'sushi/config'

import { useConfig } from 'wagmi'
import { getConcentratedLiquidityPositionsFromTokenIds } from '../actions'

interface UseConcentratedLiquidityPositionsFromTokenIdsParams {
  keys: { tokenId: bigint; chainId: SushiSwapV3ChainId }[] | undefined
  enabled?: boolean
}

export const useConcentratedLiquidityPositionsFromTokenIds = ({
  keys,
  enabled = true,
}: UseConcentratedLiquidityPositionsFromTokenIdsParams) => {
  const config = useConfig()

  return useQuery({
    queryKey: ['useConcentratedLiquidityPositionsFromTokenIds', { keys }],
    queryFn: async () => {
      if (!keys) return null

      return getConcentratedLiquidityPositionsFromTokenIds({
        tokenIds: keys,
        config,
      })
    },
    refetchInterval: 10000,
    enabled: Boolean(keys && keys.length > 0 && enabled),
  })
}
