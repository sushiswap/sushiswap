import TronWeb from 'tronweb'
import { IToken } from '~tron/_common/types/token-type'
import { getValidTokenAddress } from './helpers'

export const truncateText = (str: string | `0x${string}`, n = 5): string => {
  if (str) {
    if (str.length <= n) {
      return str
    }
    return `${str.slice(0, n)}...${str.slice(str.length - n)}`
  }
  return ''
}

export const hashStringToColor = (str: string) => {
  const hash = _djb2(str)
  const r = (hash & 0xff0000) >> 16
  const g = (hash & 0x00ff00) >> 8
  const b = hash & 0x0000ff
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const _djb2 = (str: string) => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i) /* hash * 33 + c */
  }
  return hash
}

export const sortTokenAddresses = (
  token0: string,
  token1: string,
): [string, string] => {
  return token0.toLowerCase() < token1.toLowerCase()
    ? [token0, token1]
    : [token1, token0]
}

export const sortTokens = (
  token0: IToken,
  token1: IToken,
): [IToken, IToken] => {
  return getValidTokenAddress(token0.address).toLowerCase() <
    getValidTokenAddress(token1.address).toLowerCase()
    ? [token0, token1]
    : [token1, token0]
}

export const formatUnits = (
  amount: string | number,
  decimals: number,
  maxDecimals?: number,
): string => {
  if (Number.isNaN(Number(amount))) {
    return '0'
  }
  const val = TronWeb.toBigNumber(amount).div(10 ** decimals)
  if (Number(val) < 0.0001) {
    return '<0.0001'
  }
  if (maxDecimals) {
    return toBigNumber(
      parseFloat(val.toFixed(maxDecimals)).toString(),
    ).toString(10)
  }
  return toBigNumber(parseFloat(val.toFixed(decimals)).toString()).toString(10)
}

export const formatUnitsForInput = (
  amount: string | number,
  decimals: number,
): string => {
  if (Number.isNaN(Number(amount))) {
    return '0'
  }

  const _decimals = toBigNumber(10).pow(decimals)

  const val = TronWeb.toBigNumber(amount).div(_decimals)
  if (Number.isNaN(val)) {
    return '0'
  }

  return toBigNumber(parseFloat(val.toFixed(decimals)).toString()).toString(10)
}

export const parseUnits = (
  amount: string | number,
  decimals: number,
): string => {
  if (Number.isNaN(Number(amount))) {
    return '0'
  }

  const val = TronWeb.toBigNumber(amount)
    .times(10 ** decimals)
    .toString(10)

  if (!toBigNumber(val).isInteger()) {
    return toBigNumber(val)
      .toFormat(0, {
        groupSeparator: '',
        decimalSeparator: '.',
        padFractionalPart: false,
      })
      .toString(10)
  }

  return val
}

export const toBigNumber = (amount: string | number) => {
  return TronWeb.toBigNumber(amount)
}

export const removeDecimals = (amount: string | number): string => {
  const val = TronWeb.toBigNumber(amount)
  if (!toBigNumber(val).isInteger()) {
    return toBigNumber(val)
      .toFormat(0, {
        groupSeparator: '',
        decimalSeparator: '.',
        padFractionalPart: false,
      })
      .toString(10)
  }
  return val.toString(10)
}
