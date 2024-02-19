import { useQuery } from '@tanstack/react-query'
import TOKENS from './../config/tokenList.json'
import { Token } from './tokenType'
export type Data = {
  address: string
  decimals: number
  name: string | undefined
  symbol: string | undefined
  logoURI?: string
}

const BASE_TOKENS: Token[] = TOKENS.tokens
export const fetchTokensQueryFn = async () => {
  return BASE_TOKENS.reduce<Record<string, Token>>(
    (acc, { address, decimals, name, symbol, logoURI }) => {
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

export function getTokensWithoutKey() {
  const tokens: Token[] = []
  Object.entries(BASE_TOKENS).forEach(([, value]) => {
    tokens.push(value)
  })
  return tokens.map((token) => token)
}

export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: fetchTokensQueryFn,
    keepPreviousData: true,
    // staleTime: 900000, // 15 mins
    // cacheTime: 86400000, // 24hs
  })
}
