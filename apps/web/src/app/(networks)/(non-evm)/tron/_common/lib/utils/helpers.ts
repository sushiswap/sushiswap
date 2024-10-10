import TronWeb from 'tronweb'
import { ROUTER_CONTRACT } from '~tron/_common/constants/contracts'
import { DEFAULT_TOKEN_LIST } from '~tron/_common/constants/token-list'
import {
  IRouterFunctionSelector,
  IRouterLiquidityFunctionSelector,
  IRouterRemoveLiquidityFunctionSelector,
} from '~tron/_common/types/router-selector-type'
import { IToken } from '~tron/_common/types/token-type'

export const isAddress = (address: string): boolean => {
  if (!address) return false
  return TronWeb.isAddress(address)
}

export const getValidTokenAddress = (address: string): string => {
  let _tokenAddress = address
  if (address === 'TRON') {
    _tokenAddress = DEFAULT_TOKEN_LIST.find((token) => token.symbol === 'WTRX')
      ?.address as string
  }
  return _tokenAddress
}

export const getBase58Address = (address: string): string => {
  return TronWeb.address.fromHex(address)
}

export const getHexAddress = (address: string): string => {
  return TronWeb.address.toHex(address)
}

export const chunk = <T>(arr: T[], chunkSize: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize),
  )
}

export const flatten = <T>(arr: T[][]): T[] => {
  return arr.flat()
}

export const chunkAndFlatten = <T>(arr: T[], chunkSize: number): T[] => {
  const chunked = chunk(arr, chunkSize)
  return flatten(chunked)
}

export const timer = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getToken0Price = (
  reserve0Amount: string,
  reserve1Amount: string,
  reserve0Decimals: number,
  reserve1Decimals: number,
): string => {
  const reserve0 = TronWeb.toBigNumber(reserve0Amount).div(
    10 ** reserve0Decimals,
  )
  const reserve1 = TronWeb.toBigNumber(reserve1Amount).div(
    10 ** reserve1Decimals,
  )
  return reserve1.div(reserve0).toString(10)
}

export const getToken1Price = (
  reserve0Amount: string,
  reserve1Amount: string,
  reserve0Decimals: number,
  reserve1Decimals: number,
): string => {
  const reserve0 = TronWeb.toBigNumber(reserve0Amount).div(
    10 ** reserve0Decimals,
  )
  const reserve1 = TronWeb.toBigNumber(reserve1Amount).div(
    10 ** reserve1Decimals,
  )
  return reserve0.div(reserve1).toString(10)
}

export const getToken0AmountForLiquidity = (
  token1Amount: string,
  reserve0: string,
  reserv1: string,
): string => {
  //@DEV parseUnits for token1Amount
  const token1 = TronWeb.toBigNumber(token1Amount)
  const reserve0BN = TronWeb.toBigNumber(reserve0)
  const reserve1BN = TronWeb.toBigNumber(reserv1)
  return token1.times(reserve0BN).div(reserve1BN).toString(10)
}

export const getToken1AmountForLiquidity = (
  token0Amount: string,
  reserve0: string,
  reserv1: string,
): string => {
  //@DEV parseUnits for token0Amount
  const token0 = TronWeb.toBigNumber(token0Amount)
  const reserve0BN = TronWeb.toBigNumber(reserve0)
  const reserve1BN = TronWeb.toBigNumber(reserv1)
  return token0.times(reserve1BN).div(reserve0BN).toString(10)
}

export const getIfWrapOrUnwrap = (
  token0: IToken,
  token1: IToken,
): 'wrap' | 'unwrap' | 'swap' => {
  if (token0.symbol === 'WTRX' && token1.symbol === 'TRX') {
    return 'unwrap'
  }
  if (token0.symbol === 'TRX' && token1.symbol === 'WTRX') {
    return 'wrap'
  }
  return 'swap'
}

export const isContract = async (tronWebInstace: any, address: string) => {
  const code = await tronWebInstace.trx.getContract(address)
  // will be empty object if not a contract
  return 'contract_address' in code
}

export const parseTxnError = (error: string): string => {
  console.log('parseTxnError: ', error)
  switch (error) {
    case 'CONTRACT_VALIDATE_ERROR':
      return 'Insufficient TRX balance'

    default:
      return 'An error occurred while processing the transaction.'
  }
}

