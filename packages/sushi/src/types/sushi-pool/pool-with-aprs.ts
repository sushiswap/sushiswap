import type { PoolId } from './pool-id.js'

export type PoolWithAprs<T extends PoolId = PoolId> = T &
  PoolWithIncentiveApr<T> &
  PoolWithFeeAprs<T> &
  PoolWithTotalAprs<T>

export type PoolWithIncentiveApr<T extends PoolId = PoolId> = T & {
  incentiveApr: number
}

export type PoolWithFeeAprs<T extends PoolId = PoolId> = T & {
  // feeApr1h: number
  feeApr1d: number
  // feeApr1w: number
  // feeApr1m: number
}

export type PoolWithTotalAprs<T extends PoolId = PoolId> = T & {
  // totalApr1h: number
  totalApr1d: number
  // totalApr1w: number
  // totalApr1m: number
}
