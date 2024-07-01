import type { PoolId } from '../sushi-pool/pool-id.js'
import { SushiPositionBase } from './sushi-position-base.js'

export type SushiPositionWithPool<
  Pool extends PoolId = PoolId,
  Position extends SushiPositionBase = SushiPositionBase,
> = Omit<Position, 'pool'> & {
  pool: Pool
}
