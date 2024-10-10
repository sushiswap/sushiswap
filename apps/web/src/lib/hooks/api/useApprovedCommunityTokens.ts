'use client'

import {
  ApprovedCommunityTokens,
  getApprovedCommunityTokens,
} from '@sushiswap/graph-client/data-api/queries/token-list-submission'
import { useQuery } from '@tanstack/react-query'

export function useApprovedCommunityTokens(shouldFetch = true) {
  return useQuery<ApprovedCommunityTokens>({
    queryKey: ['approved-tokens'],
    queryFn: async () => await getApprovedCommunityTokens(),
    enabled: Boolean(shouldFetch),
  })
}
