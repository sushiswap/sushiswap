'use client'

import { ChefType } from '@sushiswap/client'
import { useMemo } from 'react'
import { masterChefV1Abi, masterChefV2Abi, miniChefAbi } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import { Address, getContract } from 'viem'
import { usePublicClient } from 'wagmi'

// TODO move to package
export const MASTERCHEF_ADDRESS = {
  [ChainId.ETHEREUM]: '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd',
  // [ChainId.ROPSTEN]: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
  // [ChainId.RINKEBY]: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
  // [ChainId.GÖRLI]: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
  // [ChainId.KOVAN]: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
} as const

export const MASTERCHEF_V2_ADDRESS = {
  [ChainId.ETHEREUM]: '0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d',
} as const

export const MINICHEF_ADDRESS = {
  [ChainId.POLYGON]: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F',
  [ChainId.GNOSIS]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  [ChainId.HARMONY]: '0x67dA5f2FfaDDfF067AB9d5F025F8810634d84287',
  [ChainId.ARBITRUM]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
  [ChainId.CELO]: '0x8084936982D089130e001b470eDf58faCA445008',
  [ChainId.MOONRIVER]: '0x3dB01570D97631f69bbb0ba39796865456Cf89A5',
  [ChainId.FUSE]: '0x182CD0C6F1FaEc0aED2eA83cd0e160c8Bd4cb063',
  [ChainId.FANTOM]: '0xf731202A3cf7EfA9368C2d7bD613926f7A144dB5',
  [ChainId.MOONBEAM]: '0x011E52E4E40CF9498c79273329E8827b21E2e581',
  [ChainId.KAVA]: '0xf731202A3cf7EfA9368C2d7bD613926f7A144dB5',
  [ChainId.METIS]: '0x1334c8e873E1cae8467156e2A81d1C8b566B2da1',
  [ChainId.BOBA]: '0x75f52766A6a23F736edEfCD69dfBE6153a48c3F3',
  [ChainId.ARBITRUM_NOVA]: '0xC09756432dAD2FF50B2D40618f7B04546DD20043',
  [ChainId.BTTC]: '0xC09756432dAD2FF50B2D40618f7B04546DD20043',
  [ChainId.OPTIMISM]: '0xB25157bF349295a7Cd31D1751973f426182070D6',
  [ChainId.AVALANCHE]: '0xe11252176CEDd4a493Aec9767192C06A04A6B04F',
  [ChainId.BSC]: '0x5219C5E32b9FFf87F29d5A833832c29134464aaa',
} as const

export const _getMasterChefContractConfig = (
  chainId: keyof typeof MASTERCHEF_ADDRESS,
) =>
  ({
    chainId,
    address: MASTERCHEF_ADDRESS[chainId] as Address,
    abi: masterChefV1Abi,
  }) as const

export const getMasterChefContractV2Config = (
  chainId: keyof typeof MASTERCHEF_V2_ADDRESS,
) =>
  ({
    chainId,
    address: MASTERCHEF_V2_ADDRESS[chainId] as Address,
    abi: masterChefV2Abi,
  }) as const

export const getMiniChefContractConfig = (
  chainId: keyof typeof MINICHEF_ADDRESS,
) => {
  return {
    chainId,
    address: MINICHEF_ADDRESS[chainId] as Address,
    abi: miniChefAbi,
  } as const
}

export const getMasterChefContractConfig = (
  chainId: ChainId,
  chef: Omit<ChefType, 'Merkl'>,
) => {
  if (chef === ChefType.MasterChefV1)
    return _getMasterChefContractConfig(
      chainId as keyof typeof MASTERCHEF_ADDRESS,
    )
  if (chef === ChefType.MasterChefV2)
    return getMasterChefContractV2Config(
      chainId as keyof typeof MASTERCHEF_V2_ADDRESS,
    )
  if (chef === ChefType.MiniChef)
    return getMiniChefContractConfig(chainId as keyof typeof MINICHEF_ADDRESS)

  throw new Error('Invalid chef type')
}

export function useMasterChefContract(
  chainId: ChainId,
  chef: Omit<ChefType, 'Merkl'>,
) {
  const client = usePublicClient({ chainId }) as any

  return useMemo(() => {
    if (!chainId) return null

    // @ts-ignore
    return getContract({
      ...getMasterChefContractConfig(chainId, chef),
      client,
    })
  }, [chainId, client, chef])
}
