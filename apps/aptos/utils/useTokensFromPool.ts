import { Pool } from './usePools'
import { Token } from './tokenType'
import { useTokens } from './useTokens'
import { useMemo } from 'react'

export function useTokensFromPools(row: Pool) {
  let token0: Token = {} as Token
  let token1: Token = {} as Token

  const { data: tokens } = useTokens()
  const address0 = row?.data?.token_x_details?.token_address
  const address1 = row?.data?.token_y_details?.token_address
  if (tokens?.[address0]) {
    token0 = tokens?.[address0]
  } else {
    token0 = {
      address: row?.data?.token_x_details?.token_address,
      decimals: row?.data?.token_x_details?.decimals,
      name: row?.data?.token_x_details?.name,
      symbol: row?.data?.token_x_details?.symbol,
    }
  }
  if (tokens?.[address1]) {
    token1 = tokens?.[address1]
  } else {
    token1 = {
      address: row?.data?.token_y_details?.token_address,
      decimals: row?.data?.token_y_details?.decimals,
      name: row?.data?.token_y_details?.name,
      symbol: row?.data?.token_y_details?.symbol,
    }
  }

  return useMemo(() => {
    return { token0, token1 }
  }, [token0, token1])
}
