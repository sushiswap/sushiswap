'use client'

import {
  GetTokenAnalysis,
  TokenAnalysis,
  getTokenAnalysis,
} from '@sushiswap/graph-client/data-api/queries/token-list-submission'
import { useQuery } from '@tanstack/react-query'
import { isAddressFast } from 'sushi/validate'

export function useTokenAnalysis(
  args: Partial<GetTokenAnalysis>,
  shouldFetch = true,
) {
  return useQuery<TokenAnalysis>({
    queryKey: ['token-analysis', args],
    queryFn: async () => await getTokenAnalysis(args as GetTokenAnalysis),
    enabled: Boolean(
      shouldFetch &&
        args.chainId &&
        args.address &&
        isAddressFast(args.address),
    ),
  })
}
