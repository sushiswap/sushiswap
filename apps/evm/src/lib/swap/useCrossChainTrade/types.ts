import { UseTradeReturn } from '@sushiswap/react-query'
import { SushiXSwap2ChainId } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import { Percent } from 'sushi/math'
import { Address } from 'viem'
import { TransactionType } from './SushiXSwap2'

export interface UseCrossChainTradeParams {
  tradeId: string
  network0: SushiXSwap2ChainId
  network1: SushiXSwap2ChainId
  token0: Type | undefined
  token1: Type | undefined
  amount: Amount<Type> | undefined
  slippagePercentage: string
  recipient: Address | undefined
  enabled: boolean
}

export interface UseCrossChainTradeReturn {
  priceImpact: Percent | undefined
  amountIn: Amount<Type> | undefined
  amountOut: Amount<Type> | undefined
  minAmountOut: Amount<Type> | undefined
  gasSpent: string | undefined
  bridgeFee: string | undefined
  srcGasFee: string | undefined
  functionName: string
  writeArgs: (string | object)[] | undefined
  route: { status: string }
  value: bigint | undefined
  transactionType: TransactionType | undefined
  srcBridgeToken: Type | undefined
  dstBridgeToken: Type | undefined
  srcTrade: UseTradeReturn | undefined
  dstTrade: UseTradeReturn | undefined
}
