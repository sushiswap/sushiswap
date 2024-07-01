import type { SushiPositionBase } from './sushi-position-base.js'

export type SushiPositionStaked<
  T extends SushiPositionBase = SushiPositionBase,
> = T & {
  stakedBalance: bigint
}
