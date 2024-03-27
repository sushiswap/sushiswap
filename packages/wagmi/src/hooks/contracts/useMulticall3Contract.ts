'use client'

import { publicWagmiConfig } from '@sushiswap/wagmi-config'
import { useMemo } from 'react'
import { multicall3Abi } from 'sushi/abi'
import { PublicClient, getContract } from 'viem'
import { usePublicClient } from 'wagmi'

export type Multicall3ChainId =
  (typeof publicWagmiConfig)['chains'][number]['id']

export const getMulticall3ContractConfig = (
  chainId: Multicall3ChainId | undefined,
) => ({
  address: publicWagmiConfig.chains.find((chain) => chain?.id === chainId)!
    .contracts.multicall3.address,
  abi: multicall3Abi,
})

export function useMulticall3Contract(chainId: Multicall3ChainId | undefined) {
  const client = usePublicClient({ chainId }) as PublicClient

  return useMemo(() => {
    if (!chainId) return null

    getContract({
      ...getMulticall3ContractConfig(chainId),
      client,
    })
  }, [client, chainId])
}
