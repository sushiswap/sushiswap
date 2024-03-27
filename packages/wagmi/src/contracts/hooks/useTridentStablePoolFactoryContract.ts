import { PublicClient, getContract } from 'viem'
import { usePublicClient } from 'wagmi'

import { useMemo } from 'react'
import { TridentChainId } from 'sushi/config'
import { getTridentStablePoolFactoryContract } from '../actions'

export function useStablePoolFactoryContract(
  chainId: TridentChainId | undefined,
) {
  // For perf
  const client = usePublicClient() as PublicClient

  return useMemo(() => {
    if (!chainId) return null

    return getContract({
      ...getTridentStablePoolFactoryContract(chainId),
      client,
    })
  }, [client, chainId])
}
