import type { PoolChainId } from 'src/subgraphs/data-api/types/PoolChainId'
import type { SmartPoolChainId } from 'src/subgraphs/data-api/types/SmartPoolChainId'
import type { TokenListChainId } from 'src/subgraphs/data-api/types/TokenListChainId'
import type { TrendingTokensChainId } from 'src/subgraphs/data-api/types/TrendingTokensChainId'
import type { ChainId } from 'sushi/chain'
import type {
  SushiSwapChainId,
  SushiSwapV2ChainId,
  SushiSwapV3ChainId,
} from 'sushi/config'

type JSONValue = string | number | boolean | null | JSONArray | JSONObject

export interface JSONObject {
  [key: string]: JSONValue
}

interface JSONArray extends Array<JSONValue> {}

export type Scalars = {
  BigInt: string
  BigDecimal: string
  Bytes: `0x${string}`
  DateTime: string
  JSON: JSONObject

  ChainId: ChainId

  SushiSwapChainId: SushiSwapChainId
  SushiSwapV2ChainId: SushiSwapV2ChainId
  SushiSwapV3ChainId: SushiSwapV3ChainId

  PoolChainId: PoolChainId
  SmartPoolChainId: SmartPoolChainId

  TokenListChainId: TokenListChainId
  TrendingTokensChainId: TrendingTokensChainId
}
