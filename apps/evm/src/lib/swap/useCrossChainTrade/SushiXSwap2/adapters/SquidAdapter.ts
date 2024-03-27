import {
  ChainType,
  DexName,
  Hook,
  RouteRequest,
  SquidCallType,
} from '@0xsquid/squid-types'
import { UseTradeReturn } from '@sushiswap/react-query'
import { erc20Abi, routeProcessor4Abi, squidRouterAbi } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import {
  ROUTE_PROCESSOR_4_ADDRESS,
  SQUID_CHAIN_NAME,
  SQUID_ROUTER_ADDRESS,
  SquidAdapterChainId,
  SquidMulticallCall,
} from 'sushi/config'
import { Amount, Currency, Token, Type } from 'sushi/currency'
import {
  WriteContractParameters,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  zeroAddress,
} from 'viem'

export const isSquidRouteProcessorEnabled: Record<
  SquidAdapterChainId,
  boolean
> = {
  [ChainId.ETHEREUM]: true,
  [ChainId.BSC]: true,
  [ChainId.AVALANCHE]: false,
  [ChainId.POLYGON]: true,
  [ChainId.ARBITRUM]: true,
  [ChainId.OPTIMISM]: true,
  [ChainId.BASE]: true,
  [ChainId.FANTOM]: true,
  [ChainId.LINEA]: false,
  [ChainId.KAVA]: false,
  [ChainId.MOONBEAM]: false,
  [ChainId.CELO]: false,
  [ChainId.SCROLL]: true,
}

/*
SquidBridgeParams {
    address token; // token being bridged
    bytes squidRouterData; // abi-encoded squidRouter calldata
}
*/
export const encodeSquidBridgeParams = ({
  srcBridgeToken,
  callData,
}: {
  srcBridgeToken: Token
  callData: `0x${string}`
}) => {
  return encodeAbiParameters(parseAbiParameters('address, bytes'), [
    srcBridgeToken.address,
    callData,
  ])
}

/*
function bridgeCall(
    string calldata bridgedTokenSymbol,
    uint256 amount,
    string calldata destinationChain,
    string calldata destinationAddress,
    bytes calldata payload,
    address gasRefundRecipient,
    bool enableExpress
)
*/
export const encodeSquidRouterBridgeCallCallData = ({
  srcBridgeToken,
  amount,
  dstChain,
  dstPayload,
  gasRefundRecipient,
}: {
  srcBridgeToken: Token
  amount: Parameters<typeof BigInt>[0]
  dstChain: SquidAdapterChainId
  dstPayload: `0x${string}`
  gasRefundRecipient: `0x${string}`
}) => {
  if (!srcBridgeToken.symbol)
    throw new Error('symbol undefined in srcBridgeToken')

  return encodeFunctionData({
    abi: squidRouterAbi,
    functionName: 'bridgeCall',
    args: [
      srcBridgeToken.symbol, // bridgedTokenSymbol
      BigInt(amount), // amount
      SQUID_CHAIN_NAME[dstChain], // dstChain
      SQUID_ROUTER_ADDRESS[dstChain], // dstAddress
      dstPayload, // dstPayload
      gasRefundRecipient, // gasRefundRecipient
      false,
    ],
  })
}

export const decodeSquidRouterCallData = (data: `0x${string}`) => {
  return decodeFunctionData({ abi: squidRouterAbi, data })
}

/*
function callBridgeCall(
    address token,
    uint256 amount,
    ISquidMulticall.Call[] calldata calls,
    string calldata bridgedTokenSymbol,
    string calldata destinationChain,
    string calldata destinationAddress,
    bytes calldata payload,
    address gasRefundRecipient,
    bool enableExpress
)
*/
export const encodeSquidRouterCallBridgeCallCallData = ({
  tokenIn,
  srcBridgeToken,
  amount,
  srcCalls,
  dstChain,
  dstPayload,
  gasRefundRecipient,
}: {
  tokenIn: Type
  srcBridgeToken: Token
  amount: Parameters<typeof BigInt>[0]
  srcCalls: SquidMulticallCall[]
  dstChain: SquidAdapterChainId
  dstPayload: `0x${string}`
  gasRefundRecipient: `0x${string}`
}) => {
  if (!srcBridgeToken.symbol)
    throw new Error('symbol undefined in srcBridgeToken')
  return encodeFunctionData({
    abi: squidRouterAbi,
    functionName: 'bridgeCall',
    args: [
      tokenIn.isNative
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : tokenIn.symbol, // tokenIn
      BigInt(amount), // amount
      srcCalls,
      srcBridgeToken.symbol,
      SQUID_CHAIN_NAME[dstChain], // dstChain
      SQUID_ROUTER_ADDRESS[dstChain], // dstAddress
      dstPayload, // dstPayload
      gasRefundRecipient, // gasRefundRecipient
      false,
    ],
  })
}

