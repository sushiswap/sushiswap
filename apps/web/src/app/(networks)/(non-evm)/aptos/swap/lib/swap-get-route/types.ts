import { PoolReserve } from '~aptos/pool/lib/use-pools-reserves'

export type PoolInfo = {
  type: string
  data: {
    decimals: number
    name: string
    symbol: string
    supply: {
      vec: {
        aggregator: { vec: any[] }
        integer: { vec: { limit: string; value: string }[] }
      }[]
    }[]
  }
}

export type Route = {
  route: string[]
  amountOut: number
  priceImpact: number
}

export interface Vertex extends PoolReserve {
  pair: string
  res_x: number
  res_y: number
  lpTokenInfo: PoolInfo
}
