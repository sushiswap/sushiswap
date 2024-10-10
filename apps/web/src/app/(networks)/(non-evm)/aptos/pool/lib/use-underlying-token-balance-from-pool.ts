import { useMemo } from 'react'
import { formatNumberWithDecimals } from '~aptos/_common/lib/common/format-number-with-decimals'

interface Params {
  totalSupply: number | undefined | null
  reserve0: number | undefined | null
  reserve1: number | undefined | null
  token0: { decimals: number } | undefined
  token1: { decimals: number } | undefined
  balance: number | undefined | null
}

type UseUnderlyingTokenBalanceFromPairParams = (
  params: Params,
) => [string | undefined, string | undefined]

export const useUnderlyingTokenBalanceFromPool: UseUnderlyingTokenBalanceFromPairParams =
  ({ balance, totalSupply, reserve0, reserve1, token0, token1 }) => {
    return useMemo(() => {
      if (
        !balance ||
        !totalSupply ||
        !reserve0 ||
        !reserve1 ||
        token0?.decimals === undefined ||
        token1?.decimals === undefined
      ) {
        return [undefined, undefined]
      }

      if (totalSupply === 0) {
        return ['0', '0']
      }
      const underlying0 = (reserve0 * balance) / totalSupply
      const underlying1 = (reserve1 * balance) / totalSupply

      return [
        formatNumberWithDecimals(underlying0, token0.decimals),
        formatNumberWithDecimals(underlying1, token1.decimals),
      ]
    }, [balance, reserve0, reserve1, token0, token1, totalSupply])
  }
