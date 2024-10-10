import { useMemo } from 'react'
import { useBaseTokens } from '~aptos/_common/lib/common/use-base-tokens'
import { Token } from '~aptos/_common/lib/types/token'
import { Pool } from './convert-pool-to-sushi-pool'

export function useTokensFromPool(row: Pool): { token0: Token; token1: Token }
export function useTokensFromPool(row: undefined): {
  token0: undefined
  token1: undefined
}
export function useTokensFromPool(row: Pool | undefined):
  | {
      token0: undefined
      token1: undefined
    }
  | { token0: Token; token1: Token }
export function useTokensFromPool(row: Pool | undefined) {
  const { data: tokens } = useBaseTokens()

  return useMemo(() => {
    if (typeof row === 'undefined')
      return { token0: undefined, token1: undefined }

    let token0: Token
    let token1: Token

    if (tokens?.[row.token0.address]) {
      token0 = tokens?.[row.token0.address]
    } else {
      token0 = row.token0
    }
    if (tokens?.[row.token1.address]) {
      token1 = tokens?.[row.token1.address]
    } else {
      token1 = row.token1
    }

    return { token0, token1 }
  }, [row, tokens])
}
