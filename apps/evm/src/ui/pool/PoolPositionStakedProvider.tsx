'use client'

import { ChefType, Pool } from '@sushiswap/client'
import { useMasterChef } from '@sushiswap/wagmi'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import {
  useGraphPool,
  useTokenAmountDollarValues,
  useUnderlyingTokenBalanceFromPool,
} from 'src/lib/hooks'
import { ChainId } from 'sushi/chain'
import { Amount, Currency, Token } from 'sushi/currency'

interface PoolPositionStakedContext {
  balance: Amount<Token> | undefined
  value0: number
  value1: number
  underlying0: Amount<Currency> | undefined
  underlying1: Amount<Currency> | undefined
  isLoading: boolean
  isError: boolean
  isWritePending: boolean
  isWriteError: boolean
}

const Context = createContext<PoolPositionStakedContext | undefined>(undefined)

interface PoolPositionStakedProviderProps {
  pool: Pool
  children: ReactNode
  watch?: boolean
}

export const PoolPositionStakedProvider: FC<PoolPositionStakedProviderProps> =
  ({ pool, children, watch = true }) => {
    if (!pool?.incentives || pool.incentives.length === 0)
      return (
        <Context.Provider
          value={{
            balance: undefined,
            value0: 0,
            value1: 0,
            underlying0: undefined,
            underlying1: undefined,
            isLoading: false,
            isError: false,
            isWriteError: false,
            isWritePending: false,
          }}
        >
          {children}
        </Context.Provider>
      )

    return (
      <_PoolPositionStakedProvider
        watch={watch}
        pool={pool}
        farmId={Number(pool.incentives[0].pid)}
        chefType={pool.incentives[0].chefType}
      >
        {children}
      </_PoolPositionStakedProvider>
    )
  }

interface _PoolPositionStakedProviderProps {
  pool: Pool
  children: ReactNode
  farmId: number
  chefType: ChefType
  watch: boolean
}

const _PoolPositionStakedProvider: FC<_PoolPositionStakedProviderProps> = ({
  watch,
  pool,
  farmId,
  chefType,
  children,
}) => {
  const {
    data: { reserve0, reserve1, totalSupply, liquidityToken },
  } = useGraphPool(pool)
  const { balance, isLoading, isError, isWritePending, isWriteError } =
    useMasterChef({
      chainId: pool.chainId as ChainId,
      chef: chefType,
      pid: farmId,
      token: liquidityToken,
      watch,
    })

  const stakedUnderlying = useUnderlyingTokenBalanceFromPool({
    reserve0: reserve0,
    reserve1: reserve1,
    totalSupply,
    balance,
  })

  const [underlying0, underlying1] = stakedUnderlying
  const [value0, value1] = useTokenAmountDollarValues({
    chainId: pool.chainId,
    amounts: stakedUnderlying,
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
          isWritePending,
          isWriteError,
        }),
        [
          balance,
          isError,
          isLoading,
          isWriteError,
          isWritePending,
          underlying0,
          underlying1,
          value0,
          value1,
        ],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolPositionStaked = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Pool Position Staked Context')
  }

  return context
}
