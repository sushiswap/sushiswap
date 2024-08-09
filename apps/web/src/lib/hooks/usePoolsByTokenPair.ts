'use client'

import { useQuery } from '@tanstack/react-query'
import { getV3PoolsByTokenPair } from 'src/lib/graph'

function usePoolsByTokenPair(tokenId0?: string, tokenId1?: string) {
  return useQuery({
    queryKey: ['poolsByTokenPair', tokenId0, tokenId1],
    queryFn: () => {
      if (!tokenId0 || !tokenId1) return []

      return getV3PoolsByTokenPair(tokenId0, tokenId1)
    },
    enabled: !!tokenId0 && !!tokenId1,
  })
}

export { usePoolsByTokenPair }
