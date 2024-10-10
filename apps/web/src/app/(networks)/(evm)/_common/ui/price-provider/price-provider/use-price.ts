'use client'

import { useMemo } from 'react'
import type { ChainId } from 'sushi/chain'
import type { Address } from 'viem'
import { usePrices } from './use-prices'

export function usePrice({
  chainId,
  address,
  enabled: _enabled = true,
}: {
  chainId: ChainId | undefined
  address: Address | undefined
  enabled?: boolean
}) {
  const enabled = chainId && address && _enabled

  const { data, ...rest } = usePrices({
    chainId,
    enabled,
  })

  return useMemo(() => {
    const price = address ? data?.get(address) : undefined

    return {
      data: price,
      ...rest,
    }
  }, [address, data, rest])
}
