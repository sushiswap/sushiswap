'use client'

import {
  GetSmartPools,
  SmartPoolsV1,
  getSmartPools,
} from '@sushiswap/graph-client/data-api'
import { useQuery } from '@tanstack/react-query'

export function useSmartPools(args: GetSmartPools, shouldFetch = true) {
  return useQuery<SmartPoolsV1>({
    queryKey: ['smart-pools', args],
    queryFn: async () => await getSmartPools(args),
    enabled: Boolean(shouldFetch && args.chainId),
  })
}
