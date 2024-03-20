import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Token } from 'sushi/currency'
import { getAddress } from 'viem'

import type { UseTokenListQuerySelect } from './types'
import { tokenListValidator } from './validator'

export const useTokenListQuery = (select: UseTokenListQuerySelect) =>
  useQuery({
    queryKey: ['https://tokens.sushi.com/v2'],
    queryFn: async () => {
      const res = await (await fetch('https://tokens.sushi.com/v2')).json()
      return tokenListValidator.parse(res)
    },
    select,
    keepPreviousData: true,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
  })

export const useTokenList = (filter?: 'showNone' | string[]) => {
  const select: UseTokenListQuerySelect = useCallback(
    (data) => {
      if (filter === 'showNone') return {}

      const _filter = filter
        ? filter.filter((el) => el.length > 2).map((el) => el.toLowerCase())
        : undefined
      return data.reduce<Record<string, Token>>(
        (acc, { chainId, name, symbol, address, decimals }) => {
          if (
            filter === undefined ||
            (_filter &&
              (_filter.findIndex((el) => name.toLowerCase().includes(el)) >=
                0 ||
                _filter.findIndex((el) => address.toLowerCase().includes(el)) >=
                  0 ||
                _filter.findIndex((el) => symbol.toLowerCase().includes(el)) >=
                  0))
          ) {
            acc[`${chainId}:${getAddress(address)}`] = new Token({
              chainId,
              name,
              symbol,
              decimals,
              address,
            })
          }

          return acc
        },
        {},
      )
    },
    [filter],
  )

  return useTokenListQuery(select)
}
