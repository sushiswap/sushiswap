'use client'

import { getSushiBarStats } from '@sushiswap/graph-client/data-api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useBarData = (enabled = true) => {
  return useQuery({
    queryKey: ['useBarData'],
    queryFn: async () => await getSushiBarStats({}),
    placeholderData: keepPreviousData,
    staleTime: 30000,
    gcTime: 86400000, // 24hs
    enabled,
  })
}
