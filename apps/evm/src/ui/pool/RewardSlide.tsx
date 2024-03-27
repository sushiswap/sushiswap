'use client'

import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { useAngleRewardsMultipleChains } from '@sushiswap/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardPrimitive,
  HoverCardTrigger,
  SkeletonBox,
  SkeletonText,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { Currency } from '@sushiswap/ui/components/currency'
import { List } from '@sushiswap/ui/components/list/List'
import { Checker } from '@sushiswap/wagmi/systems/Checker'
import React, { FC, ReactNode, useMemo } from 'react'
import { Chain } from 'sushi/chain'
import { formatNumber } from 'sushi/format'
import { Address } from 'viem'
import { ConcentratedLiquidityHarvestButton } from './ConcentratedLiquidityHarvestButton'

interface RewardSlide {
  address: Address | undefined
  data: NonNullable<ReturnType<typeof useAngleRewardsMultipleChains>['data']>[0]
}

export const RewardSlide: FC<RewardSlide> = ({ address, data }) => {
  const totalUnclaimedAmountUSD = useMemo(
    () => data.unclaimed.reduce((acc, cur) => acc + cur.amountUSD, 0),
    [data.unclaimed],
  )

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <Card className="w-[320px]">
        <CardHeader>
          <CardTitle>
            {' '}
            $
            {totalUnclaimedAmountUSD === 0
              ? '0'
              : formatNumber(totalUnclaimedAmountUSD)}
          </CardTitle>
          <CardDescription>{Chain.from(data.chainId)?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Claimable{' '}
              <HoverCardTrigger>
                <InformationCircleIcon width={16} height={16} />
              </HoverCardTrigger>
            </div>
            <div className="flex gap-1.5 truncate flex-grow h-full">
              {data.unclaimed.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  No rewards found
                </span>
              ) : (
                React.Children.toArray(
                  data.unclaimed.map((el) => {
                    return (
                      <div
                        key={el.amount.currency.id}
                        className="flex items-center gap-1.5"
                      >
                        <div className="w-4 h-4">
                          <Currency.Icon
                            currency={el.amount.currency}
                            width={16}
                            height={16}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {el.amount.toSignificant(4)}{' '}
                          {el.amount.currency.symbol}
                        </span>
                      </div>
                    )
                  }),
                )
                  .reduce<ReactNode[]>((previousValue, currentValue) => {
                    previousValue.push(currentValue)
                    previousValue.push('+')
                    return previousValue
                  }, [])
                  .slice(0, -1)
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <ConcentratedLiquidityHarvestButton
            account={address}
            chainId={data.chainId}
          >
            {({ write, isLoading }) => (
              <Checker.Connect size="sm" variant="secondary">
                <Checker.Network
                  size="sm"
                  variant="secondary"
                  chainId={data.chainId}
                >
                  <Button
                    fullWidth={true}
                    size="sm"
                    disabled={isLoading}
                    onClick={() => write?.()}
                  >
                    Claim
                  </Button>
                </Checker.Network>
              </Checker.Connect>
            )}
          </ConcentratedLiquidityHarvestButton>
        </CardFooter>
      </Card>
      <HoverCardPrimitive.Portal>
        <HoverCardContent className="!p-0 w-[320px] z-10">
          <CardHeader>
            <CardTitle>Claimable</CardTitle>
            <CardDescription>
              Claiming will harvest all your rewards for all your V3 Positions
              on {Chain.from(data.chainId)?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <List.Control>
              {data.unclaimed.map((el) => (
                <List.KeyValue
                  key={el.amount.currency.id}
                  flex
                  title={`${el.amount.currency.symbol}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Currency.Icon
                        currency={el.amount.currency}
                        width={18}
                        height={18}
                      />
                      {el.amount.toSignificant(4)} {el.amount.currency.symbol}
                    </div>
                  </div>
                </List.KeyValue>
              ))}
            </List.Control>
          </CardContent>
        </HoverCardContent>
      </HoverCardPrimitive.Portal>
    </HoverCard>
  )
}

export const RewardSlideSkeleton: FC = () => {
  return (
    <Card className="w-[320px] h-[222px]">
      <CardContent className="pt-6">
        <SkeletonText fontSize="xs" className="w-[50px]" />
        <div className="flex flex-col flex-grow gap-1 mt-4">
          <SkeletonText fontSize="sm" className="w-[50px]" />
          <SkeletonText fontSize="sm" className="w-[90px]" />
        </div>
        <div className="mt-4">
          <SkeletonBox className="h-[36px]" />
        </div>
      </CardContent>
    </Card>
  )
}
