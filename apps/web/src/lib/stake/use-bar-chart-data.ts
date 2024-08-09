'use client'

import { getSushiBarHistory } from '@sushiswap/graph-client/data-api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useBarChartData = (enabled = true) => {
  return useQuery({
    queryKey: ['useBarChartData'],
    queryFn: async () => await getSushiBarHistory({}),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 86400000, // 24hs
    enabled,
  })
}
