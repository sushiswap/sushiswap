import { useMemo } from 'react'
import { formatNumber } from './utilFunctions'

interface Params {
  totalSupply: number | undefined | null
  reserve0: number | undefined | null
  reserve1: number | undefined | null
  balance: number | undefined | null
  decimals: number | undefined
}

type UseUnderlyingTokenBalanceFromPairParams = (
  params: Params,
) => [string | undefined, string | undefined]

export const useUnderlyingTokenBalanceFromPool: UseUnderlyingTokenBalanceFromPairParams =
  ({ balance, totalSupply, reserve1, reserve0, decimals }) => {
    return useMemo(() => {
      if (!balance || !totalSupply || !reserve0 || !reserve1) {
        return [undefined, undefined]
      }

      if (totalSupply === 0) {
        return ['0', '0']
      }
      const underlying0 = (reserve0 * balance) / totalSupply
      const underlying1 = (reserve1 * balance) / totalSupply
      return [
        formatNumber(underlying0, decimals as number),
        formatNumber(underlying1, decimals as number),
      ]
    }, [balance, reserve0, reserve1, totalSupply, decimals])
  }
