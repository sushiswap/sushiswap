import type { PoolId } from './pool-id.js'

export type MaybeNestedPool<T extends PoolId> =
  | T
  | {
      pool: T
    }

export function unnestPool<T extends PoolId>(
  maybeNestedPool: MaybeNestedPool<T>,
) {
  return 'pool' in maybeNestedPool ? maybeNestedPool.pool : maybeNestedPool
}
