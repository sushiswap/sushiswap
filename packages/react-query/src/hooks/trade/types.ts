import { routeProcessor2Abi } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import { Amount, Price, type Type } from 'sushi/currency'
import { Percent } from 'sushi/math'
import { RouterLiquiditySource } from 'sushi/router'
import type { Address, WriteContractParameters } from 'viem'
import z from 'zod'

import { legValidator, tradeValidator01 } from './validator01'

export interface UseTradeParams {
  chainId: ChainId
  fromToken: Type | undefined
  toToken: Type | undefined
  amount: Amount<Type> | undefined
  gasPrice?: bigint | null | undefined
  slippagePercentage: string
  recipient: Address | undefined
  source?: RouterLiquiditySource
  enabled: boolean
  carbonOffset: boolean
  onError?(e: Error): void
}

export type UseTradeReturnWriteArgs =
  | WriteContractParameters<
      typeof routeProcessor2Abi,
      'transferValueAndprocessRoute'
    >['args']
  | WriteContractParameters<typeof routeProcessor2Abi, 'processRoute'>['args']
  | undefined

export interface UseTradeReturn {
  swapPrice: Price<Type, Type> | undefined
  priceImpact: Percent | undefined
  amountIn: Amount<Type> | undefined
  amountOut: Amount<Type> | undefined
  minAmountOut: Amount<Type> | undefined
  gasSpent: string | undefined
  gasSpentUsd: string | undefined
  functionName: 'processRoute' | 'transferValueAndprocessRoute'
  writeArgs: UseTradeReturnWriteArgs
  route: TradeType['route']
  value?: bigint | undefined
}

export type UseTradeQuerySelect = (data: TradeType) => UseTradeReturn
export type TradeType = z.infer<typeof tradeValidator01>
export type TradeLegType = z.infer<typeof legValidator>
