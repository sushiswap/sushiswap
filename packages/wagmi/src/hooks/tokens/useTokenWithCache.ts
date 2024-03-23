import { getToken, saveTokens } from '@sushiswap/dexie'
import { useCustomTokens } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { isAddress } from 'viem'
import { Address } from 'wagmi'
import { fetchToken } from 'wagmi/actions'

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
}

export const getTokenWithCacheQueryFn = async ({
  chainId,
  address,
  customTokens,
  hasToken,
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

  // Try fetching from dexie
  const token = await getToken({ chainId, address })
  if (token) {
    return token as Data
  }

  // Try fetching from API
  const resp = await fetch(`https://tokens.sushi.com/v2/${chainId}/${address}`)
  if (resp.status === 200) {
    const { address, name, symbol, decimals, status, id }: Data =
      await resp.json()
    const [chainId] = id.split(':')

    await saveTokens({
      tokens: [
        {
          address: address.toLowerCase(),
          chainId: Number(chainId),
          name,
          symbol,
          decimals,
          status,
          id,
        },
      ],
    })
    return { address, name, symbol, decimals, status, id }

    // Try fetching from wagmi
  } else if (chainId) {
    const resp = await fetchToken({ address: address as Address, chainId })
    const { decimals, address: tokenAddress, symbol, name } = resp

    await saveTokens({
      tokens: [
        {
          address: tokenAddress,
          chainId: Number(chainId),
          name,
          symbol,
          decimals,
          status: 'UNKNOWN',
          id: `${chainId}:${tokenAddress}`,
        },
      ],
    })

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

  return useQuery({
    queryKey: ['token', { chainId, address }],
    queryFn: async () =>
      getTokenWithCacheQueryFn({ chainId, address, customTokens, hasToken }),
    enabled: Boolean(enabled && chainId && address && isAddress(address)),
    select,
    keepPreviousData,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })
}
