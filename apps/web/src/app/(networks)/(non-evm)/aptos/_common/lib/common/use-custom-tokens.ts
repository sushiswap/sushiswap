import { useLocalStorage } from '@sushiswap/hooks'
import { useCallback, useMemo } from 'react'
import { Token } from '~aptos/_common/lib/types/token'

export function useCustomTokens() {
  const [value, setValue] = useLocalStorage<Record<string, Token>>(
    'sushi.customTokens.aptos',
    {},
  )

  const hydrate = useCallback((data: Record<string, Token>) => {
    return Object.entries(data).reduce<Record<string, Token>>(
      (acc, [k, { address, decimals, name, symbol }]) => {
        acc[k] = {
          address,
          decimals,
          name: String(name),
          symbol: String(symbol),
        }
        return acc
      },
      {},
    )
  }, [])

  const addCustomToken = useCallback(
    (currencies: Token[]) => {
      const data: Token[] = currencies.map((currency) => ({
        // id: 'currency.id',
        address: currency.address,
        name: currency.name,
        symbol: currency.symbol,
        decimals: currency.decimals,
      }))

      // customTokenMutate('add', [currency])
      setValue((prev) => {
        return data.reduce(
          (acc, cur) => {
            acc[`${cur.address}`] = cur
            return acc
          },
          { ...prev },
        )
      })
    },
    [setValue],
  )

  const removeCustomToken = useCallback(
    (currency: Token) => {
      setValue((prev) => {
        return Object.entries(prev).reduce<Record<string, Token>>(
          (acc, cur) => {
            if (cur[0] === `${currency.address}`) {
              return acc // filter
            }
            acc[cur[0]] = cur[1] // add
            return acc
          },
          {},
        )
      })
    },
    [setValue],
  )

  const hasToken = useCallback(
    (currency: Token | string) => {
      if (typeof currency === 'string') {
        return !!value[`${currency}`]
      }
      return !!value[`${currency.address}`]
    },
    [value],
  )

  const mutate = useCallback(
    (type: 'add' | 'remove', currency: Token[]) => {
      if (type === 'add') addCustomToken(currency)
      if (type === 'remove') removeCustomToken(currency[0])
    },
    [addCustomToken, removeCustomToken],
  )

  return useMemo(() => {
    return {
      data: hydrate(value),
      mutate,
      hasToken,
    }
  }, [hydrate, mutate, hasToken, value])
}
