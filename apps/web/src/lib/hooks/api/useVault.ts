'use client'

import { GetVault, VaultV1, getVault } from '@sushiswap/graph-client/data-api'
import { useQuery } from '@tanstack/react-query'

export function useVault(args: GetVault, shouldFetch = true) {
  return useQuery<VaultV1 | null>({
    queryKey: ['vault', args],
    queryFn: async () => await getVault(args!),
    enabled: Boolean(shouldFetch && args.chainId),
  })
}
