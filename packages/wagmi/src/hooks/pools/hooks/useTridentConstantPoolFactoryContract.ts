import { useMemo } from 'react'
import { tridentConstantPoolFactoryAbi } from 'sushi/abi'
import {
  TRIDENT_CONSTANT_POOL_FACTORY_ADDRESS,
  TridentChainId,
} from 'sushi/config'
import { PublicClient, getContract } from 'viem'
import { usePublicClient } from 'wagmi'

export const getTridentConstantPoolFactoryContract = (
  chainId: TridentChainId,
) => ({
  address: TRIDENT_CONSTANT_POOL_FACTORY_ADDRESS[chainId],
  abi: tridentConstantPoolFactoryAbi,
})

export function useTridentConstantPoolFactoryContract(
  chainId: TridentChainId | undefined,
) {
  const client = usePublicClient({ chainId }) as PublicClient

  return useMemo(() => {
    if (!chainId) return null

    return getContract({
      ...getTridentConstantPoolFactoryContract(chainId),
      client,
    })
  }, [client, chainId])
}
