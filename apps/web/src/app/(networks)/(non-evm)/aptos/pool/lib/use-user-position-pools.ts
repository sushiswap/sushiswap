import { useQuery } from '@tanstack/react-query'
import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { PoolExtended, usePoolsExtended } from './use-pools-extended'

export type CoinStore = {
  type: string
  data: {
    coin: {
      value: number
    }
    deposit_events: {
      counter: string
      guid: {
        id: {
          addr: string
          creation_num: string
        }
      }
    }
    frozen: boolean
    withdraw_events: {
      counter: string
      guid: {
        id: {
          addr: string
          creation_num: string
        }
      }
    }
  }
}

interface UserPositionPoolsQueryFn {
  address: string
  allPools: PoolExtended[]
  network: SupportedNetwork
}

const userPositionPoolsQueryFn = async ({
  address,
  allPools = [],
  network,
}: UserPositionPoolsQueryFn) => {
  const response = await fetch(
    `${chains[network].api.fetchUrlPrefix}/v1/accounts/${address}/resources`,
  )

  if (response.status === 200) {
    const data = await response.json()
    const userLPTokens: CoinStore[] = data?.filter((coin: CoinStore) => {
      return coin?.type.includes(
        `0x1::coin::CoinStore<${chains[network].contracts.swap}::swap::LPToken`,
      )
    })

    if (allPools.length) {
      const userPositions = allPools.filter((pool) => {
        const poolAddress = pool.id
        return userLPTokens.some((userLPToken) => {
          const tokenAddress = userLPToken.type
            .replaceAll(
              `0x1::coin::CoinStore<${chains[network].contracts.swap}::swap::LPToken<`,
              '',
            )
            .slice(0, -2)

          return tokenAddress === poolAddress
        })
      })

      return userPositions
    } else {
      return [] as PoolExtended[]
    }
  }

  return [] as PoolExtended[]
}

export function useUserPositionPools(address: string, enabled = true) {
  const { data: allPools } = usePoolsExtended()
  const { network } = useNetwork()

  return useQuery({
    queryKey: ['userPositions', { address, allPools, network }],
    queryFn: async () => {
      if (!allPools) throw new Error('No pools found')

      return userPositionPoolsQueryFn({ address, allPools, network })
    },
    enabled: Boolean(enabled && address && allPools),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
