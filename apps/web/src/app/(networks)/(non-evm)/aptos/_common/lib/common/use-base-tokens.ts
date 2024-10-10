import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SupportedNetwork } from '~aptos/_common/config/chains'
import { tokenlists } from '~aptos/_common/config/tokenlists'
import { Token } from '~aptos/_common/lib/types/token'
import { useNetwork } from './use-network'

export const fetchBaseTokensQueryFn = async ({
  network,
}: { network: SupportedNetwork }) => {
  const baseTokens = tokenlists[network].tokens

  return baseTokens.reduce<Record<string, Token>>(
    (acc, { address, decimals, name, symbol: _symbol, logoURI, ...rest }) => {
      let symbol: string = _symbol

      if ('panoraSymbol' in rest) {
        symbol = rest.panoraSymbol
      }

      acc[address] = {
        name,
        decimals,
        symbol,
        address,
        logoURI,
      }
      return acc
    },
    {},
  )
}

export function getBaseTokensWithoutKey({
  network,
}: { network: SupportedNetwork }) {
  const baseTokens = tokenlists[network].tokens

  const tokens = Object.values(baseTokens)
  return tokens
}

export function useBaseTokens() {
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['base-tokens', { network }],
    queryFn: () => fetchBaseTokensQueryFn({ network }),
    placeholderData: keepPreviousData,
    // staleTime: 900000, // 15 mins
    // gcTime: 86400000, // 24hs
  })
}
