import { Amount, Type } from 'sushi/currency'
import { Address, encodeAbiParameters, parseAbiParameters } from 'viem'

interface BridgeParams {
  refId: string
  adapter: string
  tokenIn: string
  amountIn: Parameters<typeof BigInt>[0]
  to: string
  adapterData: string
}

export enum SushiXSwap2Adapter {
  Stargate = 0,
  Squid = 1,
}

export enum TransactionType {
  Bridge = 0,
  SwapAndBridge = 1,
  BridgeAndSwap = 2,
  CrossChainSwap = 3,
}

export const getBridgeParams = ({
  refId = '0x0000',
  adapter,
  amountIn,
  to,
  adapterData,
}: {
  refId?: string
  adapter: string
  amountIn: Amount<Type>
  to: string
  adapterData: string
}): BridgeParams => {
  return {
    refId,
    adapter,
    tokenIn: amountIn.currency.isNative
      ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      : amountIn.currency.address,
    amountIn: amountIn.quotient.toString(),
    to,
    adapterData,
  }
}

export const encodePayloadData = ({
  target,
  gasLimit,
  targetData,
}: {
  target: Address
  gasLimit: bigint
  targetData: `0x${string}`
}) => {
  return encodeAbiParameters(parseAbiParameters('address, uint256, bytes'), [
    target,
    gasLimit,
    targetData,
  ])
}

type ProcessRouteInput = readonly [
  Address,
  bigint,
  Address,
  bigint,
  Address,
  `0x${string}`,
]

export function encodeSwapData([
  tokenIn,
  amountIn,
  tokenOut,
  amountOut,
  to,
  route,
]: ProcessRouteInput) {
  return encodeAbiParameters(
    parseAbiParameters(
      '(address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut, address to, bytes route)',
    ),
    [{ tokenIn, amountIn, tokenOut, amountOut, to, route }],
  )
}

export * from './adapters'
