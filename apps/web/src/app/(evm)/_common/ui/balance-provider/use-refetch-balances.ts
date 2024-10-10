import { useMemo } from 'react'
import { useBalanceProvider } from './balance-provider'

export function useRefetchBalances() {
  const {
    mutate: { refetchChain },
  } = useBalanceProvider()

  return useMemo(() => ({ refetchChain }), [refetchChain])
}
