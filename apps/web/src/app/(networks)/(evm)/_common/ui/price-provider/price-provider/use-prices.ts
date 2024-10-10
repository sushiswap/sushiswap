'use client'

import { useEffect, useMemo } from 'react'
import {
  type Address,
  type ChainId,
  Fraction,
  withoutScientificNotation,
} from 'sushi'
import { parseUnits } from 'viem'
import { usePriceProvider } from './price-provider'

export type PriceMap = {
  has: (address: Address) => boolean
  get: (address: Address) => number | undefined
  getFraction: (address: Address) => Fraction | undefined
}

export function usePrices({
  chainId,
  enabled = true,
}: { chainId: ChainId | undefined; enabled?: boolean }) {
  // Important to use state, not state.chains directly, as the reference to state.chains won't be changing and the component won't re-render
  // It's not best practice, but it's controlled here in the hook and not exposed
  const { state, mutate } = usePriceProvider()

  useEffect(() => {
    if (state.ready && chainId && enabled) {
      mutate.incrementChainId(chainId)
    }

    return () => {
      if (state.ready && chainId && enabled) {
        mutate.decrementChainId(chainId)
      }
    }
  }, [chainId, enabled, mutate, state.ready])

  const chain = useMemo(
    () => (chainId ? state.chains.get(chainId) : undefined),
    [state, chainId],
  )

  return useMemo(() => {
    if (!chainId) {
      return {
        data: undefined,
        lastModified: 0,
        isLoading: false,
        isUpdating: false,
        isError: false,
      }
    }

    if (!chain)
      return {
        data: undefined,
        lastModified: 0,
        isLoading: true,
        isUpdating: false,
        isError: false,
      }

    if (!chain.priceMap)
      return {
        data: undefined,
        lastModified: chain.lastModified,
        isLoading: chain.isLoading,
        isUpdating: chain.isUpdating,
        isError: chain.isError,
      }

    const data: PriceMap = {
      has: (_address: Address) => {
        const address = BigInt(_address)

        return chain.priceMap!.has(address)
      },
      get: (_address: Address) => {
        const address = BigInt(_address)

        const price = chain.priceMap!.get(address)
        return price
      },
      getFraction: (_address: Address) => {
        const address = BigInt(_address)

        const price = chain.priceMap!.get(address)
        if (price) {
          return new Fraction(
            parseUnits(
              withoutScientificNotation(String(price)) || '0',
              18,
            ).toString(),
            parseUnits('1', 18).toString(),
          )
        }
        return undefined
      },
    }

    return {
      data,
      lastModified: chain.lastModified,
      isLoading: chain.isLoading,
      isUpdating: chain.isUpdating,
      isError: chain.isError,
    }
  }, [chainId, chain])
}
