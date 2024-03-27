'use client'

import { useMemo } from 'react'
import { bentoBoxV1Abi } from 'sushi/abi'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'
import { PublicClient, getContract } from 'viem'
import { usePublicClient } from 'wagmi'

export const getBentoBoxContractConfig = (chainId: BentoBoxChainId) => ({
  address: BENTOBOX_ADDRESS[chainId],
  abi: bentoBoxV1Abi,
})

export function useBentoBoxContract(chainId: BentoBoxChainId | undefined) {
  const client = usePublicClient({ chainId }) as PublicClient

  return useMemo(() => {
    if (!chainId) return null

    return getContract({
      client,
      ...getBentoBoxContractConfig(chainId),
    })
  }, [client, chainId])
}

export type BentoBox = NonNullable<ReturnType<typeof useBentoBoxContract>>
