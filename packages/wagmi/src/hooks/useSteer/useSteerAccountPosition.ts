import { useReadContracts } from 'wagmi'

import {
  getAccountPositions,
  getBalanceOfsContracts,
  getBalanceOfsSelect,
  getTotalSuppliesContracts,
  getTotalSuppliesSelect,
  getVaultsReservesContracts,
  getVaultsReservesSelect,
} from '@sushiswap/steer-sdk'
import { Address } from 'viem'

import { useMemo } from 'react'
import { useWatchByInterval } from '../watch'

interface UseSteerAccountPositions {
  account: Address | undefined
  vaultIds: string[] | undefined
  enabled?: boolean
}

export const useSteerAccountPositions = ({
  vaultIds,
  account,
  enabled = true,
}: UseSteerAccountPositions) => {
  const {
    data: accountBalances,
    isInitialLoading: isAccountBalancesLoading,
    queryKey: accountBalancesQueryKey,
  } = useReadContracts({
    contracts:
      account && vaultIds
        ? getBalanceOfsContracts({ account, vaultIds })
        : undefined,
    query: {
      enabled: Boolean(enabled && account && vaultIds),
      select: (results) => {
        return results.flatMap((res, i) => {
          if (typeof res.result === 'undefined') return []
          return getBalanceOfsSelect(vaultIds![i], res.result)
        })
      },
    },
  })

  const {
    data: totalSupplies,
    isInitialLoading: isTotalSuppliesLoading,
    queryKey: totalSuppliesQueryKey,
  } = useReadContracts({
    contracts: vaultIds ? getTotalSuppliesContracts({ vaultIds }) : undefined,
    query: {
      enabled: Boolean(enabled && vaultIds),
      select: (results) => {
        return results.flatMap((res, i) => {
          if (typeof res.result === 'undefined') return []
          return getTotalSuppliesSelect(vaultIds![i], res.result)
        })
      },
    },
  })

  const {
    data: vaultReserves,
    isInitialLoading: isVaultReservesInitialLoading,
    queryKey: vaultReservesQueryKey,
  } = useReadContracts({
    contracts: vaultIds ? getVaultsReservesContracts({ vaultIds }) : undefined,
    query: {
      enabled: Boolean(enabled && vaultIds),
      select: (results) => {
        return results.flatMap((res, i) => {
          if (typeof res.result === 'undefined') return []
          return getVaultsReservesSelect(vaultIds![i], res.result)
        })
      },
    },
  })

  useWatchByInterval({
    keys: useMemo(
      () => [
        accountBalancesQueryKey,
        totalSuppliesQueryKey,
        vaultReservesQueryKey,
      ],
      [accountBalancesQueryKey, totalSuppliesQueryKey, vaultReservesQueryKey],
    ),
    interval: 10_000,
  })

  const data = useMemo(() => {
    if (!accountBalances || !totalSupplies || !vaultReserves) return undefined

    const positions = getAccountPositions({
      accountBalances,
      totalSupplies,
      vaultReserves,
    })

    return positions
  }, [accountBalances, totalSupplies, vaultReserves])

  return {
    data,
    isLoading:
      isAccountBalancesLoading ||
      isTotalSuppliesLoading ||
      isVaultReservesInitialLoading,
  }
}

interface UseSteerAccountPosition {
  account: Address | undefined
  vaultId: string | undefined
  enabled?: boolean
}

export const useSteerAccountPosition = ({
  vaultId,
  account,
  enabled = true,
}: UseSteerAccountPosition) => {
  const query = useSteerAccountPositions({
    vaultIds: vaultId ? [vaultId] : undefined,
    account,
    enabled,
  })

  return useMemo(() => {
    return {
      ...query,
      data: query.data?.[0],
    }
  }, [query])
}
