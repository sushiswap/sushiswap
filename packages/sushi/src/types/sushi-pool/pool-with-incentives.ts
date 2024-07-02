import type { ChainId } from 'sushi/chain'
import type { Address } from '../address.js'
import type { Token } from '../token.js'
import type { PoolId } from './pool-id.js'
import type { PoolIfIncentivized } from './pool-if-incentivized.js'
import type { PoolWithIncentiveApr } from './pool-with-aprs.js'

export enum RewarderType {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export enum ChefType {
  MasterChefV1 = 'MasterChefV1',
  MasterChefV2 = 'MasterChefV2',
  MiniChef = 'MiniChef',
  Merkl = 'Merkl',
}

export type Incentive = {
  id: string
  chainId: ChainId
  apr: number
  rewarderAddress: Address
  rewardPerDay: number
  rewardToken: Token
  pid: number
  rewarderType: RewarderType
  chefType: ChefType
}

export type PoolWithIncentives<T extends PoolId = PoolId> = T &
  PoolIfIncentivized<T> &
  PoolWithIncentiveApr<T> & {
    incentives: Incentive[]
  }