export const getSquidRouteRequest = ({
  token0,
  token1,
  amount,
  fromAddress = zeroAddress,
  toAddress = zeroAddress,
  bridgePath,
  slippagePercentage,
  isSrcSwap,
  isDstSwap,
  srcTrade,
  dstTrade,
}: {
  token0: Currency | undefined
  token1: Currency | undefined
  amount: Amount<Currency> | undefined
  fromAddress: `0x${string}` | undefined
  toAddress: `0x${string}` | undefined
  bridgePath: { srcBridgeToken: Token; dstBridgeToken: Token } | undefined
  slippagePercentage: string
  isSrcSwap: boolean | undefined
  isDstSwap: boolean | undefined
  srcTrade: UseTradeReturn | undefined
  dstTrade: UseTradeReturn | undefined
}) => {
  if (!token0 || !token1 || !amount || !bridgePath) return undefined

  const useSrcTrade = Boolean(
    isSrcSwap &&
      isSquidRouteProcessorEnabled[token0.chainId as SquidAdapterChainId],
  )
  const useDstTrade = Boolean(
    isDstSwap &&
      isSquidRouteProcessorEnabled[token1.chainId as SquidAdapterChainId] &&
      (!isSrcSwap || srcTrade?.amountOut),
  )

  if ((useSrcTrade && !srcTrade?.writeArgs) || (useDstTrade && !dstTrade))
    return undefined

  const { srcBridgeToken, dstBridgeToken } = bridgePath

  const routeRequest: RouteRequest = {
    fromAddress,
    toAddress,
    fromChain: token0.chainId.toString(),
    toChain: token1.chainId.toString(),
    fromToken: useSrcTrade
      ? srcBridgeToken.address
      : token0.isNative
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : token0.address,
    toToken: useDstTrade
      ? dstBridgeToken.address
      : token1.isNative
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : token1.address,
    fromAmount: useSrcTrade
      ? (
          (srcTrade as UseTradeReturn).minAmountOut as Amount<Currency>
        ).quotient.toString()
      : amount.quotient.toString(),
    slippageConfig: {
      slippage: Number(slippagePercentage),
      autoMode: 1,
    },
    prefer: [DexName.SUSHISWAP_V3, DexName.SUSHISWAP],
    quoteOnly: !fromAddress || !toAddress,
  }

  // RouteProcessor dstHook
  if (useDstTrade && dstTrade?.writeArgs) {
    const rpAddress =
      ROUTE_PROCESSOR_4_ADDRESS[token1.chainId as SquidAdapterChainId]

    if (rpAddress === undefined) throw new Error('RP not found')

    // Grant approval of dstBridgeToken to RouteProcessor & call ProcessRoute()
    routeRequest.postHook = {
      chainType: ChainType.EVM,
      calls: [
        // Grant approval of dstBridgeToken to RouteProcessor
        {
          chainType: ChainType.EVM,
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          target: dstBridgeToken.address,
          callData: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [rpAddress, 0n],
          }),
          value: '0',
          payload: {
            tokenAddress: dstBridgeToken.address,
            inputPos: 1,
          },
          estimatedGas: '30000',
        },
        // Invoke RouteProcessor.processRoute()
        {
          chainType: ChainType.EVM,
          callType: SquidCallType.FULL_TOKEN_BALANCE,
          target: rpAddress,
          callData: encodeFunctionData({
            abi: routeProcessor4Abi,
            functionName: 'processRoute',
            args: dstTrade?.writeArgs as WriteContractParameters<
              typeof routeProcessor4Abi,
              'processRoute'
            >['args'],
          }),
          value: '0',
          payload: {
            tokenAddress: bridgePath.dstBridgeToken.address,
            inputPos: 1,
          },
          estimatedGas: (
            1.2 * (dstTrade?.route?.gasSpent as number) +
            20_000
          ).toString(),
        },
      ],
      description: `Swap ${dstTrade?.amountIn?.currency.symbol} -> ${dstTrade?.amountOut?.currency.symbol} on RouteProcessor`,
    } as Hook
  }

  return routeRequest
}
