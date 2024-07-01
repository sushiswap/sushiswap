import type { PoolId } from './pool-id.js'

export type PoolBucket = {
  id: string
  date: number
  liquidityUSD: number
  volumeUSD: number
  feesUSD: number
  txCount: number
}

export type PoolWithBuckets<T extends PoolId> = T & {
  poolHourData: PoolBucket[]
  poolDayData: PoolBucket[]
}
