import { useCustomTokens } from '@sushiswap/hooks'
import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { useQuery } from '@tanstack/react-query'
import { getToken as getTokenWeb3 } from '@wagmi/core/actions'
import { useCallback } from 'react'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { Address, isAddress } from 'viem'
import { useConfig } from 'wagmi'

interface UseTokenParams<T extends boolean> {
  chainId: ChainId | undefined
  address: string | undefined | null
  withStatus?: T
  enabled?: boolean
  keepPreviousData?: boolean
}

type UseTokenReturn<T> = T extends true
  ? { token: Token; status: 'UNKNOWN' | 'APPROVED' | 'DISAPPROVED' }
  : Token

type Data = {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
  status: 'UNKNOWN' | 'APPROVED' | 'DISAPPROVED'
}

export const getTokenWithQueryCacheHydrate = <T extends boolean>(
  chainId: ChainId | undefined,
  data: Data,
  withStatus: T | undefined,
): UseTokenReturn<T> | undefined => {
  if (data && chainId) {
    const { address, name, symbol, decimals } = data
    const token = new Token({
      chainId,
      name,
      decimals,
      symbol,
      address,
    })

    if (withStatus) {
      return {
        token,
        status: data.status,
      } as UseTokenReturn<T>
    }

    return token as UseTokenReturn<T>
  }

  return undefined
}

interface GetTokenWithQueryCacheFn {
  chainId: ChainId | undefined
  address: string | undefined | null
  customTokens: Record<string, Token>
  hasToken: (cur: string | Token) => boolean
  config: PublicWagmiConfig
}

export const getTokenWithCacheQueryFn = async ({
  chainId,
  address,
  customTokens,
  hasToken,
  config,
}: GetTokenWithQueryCacheFn) => {
  // Try fetching from localStorage
  if (chainId && hasToken(`${chainId}:${address}`)) {
    const {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      id,
    } = customTokens[`${chainId}:${address}`]
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      status: 'UNKNOWN',
      id,
    } as Data
  }

  // Try fetching from API
  const resp = await fetch(`https://tokens.sushi.com/v0/${chainId}/${address}`)
  if (resp.status === 200) {
    const { address, name, symbol, decimals, status, id }: Data =
      await resp.json()

    return { address, name, symbol, decimals, status, id }

    // Try fetching from wagmi
  } else if (chainId) {
    const resp = await getTokenWeb3(config, {
      address: address as Address,
      chainId,
    })
    const { decimals, address: tokenAddress, symbol, name } = resp

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      status: 'UNKNOWN',
      id: `${chainId}:${tokenAddress}`,
    } as Data
  } else {
    throw Error('Could not fetch token')
  }
}

export const useTokenWithCache = <T extends boolean = false>({
  chainId,
  address,
  withStatus,
  enabled = true,
  keepPreviousData = true,
}: UseTokenParams<T>) => {
  const { data: customTokens, hasToken } = useCustomTokens()
  const select = useCallback(
    (data: Data) => getTokenWithQueryCacheHydrate<T>(chainId, data, withStatus),
    [chainId, withStatus],
  )

  const config = useConfig()

  return useQuery({
    queryKey: ['token', { chainId, address }],
    queryFn: async () =>
      getTokenWithCacheQueryFn({
        chainId,
        address,
        customTokens,
        hasToken,
        config,
      }),
    enabled: Boolean(enabled && chainId && address && isAddress(address)),
    select,
    keepPreviousData,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })
}
