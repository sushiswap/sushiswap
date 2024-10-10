import { useDebounce } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'
import type { Token } from '~aptos/_common/lib/types/token'
import {
  filterTokens,
  getSortedTokensByQuery,
  tokenComparator,
} from './get-sorted-tokens-by-query'

interface Params {
  query: string
  tokenMap: Record<string, Token> | undefined
  customTokenMap: Record<string, Token> | undefined
  chainId?: number
}

export const useSortedTokenList = ({
  query,
  tokenMap,
  customTokenMap,
}: Params) => {
  const debouncedQuery = useDebounce(query, 250)
  return useQuery({
    queryKey: ['sortedTokenList', { debouncedQuery, tokenMap, customTokenMap }],
    queryFn: async () => {
      const tokenMapValues = tokenMap ? Object.values(tokenMap) : []
      const customTokenMapValues = customTokenMap
        ? Object.values(customTokenMap)
        : []
      const filteredTokens: Token[] = filterTokens(
        tokenMapValues,
        debouncedQuery,
      )
      const filteredCustomTokens: Token[] = filterTokens(
        customTokenMapValues,
        debouncedQuery,
      )
      // const sortedTokens
      const sortedTokens: Token[] = [
        ...filteredTokens,
        ...filteredCustomTokens,
      ].sort(tokenComparator())
      const filteredSortedTokens = getSortedTokensByQuery(
        sortedTokens,
        debouncedQuery,
      )
      return filteredSortedTokens
    },
  })
}
