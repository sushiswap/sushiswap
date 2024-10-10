import { useQuery } from '@tanstack/react-query'
import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import type { Token } from '~aptos/_common/lib/types/token'
import { useCustomTokens } from './use-custom-tokens'
import { useNetwork } from './use-network'

interface GetTokenWithQueryCacheFn {
  address: string
  hasToken: (currency: string | Token) => boolean
  customTokens: Record<string, Token>
  network: SupportedNetwork
}

export async function getTokenDetails({
  address,
  hasToken,
  customTokens,
  network,
}: GetTokenWithQueryCacheFn) {
  if (hasToken(address)) {
    const {
      address: tokenAddress,
      name,
      symbol,
      decimals,
    } = customTokens[`${address}`]
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
    } as Token
  }

  const tokenAddress = address.split(':')

  const response = await fetch(
    `${chains[network].api.fetchUrlPrefix}/v1/accounts/${tokenAddress[0]}/resource/0x1::coin::CoinInfo<${address}>`,
  )

  if (response.status === 200) {
    const data = await response.json()
    const tokenAddress = data?.type.slice(20).slice(0, -1)

    return {
      address: tokenAddress,
      decimals: data.data.decimals,
      name: data.data.name,
      symbol: data.data.symbol,
    } as Token
  }

  return undefined
}

interface UseTokenParams {
  address: string
  enabled?: boolean
  keepPreviousData?: boolean
}

export function useTokenWithCache({
  address,
  enabled = true,
  keepPreviousData = true,
}: UseTokenParams) {
  const { data: customTokens, hasToken } = useCustomTokens()
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['token', { address, network }],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is required')
      }

      return getTokenDetails({ address, hasToken, customTokens, network })
    },
    enabled: Boolean(enabled && address),
    refetchOnWindowFocus: false,
    placeholderData: (prevData) => (keepPreviousData ? prevData : undefined),
    retry: false,
  })
}
