import { SupportedNetwork, chains } from '~aptos/_common/config/chains'
import { Token } from '~aptos/_common/lib/types/token'
import { Pool } from '~aptos/pool/lib/convert-pool-to-sushi-pool'
import { PoolReserve } from '~aptos/pool/lib/use-pools-reserves'
import { baseTokens } from '../swap-base-tokens'
import { getBestRouteWithWorker } from './get-best-route'
import { PoolInfo, Vertex } from './types'

interface GetSwapRoute {
  amountIn?: number
  tokenIn: Token
  tokenOut: Token
  pools: Pool[]
  network: SupportedNetwork
}

export async function getSwapRoute({
  amountIn = 0,
  tokenIn,
  tokenOut,
  pools,
  network,
}: GetSwapRoute) {
  const {
    api: { fetchUrlPrefix },
    contracts: { swap: swapContract },
  } = chains[network]

  const tokens = pools.reduce<Set<string>>(
    (acc, pool) => {
      acc.add(pool.token0.address)
      acc.add(pool.token1.address)
      return acc
    },
    new Set([...baseTokens, tokenIn.address, tokenOut.address]),
  )
  const tokenArray = [...tokens]

  const allTokenPairs: [string, string][] = []

  for (let i = 0; i < tokenArray.length; i++) {
    for (let j = i + 1; j < tokenArray.length; j++) {
      allTokenPairs.push([tokenArray[i], tokenArray[j]])
    }
  }

  const data: { data: any; type: string }[] | { error_code: any } = await fetch(
    `${fetchUrlPrefix}/v1/accounts/${swapContract}/resources`,
  ).then((res) => res.json())

  if ('error_code' in data) {
    throw new Error(`Failed to fetch swap resources: ${data?.error_code}`)
  }

  const poolReserves = new Map<string, PoolReserve>()
  const poolInfos = new Map<string, PoolInfo>()

  data.forEach((d) => {
    if (d.type.includes('TokenPairReserve')) {
      const reserve: PoolReserve = {
        reserve0: d.data.reserve_x,
        reserve1: d.data.reserve_y,
        timestamp: d.data.block_timestamp_last,
      }

      poolReserves.set(d.type, reserve)
    }
    if (d.type.includes('LPToken')) {
      poolInfos.set(d.type, d)
    }
  })

  const vertices = new Map<string, Vertex>()
  allTokenPairs.forEach(([token0, token1]) => {
    if (
      poolReserves.has(
        `${swapContract}::swap::TokenPairReserve<${token0}, ${token1}>`,
      )
    ) {
      const info = poolInfos.get(
        `0x1::coin::CoinInfo<${swapContract}::swap::LPToken<${token0}, ${token1}>>`,
      )!
      const data = poolReserves.get(
        `${swapContract}::swap::TokenPairReserve<${token0}, ${token1}>`,
      )!

      vertices.set(`${token0}|||${token1}`, {
        pair: `${token0}|||${token1}`,
        res_x: Number(data.reserve0),
        res_y: Number(data.reserve1),
        lpTokenInfo: info,
        ...data,
      })

      return
    }

    if (
      poolReserves.has(
        `${swapContract}::swap::TokenPairReserve<${token1}, ${token0}>`,
      )
    ) {
      const info = poolInfos.get(
        `0x1::coin::CoinInfo<${swapContract}::swap::LPToken<${token1}, ${token0}>>`,
      )!
      const data = poolReserves.get(
        `${swapContract}::swap::TokenPairReserve<${token1}, ${token0}>`,
      )!

      vertices.set(`${token1}|||${token0}`, {
        pair: `${token0}|||${token1}`,
        res_x: Number(data.reserve0),
        res_y: Number(data.reserve1),
        lpTokenInfo: info,
        ...data,
      })
    }
  })

  const graph = new Map<string, string[]>()
  vertices.forEach((vertex) => {
    const coins_data = vertex.pair.split('|||')

    if (graph.has(coins_data[0])) {
      graph.get(coins_data[0])!.push(coins_data[1])
    } else {
      graph.set(coins_data[0], [coins_data[1]])
    }

    if (graph.has(coins_data[1])) {
      graph.get(coins_data[1])!.push(coins_data[0])
    } else {
      graph.set(coins_data[1], [coins_data[0]])
    }

    return data
  }, {})

  const bestRoute = await getBestRouteWithWorker({
    amountIn,
    vertices,
    tokenGraph: graph,
    tokenIn,
    tokenOut,
  })

  return bestRoute
}
