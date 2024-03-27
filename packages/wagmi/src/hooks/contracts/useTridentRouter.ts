'use client'

import { useMemo } from 'react'
import { tridentRouterAbi } from 'sushi/abi'
import { TRIDENT_ROUTER_ADDRESS, TridentChainId } from 'sushi/config'
import { getContract } from 'viem'
import { useWalletClient } from 'wagmi'

export const getTridentRouterContractConfig = (chainId: TridentChainId) => ({
  address: TRIDENT_ROUTER_ADDRESS[chainId],
  abi: tridentRouterAbi,
})

export function useTridentRouterContract(chainId: TridentChainId | undefined) {
  const { data: walletClient } = useWalletClient()

  return useMemo(() => {
    if (!chainId || !walletClient) return null

    return getContract({
      ...getTridentRouterContractConfig(chainId),
      client: walletClient,
    })
  }, [walletClient, chainId])
}
