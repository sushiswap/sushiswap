import { useSteerVaults } from '@sushiswap/client/hooks'
import { useAllPrices } from '@sushiswap/react-query'
import { Amount, Token } from 'sushi/currency'
import { Address } from 'viem'

import { STEER_ENABLED_NETWORKS } from '@sushiswap/graph-config'
import { useMemo } from 'react'
import { useSteerAccountPositions } from './useSteerAccountPosition'

interface UseSteerAccountPositionsExtended {
  account: Address | undefined
  enabled?: boolean
  chainIds?: number[]
}

export const useSteerAccountPositionsExtended = ({
  account,
  enabled = true,
  chainIds = [...STEER_ENABLED_NETWORKS],
}: UseSteerAccountPositionsExtended) => {
  const { data: prices, isInitialLoading: isPricesLoading } = useAllPrices()

  const { data: vaults, isLoading: isVaultsLoading } = useSteerVaults({
    args: { chainIds },
    shouldFetch: Boolean(enabled && account),
  })

  const vaultIds = useMemo(() => vaults?.map((el) => el.id), [vaults])

  const { data: positions, isLoading } = useSteerAccountPositions({
    account,
    vaultIds,
    enabled,
  })

  const data = useMemo(() => {
    if (!vaults || !positions) return undefined

    return positions.flatMap((position) => {
      if (position.steerTokenBalance <= 0n) return []

      const vault = vaults.find((vault) => vault.id === position.id)

      if (!vault) return []

      const token0 = new Token({ chainId: vault.chainId, ...vault.token0 })
      const token1 = new Token({ chainId: vault.chainId, ...vault.token1 })

      const token0Price = prices?.[String(vault.chainId)]?.[token0.address] || 0
      const token1Price = prices?.[String(vault.chainId)]?.[token1.address] || 0

      const token0Amount = Amount.fromRawAmount(token0, position.token0Balance)
      const token1Amount = Amount.fromRawAmount(token1, position.token1Balance)

      const token0AmountUSD = Number(
        token0Amount?.multiply(token0Price).toSignificant(8),
      )
      const token1AmountUSD = Number(
        token1Amount?.multiply(token1Price).toSignificant(8),
      )

      return {
        ...position,
        vault,
        token0Amount,
        token1Amount,
        token0AmountUSD,
        token1AmountUSD,
        totalAmountUSD: token0AmountUSD + token1AmountUSD,
      }
    })
  }, [vaults, prices, positions])

  return {
    data,
    isLoading: isLoading || isVaultsLoading || isPricesLoading,
  }
}
