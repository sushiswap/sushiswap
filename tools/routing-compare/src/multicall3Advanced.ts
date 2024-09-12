import { ChainId } from 'sushi'
import { multicall3Abi } from 'sushi/abi'
import { publicClientConfig } from 'sushi/config'
import { Token } from 'sushi/currency'
import {
  http,
  Abi,
  Address,
  Hex,
  StateOverride,
  createPublicClient,
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData,
  erc20Abi,
} from 'viem'
import { isNative } from './utils.js'

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

const ALCHEMY_ENTRY_POINTS: Record<number, string> = {
  [ChainId.ETHEREUM]: 'https://eth-mainnet.g.alchemy.com/v2/',
  [ChainId.POLYGON]: 'https://polygon-mainnet.g.alchemy.com/v2/',
  [ChainId.POLYGON_ZKEVM]: 'https://polygonzkevm-mainnet.g.alchemy.com/v2',
  [ChainId.ARBITRUM]: 'https://arb-mainnet.g.alchemy.com/v2/',
  [ChainId.OPTIMISM]: 'https://opt-mainnet.g.alchemy.com/v2/',
  [ChainId.BASE]: 'https://base-mainnet.g.alchemy.com/v2/',
}

export function ifNetworkSupported(chainId: ChainId) {
  return ALCHEMY_ENTRY_POINTS[chainId] !== undefined
}

export function createClientAlchemy(chainId: ChainId) {
  return createPublicClient({
    chain: publicClientConfig[chainId].chain,
    transport: http(
      `${ALCHEMY_ENTRY_POINTS[chainId]}${process.env['ALCHEMY_ID']}`,
    ),
  })
}

export interface CallData {
  action: string // Human-readable comment
  target: Address | Token // contract to call
  callData?: Hex // calldata
  abi?: Abi | undefined
  functionName?: string
  args?: any[]
  value?: bigint | undefined
  validate?: (
    returnDataAsBigInt: bigint,
    returnDataRaw: Hex,
  ) => string | undefined // string in case of an error
}

export function balanceOfCallData(token: Token, user: Address): CallData {
  if (isNative(token))
    return {
      action: `Balance of ${user}`,
      target: MULTICALL3_ADDRESS,
      abi: multicall3Abi,
      functionName: 'getEthBalance',
      args: [user],
    }
  return {
    action: `Token ${token.symbol}(${token.address}) balanceOf ${user}`,
    target: token.address,
    functionName: 'balanceOf',
    args: [user],
  }
}

export async function aggregate3({
  chainId,
  account,
  calls,
  stateOverride,
  blockNumber,
  value,
  client,
}: {
  chainId: ChainId
  account: Address
  calls: CallData[]
  stateOverride?: StateOverride | undefined
  blockNumber?: bigint | undefined
  value?: bigint | undefined
  client?: ReturnType<typeof createClientAlchemy> | undefined
}): Promise<string | undefined> {
  client = client ?? createClientAlchemy(chainId)
  const multicall3Data = encodeFunctionData({
    abi: multicall3Abi,
    functionName: 'aggregate3Value',
    args: [
      calls.map((call, i) => {
        if (call.callData !== undefined)
          return {
            target:
              call.target instanceof Token ? call.target.address : call.target,
            callData: call.callData,
            value: call.value ?? 0n,
            allowFailure: true,
          }
        else if (call.functionName)
          return {
            target:
              call.target instanceof Token ? call.target.address : call.target,
            callData: encodeFunctionData({
              abi: call.abi ?? erc20Abi,
              functionName: call.functionName,
              args: call.args ?? [],
            }),
            value: call.value ?? 0n,
            allowFailure: true,
          }
        else throw new Error(`Incorrect call data: ${i}`)
      }),
    ],
  })
  const { data: returnData } = await client.call({
    account,
    to: MULTICALL3_ADDRESS,
    data: multicall3Data,
    stateOverride,
    blockNumber,
    value,
  })
  if (returnData === undefined) return `simulateRoute: Multicall error`

  const res = decodeFunctionResult({
    abi: multicall3Abi,
    functionName: 'aggregate3Value',
    data: returnData,
  })
  for (let i = 0; i < res.length; ++i) {
    const { success, returnData } = res[i] as {
      success: boolean
      returnData: `0x${string}`
    }
    const cd = calls[i] as CallData
    if (!success) {
      try {
        const abi = cd.target instanceof Token ? cd.abi ?? erc20Abi : cd.abi
        const err =
          abi !== undefined
            ? decodeErrorResult({
                abi,
                data: returnData,
              })
            : returnData
        return `'${cd.action}' call error: ${JSON.stringify(err)}`
      } catch (e) {
        return e instanceof Error ? e.message : 'decodeErrorResult error'
      }
    }
    if (cd.validate) {
      const err = cd.validate(BigInt(returnData), returnData)
      if (err) return err
    }
  }
  return undefined
}