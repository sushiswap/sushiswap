'use client'

import { V2Pool, V3Pool } from '@sushiswap/graph-client/data-api'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import {
  getTokensFromPool,
  useTokenAmountDollarValues,
  useUnderlyingTokenBalanceFromPool,
} from 'src/lib/hooks'
import { useBalanceWeb3 } from 'src/lib/wagmi/hooks/balances/useBalanceWeb3'
import { ChainId } from 'sushi/chain'
import { Amount, Type } from 'sushi/currency'
import { useAccount } from 'wagmi'

interface PoolPositionContext {
  balance: Amount<Type> | null | undefined
  value0: number
  value1: number
  underlying0: Amount<Type> | undefined
  underlying1: Amount<Type> | undefined
  isLoading: boolean
  isError: boolean
}

const Context = createContext<PoolPositionContext | undefined>(undefined)

export const PoolPositionProvider: FC<{
  pool: NonNullable<V2Pool | V3Pool>
  children: ReactNode
  watch?: boolean
}> = ({ pool, children }) => {
  const { address: account } = useAccount()

  const { liquidityToken, reserve0, reserve1, totalSupply } = useMemo(() => {
    if (!pool)
      return {
        token0: undefined,
        token1: undefined,
        liquidityToken: undefined,
      }

    const { token0, token1, liquidityToken } = getTokensFromPool(pool)

    return {
      liquidityToken,
      reserve0:
        token0 && pool ? Amount.fromRawAmount(token0, pool.reserve0) : null,
      reserve1:
        token1 && pool ? Amount.fromRawAmount(token1, pool.reserve1) : null,
      totalSupply:
        liquidityToken && pool
          ? Amount.fromRawAmount(liquidityToken, pool.liquidity)
          : null,
    }
  }, [pool])

  const {
    data: balance,
    isInitialLoading: isLoading,
    isError,
  } = useBalanceWeb3({
    chainId: pool.chainId as ChainId,
    currency: liquidityToken,
    account,
  })

  const underlying = useUnderlyingTokenBalanceFromPool({
    reserve0,
    reserve1,
    totalSupply,
    balance,
  })

  const [underlying0, underlying1] = underlying
  const [value0, value1] = useTokenAmountDollarValues({
    chainId: pool.chainId,
    amounts: underlying,
  })

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          balance,
          value0,
          value1,
          underlying0,
          underlying1,
          isLoading,
          isError,
        }),
        [balance, isError, isLoading, underlying0, underlying1, value0, value1],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolPosition = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Pool Position Context')
  }

  return context
}
