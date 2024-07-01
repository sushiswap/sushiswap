import type { PoolId } from './pool-id.js'

export type PoolSwapFee<T extends PoolId = PoolId> = T & {
  swapFee: number
}
