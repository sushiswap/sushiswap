import { useMemo } from 'react'
import { SUSHISWAP_V3_FACTORY_ADDRESS, SushiSwapV3ChainId } from 'sushi/config'
import { Address, PublicClient, getContract } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

export const getV3FactoryContractConfig = (chainId: SushiSwapV3ChainId) => ({
  address: SUSHISWAP_V3_FACTORY_ADDRESS[chainId] as Address,
  abi: [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'uint24', name: 'fee', type: 'uint24' },
        {
          indexed: true,
          internalType: 'int24',
          name: 'tickSpacing',
          type: 'int24',
        },
      ],
      name: 'FeeAmountEnabled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnerChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'token0',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'token1',
          type: 'address',
        },
        { indexed: true, internalType: 'uint24', name: 'fee', type: 'uint24' },
        {
          indexed: false,
          internalType: 'int24',
          name: 'tickSpacing',
          type: 'int24',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      name: 'PoolCreated',
      type: 'event',
    },
    {
      inputs: [
        { internalType: 'address', name: 'tokenA', type: 'address' },
        { internalType: 'address', name: 'tokenB', type: 'address' },
        { internalType: 'uint24', name: 'fee', type: 'uint24' },
      ],
      name: 'createPool',
      outputs: [{ internalType: 'address', name: 'pool', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint24', name: 'fee', type: 'uint24' },
        { internalType: 'int24', name: 'tickSpacing', type: 'int24' },
      ],
      name: 'enableFeeAmount',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint24', name: '', type: 'uint24' }],
      name: 'feeAmountTickSpacing',
      outputs: [{ internalType: 'int24', name: '', type: 'int24' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: '', type: 'address' },
        { internalType: 'address', name: '', type: 'address' },
        { internalType: 'uint24', name: '', type: 'uint24' },
      ],
      name: 'getPool',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'parameters',
      outputs: [
        { internalType: 'address', name: 'factory', type: 'address' },
        { internalType: 'address', name: 'token0', type: 'address' },
        { internalType: 'address', name: 'token1', type: 'address' },
        { internalType: 'uint24', name: 'fee', type: 'uint24' },
        { internalType: 'int24', name: 'tickSpacing', type: 'int24' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
      name: 'setOwner',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const,
})

export function useV3FactoryContract(chainId: SushiSwapV3ChainId | undefined) {
  const publicClient = usePublicClient({
    chainId,
  }) as PublicClient
  const { data: walletClient } = useWalletClient({ chainId })

  return useMemo(() => {
    if (!chainId) return null

    return getContract({
      ...getV3FactoryContractConfig(chainId),
      client: walletClient || publicClient!,
    })
  }, [chainId, publicClient, walletClient])
}
