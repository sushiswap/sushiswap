import {
  isBentoBoxChainId,
  isSushiSwapV2ChainId,
  isSushiSwapV3ChainId,
  isTridentChainId,
} from 'sushi/config'
import { Type } from 'sushi/currency'
import { TradeType } from 'sushi/dex'
import {
  SushiSwapV2Pool,
  TridentConstantPool,
  TridentStablePool,
} from 'sushi/pool'
import { getCurrencyCombinations } from 'sushi/router'
import { BridgeBento, UniV3Pool } from 'sushi/tines'
import { getBentoboxTotalsMap } from '../../bentobox'
import { UsePoolsParams, UsePoolsReturn } from '../types'
import { BridgeBentoState, getBridgeBentoPools } from './getBridgeBentoPools'
import { PairState, getSushiSwapV2Pools } from './getSushiSwapV2Pools'
import {
  TridentConstantPoolState,
  getTridentConstantPools,
} from './getTridentConstantPools'
import {
  TridentStablePoolState,
  getTridentStablePools,
} from './getTridentStablePools'
import { V3PoolState, getV3Pools } from './getV3Pools'
import { pairsUnique, tokensUnique } from './utils'

const queryFn = async ({
  chainId,
  currencyA,
  currencyB,
  tradeType = TradeType.EXACT_INPUT,
  withBentoPools = false,
  withCombinations = true,
  config,
}: UsePoolsParams) => {
  const [currencyIn, currencyOut] =
    tradeType === TradeType.EXACT_INPUT
      ? [currencyA, currencyB]
      : [currencyB, currencyA]

  let currencyCombinations: [Type | undefined, Type | undefined][] = [
    [currencyIn, currencyOut],
  ]
  if (withCombinations && currencyIn && currencyOut && chainId) {
    currencyCombinations = getCurrencyCombinations(
      chainId,
      currencyIn,
      currencyOut,
    )
  }

  // let v3CurrencyCombinations: [Type | undefined, Type | undefined][] = [[currencyIn, currencyOut]]
  // if (withCombinations && currencyIn && currencyOut && chainId) {
  //   v3CurrencyCombinations = getV3CurrencyCombinations(chainId, currencyIn, currencyOut)
  // }

  const _tokensUnique = tokensUnique(pairsUnique(currencyCombinations))
  const totalsMap = isBentoBoxChainId(chainId)
    ? await getBentoboxTotalsMap(chainId, _tokensUnique, config)
    : null

  const [pairs, constantProductPools, stablePools, bridgeBentoPools, v3Pools] =
    await Promise.all([
      isSushiSwapV2ChainId(chainId)
        ? getSushiSwapV2Pools(chainId, currencyCombinations, config)
        : Promise.resolve([]),
      isTridentChainId(chainId) && isBentoBoxChainId(chainId)
        ? getTridentConstantPools(chainId, currencyCombinations, config)
        : Promise.resolve([]),
      isTridentChainId(chainId) && isBentoBoxChainId(chainId) && totalsMap
        ? getTridentStablePools(
            chainId,
            currencyCombinations,
            totalsMap,
            config,
          )
        : Promise.resolve([]),
      isBentoBoxChainId(chainId) && withBentoPools && totalsMap
        ? getBridgeBentoPools(chainId, _tokensUnique, totalsMap, config)
        : Promise.resolve([]),
      isSushiSwapV3ChainId(chainId)
        ? getV3Pools(chainId, currencyCombinations, config)
        : Promise.resolve([]),
    ])
  // const filteredCurrencyCombinations = currencyCombinations.filter(([a, b]) =>  a === currencyA || b === currencyA || a === currencyB || b === currencyB)
  // const v3Pools = await getV3Pools(chainId, v3CurrencyCombinations)

  return {
    pairs,
    constantProductPools,
    stablePools,
    bridgeBentoPools,
    v3Pools,
  }
}

export const getAllPools = async (
  variables: Omit<UsePoolsParams, 'enabled'> & { asMap?: boolean },
): Promise<UsePoolsReturn> => {
  if (!variables.currencyA || !variables.currencyB) {
    return {
      sushiSwapV2Pools: [],
      tridentConstantPools: [],
      tridentStablePools: [],
      bridgeBentoPools: [],
      sushiSwapV3Pools: [],
    }
  }
  const data = await queryFn(variables)
  return {
    sushiSwapV2Pools: Object.values(
      data.pairs
        .filter((result): result is [PairState.EXISTS, SushiSwapV2Pool] =>
          Boolean(result[0] === PairState.EXISTS && result[1]),
        )
        .map(([, pair]) => pair as SushiSwapV2Pool),
    ),
    tridentConstantPools: Object.values(
      data.constantProductPools
        .filter(
          (
            result,
          ): result is [TridentConstantPoolState.EXISTS, TridentConstantPool] =>
            Boolean(result[0] === TridentConstantPoolState.EXISTS && result[1]),
        )
        .map(([, pair]) => pair as TridentConstantPool),
    ),
    tridentStablePools: Object.values(
      data.stablePools
        .filter(
          (
            result,
          ): result is [TridentStablePoolState.EXISTS, TridentStablePool] =>
            Boolean(result[0] === TridentStablePoolState.EXISTS && result[1]),
        )
        .map(([, pair]) => pair as TridentStablePool),
    ),
    bridgeBentoPools: Object.values(
      data.bridgeBentoPools
        .filter((result): result is [BridgeBentoState.EXISTS, BridgeBento] =>
          Boolean(result[0] === BridgeBentoState.EXISTS && result[1]),
        )
        .map(([, pair]) => pair as BridgeBento),
    ),
    sushiSwapV3Pools: Object.values(
      data.v3Pools
        .filter((result): result is [V3PoolState.EXISTS, UniV3Pool] =>
          Boolean(result[0] === V3PoolState.EXISTS && result[1]),
        )
        .map(([, pair]) => pair as UniV3Pool),
    ),
  }
}
