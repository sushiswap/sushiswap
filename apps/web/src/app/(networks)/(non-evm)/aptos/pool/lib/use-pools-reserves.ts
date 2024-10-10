import { useQuery } from '@tanstack/react-query'
import fromPairs from 'lodash.frompairs'
import { NetworkConfig } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'

interface UsePoolsReserves {
  poolAddresses: string[] | undefined
  ledgerVersion?: number
}

interface GetPairReserves extends UsePoolsReserves {
  poolAddresses: string[]
  network: NetworkConfig
}

export type PoolReserve = Awaited<ReturnType<typeof getPoolReserves>>[number]

export async function getPoolReserves({
  poolAddresses,
  ledgerVersion,
  network,
}: GetPairReserves) {
  const {
    api: { fetchUrlPrefix },
    contracts: { swap: swapContract },
  } = network

  const get = async (pairAddress: string | undefined) => {
    if (!pairAddress) throw new Error('No pair address')

    let url = `${fetchUrlPrefix}/v1/accounts/${swapContract}/resource/${pairAddress}`
    if (ledgerVersion) {
      url += `?ledger_version=${ledgerVersion}`
    }

    const response = await fetch(url)
    if (response.status === 200) {
      const data = response.json()
      return data
    }

    throw new Error('Failed to fetch pair reserves')
  }

  const pairReservesQueries = await Promise.allSettled(poolAddresses.map(get))

  const pairReserves = pairReservesQueries.flatMap((p) => {
    if (p.status === 'fulfilled') {
      return p.value as {
        type: string
        data: {
          reserve_x: string
          reserve_y: string
          block_timestamp_last: string
        }
      }
    }
    return []
  })

  return fromPairs(
    pairReserves.map((p) => [
      p.type,
      {
        reserve0: p.data.reserve_x,
        reserve1: p.data.reserve_y,
        timestamp: p.data.block_timestamp_last,
      },
    ]),
  )
}

export function usePoolsReserves({
  poolAddresses,
  ledgerVersion,
}: UsePoolsReserves) {
  const network = useNetwork()

  return useQuery({
    queryKey: ['poolsReserves', { poolAddresses, ledgerVersion, network }],
    queryFn: async () => {
      if (!poolAddresses) throw new Error('No pool addresses')

      return getPoolReserves({ poolAddresses, ledgerVersion, network })
    },
    enabled: Boolean(poolAddresses),
  })
}
