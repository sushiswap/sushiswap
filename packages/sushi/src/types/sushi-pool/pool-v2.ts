import type { SushiSwapV2ChainId } from '../../config/sushiswap-v2.js'
import type { PoolId } from './pool-id.js'
import { SushiSwapProtocol, type SushiSwapV2Protocol } from './protocol.js'

export type PoolV2<T extends PoolId = PoolId> = T &
  Omit<PoolId, 'chainId' | 'protocol'> & {
    chainId: SushiSwapV2ChainId
    protocol: SushiSwapV2Protocol
  }

export function isPoolV2<T extends PoolV2>(pool: PoolId): pool is T {
  return pool.protocol === SushiSwapProtocol.SUSHISWAP_V2
}