//TODO: Add type for transactionInfo
export const getTransactionInfo = async (
  tronWebInstance: any,
  txId: string,
  waitIntervalMs = 6000,
  maxTries = 15,
) => {
  //avg txn is 1min till confirmed
  let transactionInfo
  for (let i = 0; i < maxTries; i++) {
    transactionInfo =
      await tronWebInstance.trx.getUnconfirmedTransactionInfo(txId)
    // console.log({ transactionInfo });
    if (transactionInfo?.receipt) {
      return transactionInfo
    }
    await timer(waitIntervalMs)
  }
  throw new Error('Transaction not found or timeout reached')
}

//TODO: Add type for result
export const estimateEnergy = async (
  tronWebInstance: any,
  contractAddress: string,
  functionSelector: string,
  option: Record<string, string | number>,
  paramater: { type: string; value: string }[],
  issuerAddress: string,
) => {
  // console.log("estimateEnergy", contractAddress, functionSelector, option, paramater, issuerAddress);
  const data = await tronWebInstance.transactionBuilder.triggerConstantContract(
    contractAddress, //contract address
    functionSelector, //function name
    option, // options
    paramater, //parameters
    issuerAddress, //issuerAddress
  )

  return data
}

//TODO: Add type for result
export const safeGasEstimates = async (
  tronWebInstance: any,
  args: any[][],
): Promise<any[]> => {
  const safeGasEstimates = await Promise.all(
    args.map((i: any) =>
      //@ts-expect-error
      estimateEnergy(tronWebInstance, ...i)
        .then((c) => {
          return c
        })
        .catch((error) => {
          console.error(`estimateEnergy failed`, error)
          return undefined
        }),
    ),
  )
  return safeGasEstimates.sort((a, b) => a?.energy_used - b?.energy_used)
}

export const getDeadline = (deadlineInMinutes = 20): number => {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const bufferTime = deadlineInMinutes * 60
  return Math.floor(currentTimestamp + bufferTime)
}

export const getRouterFunctionSelectors = (
  route: string[],
): IRouterFunctionSelector[] => {
  const routeHasTron = route.some((address) => address === 'TRON')
  if (routeHasTron) {
    const token0IsTron = route[0] === 'TRON'

    if (token0IsTron) {
      return [
        'swapExactETHForTokens(uint256,address[],address,uint256)',
        'swapETHForExactTokens(uint256,address[],address,uint256)',
        'swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)',
      ]
    } else {
      return [
        'swapExactTokensForETH(uint256,uint256,address[],address,uint256)',
        'swapTokensForExactETH(uint256,uint256,address[],address,uint256)',
        'swapExactTokensForETHSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)',
      ]
    }
  } else {
    return [
      'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
      'swapTokensForExactTokens(uint256,uint256,address[],address,uint256)',
      'swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)',
    ]
  }
}

//TODO: clean this up!!
export const getArgsForSwap = (
  functionSelector: IRouterFunctionSelector,
  amountIn: string,
  amountOut: string,
  amountInMax: string,
  amountOutMin: string,
  route: string[],
  to: string,
  deadline: number,
  issuerAddress: string,
) => {
  const cleanedRoute = route.map((address) => getValidTokenAddress(address))

  switch (functionSelector) {
    case 'swapETHForExactTokens(uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        { callValue: amountIn },
        [
          { type: 'uint256', value: amountOut },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapExactETHForTokens(uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        { callValue: amountIn },
        [
          { type: 'uint256', value: amountOutMin },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        { callValue: amountIn },
        [
          { type: 'uint256', value: amountOutMin },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapExactTokensForETH(uint256,uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'uint256', value: amountIn },
          { type: 'uint256', value: amountOutMin },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapTokensForExactETH(uint256,uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'uint256', value: amountOut },
          { type: 'uint256', value: amountInMax },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapExactTokensForETHSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'uint256', value: amountIn },
          { type: 'uint256', value: amountOutMin },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'uint256', value: amountIn },
          { type: 'uint256', value: amountOutMin },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'uint256', value: amountIn },
          { type: 'uint256', value: amountOutMin },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]
    case 'swapTokensForExactTokens(uint256,uint256,address[],address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'uint256', value: amountOut },
          { type: 'uint256', value: amountInMax },
          { type: 'address[]', value: cleanedRoute },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        issuerAddress,
      ]

    default:
      throw new Error('Invalid function selector')
  }
}

export const getLiquidityFunctionSelector = (
  token0: IToken,
  token1: IToken,
): IRouterLiquidityFunctionSelector => {
  if (token0.symbol === 'TRX' || token1.symbol === 'TRX') {
    return 'addLiquidityETH(address,uint256,uint256,uint256,address,uint256)'
  }
  return 'addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)'
}

