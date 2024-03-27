'use client'

import { useAngleRewards } from '@sushiswap/react-query'
import { useHarvestAngleRewards } from '@sushiswap/wagmi'
import { FC, ReactElement, useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import { Address } from 'viem'

interface ConcentratedLiquidityHarvestButton {
  account: Address | undefined
  enabled?: boolean
  chainId: ChainId
  children(params: ReturnType<typeof useHarvestAngleRewards>): ReactElement
}

export const ConcentratedLiquidityHarvestButton: FC<
  ConcentratedLiquidityHarvestButton
> = ({ account, chainId, enabled, children }) => {
  const { data: rewards } = useAngleRewards({
    chainId,
    account,
  })

  const args = useMemo(() => {
    if (!rewards || !account || !rewards.transactionData) return undefined
    const [tokens, claims, proofs] = Object.entries(
      rewards.transactionData,
    ).reduce<[Address[], bigint[], Address[][]]>(
      (acc, [k, v]) => {
        if (v.proof !== undefined) {
          acc[0].push(k as Address)
          acc[1].push(BigInt(v.claim))
          acc[2].push(v.proof as Address[])
        }
        return acc
      },
      [[], [], []],
    )

    return {
      users: tokens.map(() => account),
      tokens,
      claims,
      proofs,
    }
  }, [account, rewards])

  const data = useHarvestAngleRewards({
    account,
    chainId,
    enabled,
    args,
  })

  return <>{children(data)}</>
}
