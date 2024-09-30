import {
  TopNonEvmPools,
  getTopNonEvmPools,
} from '@sushiswap/graph-client/data-api'
import { useQuery } from '@tanstack/react-query'

interface UseTopPools {
  enabled?: boolean
}

export type TopPool = TopNonEvmPools[number]

export function useTopPools(
  { enabled = true }: UseTopPools = { enabled: true },
) {
  return useQuery({
    queryKey: ['pools', { chainId: 'tron' }],
    queryFn: async () => await getTopNonEvmPools({ chainId: 'tron' }),
    enabled: Boolean(enabled),
  })
}
