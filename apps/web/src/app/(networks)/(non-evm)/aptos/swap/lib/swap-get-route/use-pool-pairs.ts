import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { PoolReserve } from '~aptos/pool/lib/use-pools-reserves'
import {
  usePoolActions,
  usePoolState,
} from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'

type AptosPoolReserve = {
  type: string
  data: {
    block_timestamp_last: string
    reserve_x: string
    reserve_y: string
  }
}

export async function usePoolPairs() {
  const {
    api: { fetchUrlPrefix },
    contracts: { swap: swapContract },
  } = useNetwork()
  const { token0, token1, isTransactionPending } = usePoolState()

  const { setPoolReserves, setLoadingPrice, setPoolPairRatio } =
    usePoolActions()

  const { data, isLoading } = useQuery<{
    poolReserves: PoolReserve | null
    poolPairRatio: number
  }>({
    queryKey: ['poolPairs', swapContract, token0, token1, isTransactionPending],
    queryFn: async () => {
      const url = `${fetchUrlPrefix}/v1/accounts/${swapContract}/resources`

      const response = await fetch(url)

      if (response.status === 200) {
        let inverse = false

        const data: AptosPoolReserve[] = await response.json()
        const reserves = data.filter((d) => {
          if (
            d.type ===
            `${swapContract}::swap::TokenPairReserve<${token0.address}, ${token1.address}>`
          ) {
            inverse = false
            return true
          } else if (
            d.type ===
            `${swapContract}::swap::TokenPairReserve<${token1.address}, ${token0.address}>`
          ) {
            inverse = true
            return true
          }
        })

        if (reserves?.length) {
          let poolPairRatio: number

          if (inverse) {
            poolPairRatio =
              Number(reserves[0]?.data?.reserve_x) /
              Number(reserves[0]?.data?.reserve_y)
          } else {
            poolPairRatio =
              Number(reserves[0]?.data?.reserve_y) /
              Number(reserves[0]?.data?.reserve_x)
          }

          return {
            poolReserves: {
              reserve0: reserves[0].data.reserve_x,
              reserve1: reserves[0].data.reserve_y,
              timestamp: reserves[0].data.block_timestamp_last,
            },
            poolPairRatio,
          }
        }
      }

      return {
        poolReserves: null,
        poolPairRatio: 0,
      }
    },
    refetchInterval: 8000,
  })

  useEffect(() => {
    if (data) {
      setPoolReserves(data?.poolReserves)
      setPoolPairRatio(data?.poolPairRatio)
    }
  }, [data, setPoolReserves, setPoolPairRatio])

  useEffect(() => {
    setLoadingPrice(isLoading)
  }, [isLoading, setLoadingPrice])
}
