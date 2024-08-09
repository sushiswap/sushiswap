'use client'

import { useMemo } from 'react'
import { Native, Token } from 'sushi/currency'

export const getTokensFromPool = (pool: {
  id: string
  token0: { address: string; name: string; decimals: number; symbol: string }
  token1: { address: string; name: string; decimals: number; symbol: string }
  chainId: number
}) => {
  const _token0 = new Token({
    address: pool.token0.address,
    name: pool.token0.name,
    decimals: Number(pool.token0.decimals),
    symbol: pool.token0.symbol,
    chainId: pool.chainId,
  })

  const _token1 = new Token({
    address: pool.token1.address,
    name: pool.token1.name,
    decimals: Number(pool.token1.decimals),
    symbol: pool.token1.symbol,
    chainId: pool.chainId,
  })

  const [token0, token1, liquidityToken] = [
    _token0.wrapped.address === Native.onChain(_token0.chainId).wrapped.address
      ? Native.onChain(_token0.chainId)
      : _token0,
    _token1.wrapped.address === Native.onChain(_token1.chainId).wrapped.address
      ? Native.onChain(_token1.chainId)
      : _token1,
    new Token({
      address: pool.id.includes(':') ? pool.id.split(':')[1] : pool.id,
      name: 'SLP Token',
      decimals: 18,
      symbol: 'SLP',
      chainId: pool.chainId,
    }),
  ]

  return {
    token0,
    token1,
    liquidityToken,
  }
}

export const useTokensFromPool = (pool: {
  id: string
  token0: { address: string; name: string; decimals: number; symbol: string }
  token1: { address: string; name: string; decimals: number; symbol: string }
  chainId: number
}) => {
  return useMemo(() => {
    return getTokensFromPool(pool)
  }, [pool])
}
