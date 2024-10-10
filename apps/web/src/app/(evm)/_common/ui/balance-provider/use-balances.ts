import { useEffect, useMemo } from 'react'
import { ChainId, ID, LowercaseMap } from 'sushi'
import { nativeAddress } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import { Address } from 'viem'
import { useBalanceProvider } from './balance-provider'
import { isBalanceStaleWhileRevalidate } from './utils'

export function useBalances(
  chainId: ChainId | undefined,
  tokenAddresses: Address[] | undefined,
) {
  const { state, mutate } = useBalanceProvider()

  useEffect(() => {
    if (!chainId || !tokenAddresses) {
      return
    }

    const tokenIds = tokenAddresses.map((address) => ({ address, chainId }))

    mutate.incrementToken(tokenIds)

    return () => {
      mutate.decrementToken(tokenIds)
    }
  }, [chainId, tokenAddresses, mutate.incrementToken, mutate.decrementToken])

  return useMemo(() => {
    if (!chainId || !tokenAddresses) {
      return {
        data: undefined,
        isError: false,
        isLoading: true,
        isFetching: false,
      }
    }

    const chain = state.chains.get(chainId)

    if (!chain) {
      return {
        data: undefined,
        isError: false,
        isLoading: true,
        isFetching: false,
      }
    }

    const balanceMap = new Map<Address, bigint>()

    tokenAddresses.forEach((address) => {
      const balance = chain.balanceMap.get(address)

      if (!balance) {
        return
      }

      if (isBalanceStaleWhileRevalidate(balance)) {
        return
      }

      balanceMap.set(address, balance.amount)
    })

    // If we don't have all the requested balances, return undefined
    if (balanceMap.size !== tokenAddresses.length) {
      return {
        data: undefined,
        isError: false,
        isLoading: chain.isFetching,
        isFetching: chain.isFetching,
      }
    }

    let isError = false
    for (const address of tokenAddresses) {
      if (balanceMap.get(address)! < 0n) {
        balanceMap.delete(address)
        isError = true
      }
    }

    return {
      data: balanceMap as ReadonlyMap<Address, bigint>,
      isError,
      isLoading: false,
      isFetching: chain.isFetching,
    }
  }, [chainId, tokenAddresses, state])
}

export function useAmountBalances(
  chainId: ChainId | undefined,
  _currencies: (Type | undefined)[] | undefined,
) {
  const currencies = useMemo(() => {
    if (!_currencies) {
      return undefined
    }

    return _currencies.filter((currency) => currency !== undefined) as Type[]
  }, [_currencies])

  const tokenAddresses = useMemo(() => {
    if (!currencies) {
      return undefined
    }

    return currencies.map((currency) => {
      if (currency.chainId !== chainId) {
        throw new Error(
          'useAmountBalances: All currencies must be on the same chain',
        )
      }

      if (currency.isNative) {
        return nativeAddress
      }

      return currency.address
    })
  }, [chainId, currencies])

  const result = useBalances(chainId, tokenAddresses)

  return useMemo(() => {
    if (!currencies || result.data === undefined) {
      return {
        ...result,
        data: undefined,
      }
    }

    const amountMap = new LowercaseMap<ID, Amount<Type>>()

    currencies.forEach((currency) => {
      const address = currency.isNative ? nativeAddress : currency.address
      const amount = result.data.get(address)

      if (amount === undefined) {
        return
      }

      amountMap.set(currency.id, Amount.fromRawAmount(currency, amount))
    })

    return {
      ...result,
      data: amountMap as ReadonlyMap<ID, Amount<Type>>,
    }
  }, [currencies, result])
}
