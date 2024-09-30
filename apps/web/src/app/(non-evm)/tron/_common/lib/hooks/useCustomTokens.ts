import { useLocalStorage } from '@sushiswap/hooks'
import { useCallback, useMemo } from 'react'
import { IS_TESTNET } from '~tron/_common/constants/is-testnet'
import { isAddress } from '~tron/_common/lib/utils/helpers'
import { IToken } from '~tron/_common/types/token-type'

const localStorageKey = IS_TESTNET
  ? 'sushi.customTokens.shasta'
  : 'sushi.customTokens.tron'

export const useCustomTokens = () => {
  const [value, setValue] = useLocalStorage<Record<string, IToken>>(
    localStorageKey,
    {},
  )

  const hydrate = useCallback((data: Record<string, IToken>) => {
    return Object.entries(data).reduce<Record<string, IToken>>(
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
    (currencies: IToken[]) => {
      const data: IToken[] = currencies.map((currency) => ({
        address: currency.address,
        name: currency.name,
        symbol: currency.symbol,
        decimals: currency.decimals,
      }))

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
    (currency: IToken) => {
      setValue((prev) => {
        return Object.entries(prev).reduce<Record<string, IToken>>(
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
    (currency: IToken): boolean => {
      if (currency.address === 'TRON') return false
      if (!isAddress(currency.address)) {
        throw new Error('Invalid address')
      }

      return !!value[currency.address]
    },
    [value],
  )

  const addOrRemoveToken = useCallback(
    (type: 'add' | 'remove', currency: IToken[]) => {
      if (type === 'add') addCustomToken(currency)
      if (type === 'remove') removeCustomToken(currency[0])
    },
    [addCustomToken, removeCustomToken],
  )

  return useMemo(() => {
    return {
      customTokens: hydrate(value),
      addOrRemoveToken,
      hasToken,
    }
  }, [hydrate, addOrRemoveToken, hasToken, value])
}
