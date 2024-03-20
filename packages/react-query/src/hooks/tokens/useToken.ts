import { getToken, saveTokens } from '@sushiswap/dexie'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { isAddress } from 'viem'

interface UseTokenParams<T extends boolean> {
  chainId: ChainId | undefined
  address: string | undefined
  withStatus?: T
  enabled?: boolean
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

const hydrate = <T extends boolean>(
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

/**
 * @deprecated use @sushiswap/wagmi/useTokenWithCache
 */
export const useToken = <T extends boolean = false>({
  chainId,
  address,
  withStatus,
  enabled = true,
}: UseTokenParams<T>) => {
  const select = useCallback(
    (data: Data) => hydrate<T>(chainId, data, withStatus),
    [chainId, withStatus],
  )

  return useQuery({
    queryKey: ['token', { chainId, address }],
    queryFn: async () => {
      // const customTokens = localStorage.getItem('sushi.customTokens')
      // if (customTokens?.includes(`${chainId}:${address}`)) {
      //     return JSON.parse(customTokens)[`${chainId}:${address}`] as Data
      // }

      // Try fetching from cache
      const token = await getToken({ chainId, address })
      if (token) {
        return token as Data
      }

      // Fallback to api
      const resp = await fetch(
        `https://tokens.sushi.com/v2/${chainId}/${address}`,
      )
      if (resp.status === 200) {
        const { address, name, symbol, decimals, status, id }: Data =
          await resp.json()
        const [chainId] = id.split(':')

        // Save to cache
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
      } else {
        throw Error(
          `https://tokens.sushi.com/v2/${chainId}/${address}: Token not found`,
        )
      }
    },
    enabled: Boolean(enabled && chainId && address && isAddress(address)),
    select,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })
}
