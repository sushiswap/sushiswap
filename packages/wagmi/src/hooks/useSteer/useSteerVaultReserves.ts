import {
  getVaultsReservesContracts,
  getVaultsReservesSelect,
} from '@sushiswap/steer-sdk'
import { useReadContracts, useSimulateContract } from 'wagmi'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { getChainIdAddressFromId } from 'sushi'
import { useWatchByBlock } from '../watch'

interface UseSteerVaultsReserves {
  vaultIds: string[] | undefined
  enabled?: boolean
}

export const useSteerVaultsReserves = ({
  vaultIds,
  enabled = true,
}: UseSteerVaultsReserves) => {
  const contracts = useMemo(() => {
    if (!vaultIds) return undefined
    return getVaultsReservesContracts({ vaultIds })
  }, [vaultIds])

  const queryClient = useQueryClient()
  const query = useReadContracts({
    contracts,
    query: {
      enabled: Boolean(enabled && vaultIds),
      select: (results) =>
        results.flatMap(({ result }, i) => {
          if (!result) return []

          return getVaultsReservesSelect(vaultIds![i], result)
        }),
    },
  })

  // Doesn't make sense to invalidate queries based on the block number, since
  // there might be a wide array of chains involved
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries(
        query.queryKey,
        {},
        { cancelRefetch: false },
      )
    }, 4_000)

    return () => clearInterval(interval)
  }, [queryClient, query.queryKey])

  return query
}

interface UseSteerVaultReserve {
  vaultId: string | undefined
  enabled?: boolean
}

export const useSteerVaultReserves = ({
  vaultId,
  enabled = true,
}: UseSteerVaultReserve) => {
  const { chainId } = useMemo(
    () => (vaultId ? getChainIdAddressFromId(vaultId) : { chainId: undefined }),
    [vaultId],
  )

  const contract = useMemo(() => {
    if (!vaultId) return undefined
    return getVaultsReservesContracts({ vaultIds: [vaultId] })[0]
  }, [vaultId])

  const query = useSimulateContract({
    ...contract,
    query: {
      enabled: Boolean(enabled && vaultId),
      select: ({ result }) => getVaultsReservesSelect(vaultId!, result),
    },
  })

  useWatchByBlock({ chainId, key: query.queryKey })

  return query
}
