import { SteerStrategy } from '@sushiswap/steer-sdk'
import type { Token } from 'sushi/types'
import type { SteerVaultId } from './steer-vault-id'

export type SteerVault<T extends SteerVaultId = SteerVaultId> = T & {
  feeTier: number
  performanceFee: number

  adjustmentFrequency: number
  lastAdjustmentTimestamp: number

  lowerTick: number
  upperTick: number

  apr: number
  apr1d: number
  apr1w: number
  // apr1m: number
  // apr1y: number

  reserve0: bigint
  reserve0USD: number
  fees0: bigint
  fees0USD: number

  reserve1: bigint
  reserve1USD: number
  fees1: bigint
  fees1USD: number

  reserveUSD: number
  feesUSD: number

  token0: Token
  token1: Token

  strategy: SteerStrategy
  payloadHash: string

  isEnabled: boolean
  wasEnabled: boolean
  isDeprecated: boolean
}
