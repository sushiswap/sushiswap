import type { Token } from '../token.js'
import type { PoolId } from './pool-id.js'
import type { PoolSwapFee } from './pool-swap-fee.js'

export type PoolBase<T extends PoolId = PoolId> = PoolSwapFee<T> & {
  name: string

  token0: Token
  token1: Token

  // twapEnabled: boolean

  reserve0: bigint
  reserve1: bigint
  liquidity: bigint

  liquidityUSD: number

  volumeUSD: number

  feesUSD: number

  token0Price: number
  token1Price: number

  txCount: number
}
