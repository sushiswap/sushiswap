'use client'

import { Pool } from '@sushiswap/client'
import { Button } from '@sushiswap/ui/components/button'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
} from '@sushiswap/ui/components/card'
import { Checker } from '@sushiswap/wagmi/systems/Checker'
import { FC } from 'react'
import { formatUSD } from 'sushi/format'

import { type ChainId } from 'sushi/chain'
import { usePoolPositionRewards } from './PoolPositionRewardsProvider'

interface PoolMyRewardsProps {
  pool: Pool
}

export const PoolMyRewards: FC<PoolMyRewardsProps> = ({ pool }) => {
  const { pendingRewards, harvest, values, isLoading } =
    usePoolPositionRewards()

  if (!pool?.incentives?.length && !pendingRewards?.length) return <span />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unclaimed rewards</CardTitle>
        <CardDescription>
          Total: {formatUSD(values.reduce((a, b) => a + b, 0))}
        </CardDescription>
      </CardHeader>
      {pendingRewards?.length ? (
        <CardContent>
          <CardGroup>
            <CardLabel>Tokens</CardLabel>
            {pendingRewards.map((reward, index) => {
              return (
                <CardCurrencyAmountItem
                  key={index}
                  isLoading={isLoading}
                  amount={reward}
                  fiatValue={formatUSD(values[index])}
                />
              )
            })}
          </CardGroup>
        </CardContent>
      ) : null}
      <CardFooter>
        <Checker.Connect variant="outline" size="default" fullWidth>
          <Checker.Network
            variant="outline"
            size="default"
            fullWidth
            chainId={pool.chainId as ChainId}
          >
            <Button
              disabled={!harvest || !pendingRewards?.length}
              fullWidth
              onClick={() => harvest?.()}
              size="default"
            >
              Claim
            </Button>
          </Checker.Network>
        </Checker.Connect>
      </CardFooter>
    </Card>
  )
}
