import { PoolId } from './pool-id.js'

export type PoolHistory1D<T extends PoolId = PoolId> = T & {
  liquidityUSD1dChange: number

  volumeUSD1d: number
  volumeUSD1dChange: number

  feesUSD1d: number
  feesUSD1dChange: number

  txCount1d: number
  txCount1dChange: number
}

export type PoolHistory1W<T extends PoolId = PoolId> = T & {
  liquidityUSD1wChange: number

  volumeUSD1w: number
  volumeUSD1wChange: number

  feesUSD1w: number
  feesUSD1wChange: number

  txCount1w: number
  txCount1wChange: number
}

export type PoolHistory1M<T extends PoolId = PoolId> = T & {
  liquidityUSD1mChange: number

  volumeUSD1m: number
  volumeUSD1mChange: number

  feesUSD1m: number
  feesUSD1mChange: number

  txCount1m: number
  txCount1mChange: number
}

export type PoolHistory<T extends PoolId = PoolId> = PoolHistory1M<
  PoolHistory1W<PoolHistory1D<T>>
>
