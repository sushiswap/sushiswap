'use client'

import {
  getV2PoolBuckets,
  getV3PoolBuckets,
} from '@sushiswap/graph-client/data-api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SushiSwapProtocol } from 'sushi'
import { SushiSwapV2ChainId, SushiSwapV3ChainId } from 'sushi/config'

interface UsePoolGraphDataParams {
  poolAddress: string
  chainId: SushiSwapV2ChainId | SushiSwapV3ChainId
  protocol: SushiSwapProtocol
  enabled?: boolean
}

export const usePoolGraphData = ({
  poolAddress,
  chainId,
  protocol,
  enabled = true,
}: UsePoolGraphDataParams) => {
  return useQuery({
    queryKey: ['usePoolGraphData', { poolAddress, chainId }],
    queryFn: async () => {
      const buckets =
        protocol === SushiSwapProtocol.SUSHISWAP_V2
          ? await getV2PoolBuckets({
              chainId,
              address: poolAddress,
            })
          : protocol === SushiSwapProtocol.SUSHISWAP_V3
            ? await getV3PoolBuckets({
                chainId,
                address: poolAddress,
              })
            : {
                dayBuckets: [],
                hourBuckets: [],
              }
      return buckets
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 3600, // 1hr
    enabled: Boolean(poolAddress && chainId && enabled),
  })
}
