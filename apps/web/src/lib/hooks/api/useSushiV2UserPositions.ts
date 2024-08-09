'use client'

import {
  GetV2Positions,
  V2Position,
  getV2Positions,
} from '@sushiswap/graph-client/data-api'
import { useQuery } from '@tanstack/react-query'

export function useSushiV2UserPositions(
  args: Partial<GetV2Positions>,
  shouldFetch = true,
) {
  return useQuery<V2Position[]>({
    queryKey: ['v2-positions', args],
    queryFn: async () => await getV2Positions(args as GetV2Positions),
    enabled: Boolean(shouldFetch && args.chainId && args.user),
  })
}