export const getArgsForAddLiquidity = (
  functionSelector: IRouterLiquidityFunctionSelector,
  token0Address: string,
  token1Address: string,
  amount0Desired: string,
  amount1Desired: string,
  amount0Min: string,
  amount1Min: string,
  to: string, //same as issuerAddress
  deadline: number,
): any[] => {
  switch (functionSelector) {
    case 'addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'address', value: token0Address },
          { type: 'address', value: token1Address },
          { type: 'uint256', value: amount0Desired },
          { type: 'uint256', value: amount1Desired },
          { type: 'uint256', value: amount0Min },
          { type: 'uint256', value: amount1Min },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        to,
      ]
    case 'addLiquidityETH(address,uint256,uint256,uint256,address,uint256)': {
      const tokenAddress =
        token0Address === 'TRON' ? token1Address : token0Address
      const tokenAmount =
        token0Address === 'TRON' ? amount1Desired : amount0Desired
      const tokenMinAmount = token0Address === 'TRON' ? amount1Min : amount0Min
      const ethAmount =
        token0Address === 'TRON' ? amount0Desired : amount1Desired
      const ethMinAmount = token0Address === 'TRON' ? amount0Min : amount1Min
      return [
        ROUTER_CONTRACT,
        functionSelector,
        { callValue: ethAmount },
        [
          { type: 'address', value: tokenAddress },
          { type: 'uint256', value: tokenAmount },
          { type: 'uint256', value: tokenMinAmount },
          { type: 'uint256', value: ethMinAmount },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        to,
      ]
    }

    default:
      throw new Error('Invalid function selector')
  }
}

export const getRemoveLiquidityFunctionSelector = (
  token0: IToken,
  token1: IToken,
): IRouterRemoveLiquidityFunctionSelector[] => {
  if (token0.symbol === 'TRX' || token1.symbol === 'TRX') {
    return [
      'removeLiquidityETH(address,uint256,uint256,uint256,address,uint256)',
      'removeLiquidityETHSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256)',
    ]
  }
  return [
    'removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)',
  ]
}

export const getArgsForRemoveLiquidity = (
  functionSelector: IRouterRemoveLiquidityFunctionSelector,
  token0Address: string,
  token1Address: string,
  lpToRemove: string,
  amountToken0Min: string,
  amountToken1Min: string,
  to: string, //same as issuerAddress
  deadline: number,
) => {
  switch (functionSelector) {
    case 'removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)':
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'address', value: token0Address },
          { type: 'address', value: token1Address },
          { type: 'uint256', value: lpToRemove },
          { type: 'uint256', value: amountToken0Min },
          { type: 'uint256', value: amountToken1Min },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        to,
      ]
    case 'removeLiquidityETH(address,uint256,uint256,uint256,address,uint256)': {
      const tokenAddress =
        token0Address === 'TRON' ? token1Address : token0Address
      const tokenMinAmount =
        token0Address === 'TRON' ? amountToken1Min : amountToken0Min
      const ethMinAmount =
        token0Address === 'TRON' ? amountToken0Min : amountToken1Min
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'address', value: tokenAddress },
          { type: 'uint256', value: lpToRemove },
          { type: 'uint256', value: tokenMinAmount },
          { type: 'uint256', value: ethMinAmount },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        to,
      ]
    }
    case 'removeLiquidityETHSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256)': {
      const _tokenAddress =
        token0Address === 'TRON' ? token1Address : token0Address
      const _tokenMinAmount =
        token0Address === 'TRON' ? amountToken1Min : amountToken0Min
      const _ethMinAmount =
        token0Address === 'TRON' ? amountToken0Min : amountToken1Min
      return [
        ROUTER_CONTRACT,
        functionSelector,
        {},
        [
          { type: 'address', value: _tokenAddress },
          { type: 'uint256', value: lpToRemove },
          { type: 'uint256', value: _tokenMinAmount },
          { type: 'uint256', value: _ethMinAmount },
          { type: 'address', value: to },
          { type: 'uint256', value: deadline },
        ],
        to,
      ]
    }
  }
}

export const cleanArgs = (args: any[], feeLimit?: string | number) => {
  const _args = args
  if (_args?.[2] && _args?.[2]?._isConstant === true) {
    delete _args[2]._isConstant
  }
  if (feeLimit) {
    _args[2].feeLimit = feeLimit
  }

  return _args
}
