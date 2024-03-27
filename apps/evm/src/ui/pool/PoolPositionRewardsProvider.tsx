'use client'

import { ChefType, Pool } from '@sushiswap/client'
import {
  RewarderType,
  useAccount,
  useMasterChef,
  useRewarder,
} from '@sushiswap/wagmi'
import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import { incentiveRewardToToken } from 'src/lib/functions'
import { useTokenAmountDollarValues, useTokensFromPool } from 'src/lib/hooks'
import { ChainId } from 'sushi/chain'
import { Amount, Token } from 'sushi/currency'

interface PoolPositionRewardsContext {
  pendingRewards: (Amount<Token> | undefined)[]
  rewardTokens: Token[]
  values: number[]
  isLoading: boolean
  isError: boolean
  harvest: undefined | (() => void)
}

const Context = createContext<PoolPositionRewardsContext | undefined>(undefined)

interface PoolPositionRewardsProviderProps {
  pool: Pool
  farmId: number
  chefType: ChefType
  children: ReactNode
  incentives: Pool['incentives']
}

interface PoolPositionStakedProviderProps {
  pool: Pool
  children: ReactNode
}

export const PoolPositionRewardsProvider: FC<PoolPositionStakedProviderProps> =
  ({ pool, children }) => {
    // console.log('PoolPositionRewardsProvider', pool, !pool?.wasIncentivized)
    if (!pool?.wasIncentivized)
      return (
        <Context.Provider
          value={{
            pendingRewards: [],
            rewardTokens: [],
            values: [],
            isLoading: true,
            isError: false,
            harvest: undefined,
          }}
        >
          {children}
        </Context.Provider>
      )

    return (
      <_PoolPositionRewardsProvider
        pool={pool}
        farmId={Number(pool?.incentives?.[0]?.pid)}
        chefType={pool?.incentives?.[0]?.chefType}
        incentives={pool?.incentives}
      >
        {children}
      </_PoolPositionRewardsProvider>
    )
  }

export const _PoolPositionRewardsProvider: FC<
  PoolPositionRewardsProviderProps
> = ({ farmId, chefType, incentives, pool, children }) => {
  const { address: account } = useAccount()
  const { liquidityToken } = useTokensFromPool(pool)

  const [rewardTokens, rewarderAddresses, types] = useMemo(() => {
    return incentives.reduce<[Token[], string[], RewarderType[]]>(
      (acc, incentive) => {
        acc[0].push(incentiveRewardToToken(pool.chainId as ChainId, incentive))
        acc[1].push(incentive.id.split(':')[1])
        acc[2].push(
          incentive.rewarderType === 'Primary'
            ? RewarderType.Primary
            : RewarderType.Secondary,
        )
        return acc
      },
      [[], [], []],
    )
  }, [incentives, pool.chainId])

  const {
    data: pendingRewards,
    isLoading,
    isError,
  } = useRewarder({
    chainId: pool.chainId as ChainId,
    account,
    rewardTokens,
    farmId,
    rewarderAddresses,
    types,
    chef: chefType,
    enabled: Boolean(account),
  })

  const { harvest } = useMasterChef({
    chainId: pool.chainId as ChainId,
    chef: chefType,
    pid: farmId,
    token: liquidityToken,
  })

  const values = useTokenAmountDollarValues({
    chainId: pool.chainId,
    amounts: pendingRewards,
  })

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          pendingRewards,
          rewardTokens,
          values,
          isLoading,
          isError,
          harvest,
        }),
        [harvest, isError, isLoading, pendingRewards, rewardTokens, values],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolPositionRewards = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside Pool Position Context')
  }

  return context
}
