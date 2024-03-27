import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { SushiSwapV2Pool, TridentConstantPool, TridentStablePool } from 'sushi'
import { ChainId } from 'sushi/chain'
import { Type } from 'sushi/currency'
import { TradeType } from 'sushi/dex'
import { BridgeBento, UniV3Pool } from 'sushi/tines'

export enum PoolType {
  SushiSwapV2Pool = 'SushiSwapV2',
  TridentConstantPool = 'TridentConstant',
  TridentStablePool = 'TridentStable',
}

export interface UsePoolsParams {
  chainId: ChainId
  currencyA: Type | undefined
  currencyB: Type | undefined
  tradeType?: TradeType
  enabled?: boolean
  withBentoPools?: boolean
  withCombinations?: boolean
  config: PublicWagmiConfig
}

export type UsePoolsReturn = {
  sushiSwapV2Pools: SushiSwapV2Pool[] | undefined
  tridentConstantPools: TridentConstantPool[] | undefined
  tridentStablePools: TridentStablePool[] | undefined
  bridgeBentoPools: BridgeBento[] | undefined
  sushiSwapV3Pools: UniV3Pool[] | undefined
}
