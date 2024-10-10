'use client'

import {
  PendingTokens,
  getPendingTokens,
} from '@sushiswap/graph-client/data-api/queries/token-list-submission'
import { useQuery } from '@tanstack/react-query'

export function usePendingTokens(shouldFetch = true) {
  return useQuery<PendingTokens>({
    queryKey: ['pending-tokens'],
    queryFn: async () => await getPendingTokens(),
    enabled: Boolean(shouldFetch),
  })
}
