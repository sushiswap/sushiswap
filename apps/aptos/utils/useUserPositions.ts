import { useQuery } from '@tanstack/react-query'
import { FETCH_URL_PREFIX } from 'lib/constants'
import { Pool, usePools } from './usePools'

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
const CONTRACT_ADDRESS = process.env['NEXT_PUBLIC_SWAP_CONTRACT']

const userPositionsQueryFn = async (address: string, allPools: Pool[] = []) => {
  if (address) {
    const response = await fetch(
      `${FETCH_URL_PREFIX}/v1/accounts/${address}/resources`,
    )
    if (response.status === 200) {
      const data = await response.json()
      const userLPTokens: CoinStore[] = data?.filter((coin: CoinStore) => {
        return coin?.type.includes(
          `0x1::coin::CoinStore<${CONTRACT_ADDRESS}::swap::LPToken`,
        )
      })
      if (allPools.length) {
        const userPositions = allPools.filter((pool: Pool) => {
          const poolAddress = pool.id
          return userLPTokens.some((userLPToken) => {
            const tokenAddress = userLPToken.type
              .replaceAll(
                `0x1::coin::CoinStore<${CONTRACT_ADDRESS}::swap::LPToken<`,
                '',
              )
              .slice(0, -2)
            return tokenAddress === poolAddress
          })
        })
        return userPositions
      } else {
        return [] as Pool[]
      }
    } else {
      return [] as Pool[]
    }
  }
  return [] as Pool[]
}

export function useUserPositions(address: string, enabled = true) {
  const { data: allPools } = usePools()
  return useQuery({
    queryKey: ['userPositions', { address, allPools }],
    queryFn: async () => userPositionsQueryFn(address, allPools as Pool[]),
    enabled: Boolean(enabled && address),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
