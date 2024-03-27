'use client'

import { getPool } from '@sushiswap/client'
import { useConcentratedLiquidityPoolStats } from '@sushiswap/react-query'
import { CardLabel, Separator, SkeletonText, classNames } from '@sushiswap/ui'
import { Container, LinkInternal, Message } from '@sushiswap/ui'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@sushiswap/ui/components/card'
import { Toggle } from '@sushiswap/ui/components/toggle'
import {
  useConcentratedLiquidityPool,
  useConcentratedLiquidityPoolReserves,
} from '@sushiswap/wagmi'
import React, { FC, useState } from 'react'
import { useTokenAmountDollarValues } from 'src/lib/hooks'
import { SushiSwapV3ChainId } from 'sushi/config'
import { formatUSD } from 'sushi/format'
import { Address } from 'viem'
import { ConcentratedLiquidityProvider } from './ConcentratedLiquidityProvider'
import { ConcentratedPositionsTable } from './ConcentratedPositionsTable'
import { PoolRewardDistributionsCard } from './PoolRewardDistributionsCard'
import { PoolTransactionsV3 } from './PoolTransactionsV3'
import { PoolsFiltersProvider } from './PoolsFiltersProvider'
import { StatisticsCharts } from './StatisticsChart'

enum Granularity {
  Day = 0,
  Week = 1,
}

const PoolPageV3: FC<{ pool: Awaited<ReturnType<typeof getPool>> }> = ({
  pool,
}) => {
  return (
    <ConcentratedLiquidityProvider>
      <Pool pool={pool} />
    </ConcentratedLiquidityProvider>
  )
}

const Pool: FC<{ pool: Awaited<ReturnType<typeof getPool>> }> = ({ pool }) => {
  const { id } = pool
  const [_chainId, address] = id.split(':')
  const chainId = +_chainId as SushiSwapV3ChainId
  const [granularity, setGranularity] = useState<Granularity>(Granularity.Day)

  const { data: poolStats } = useConcentratedLiquidityPoolStats({
    chainId,
    address,
  })
  const { data: cPool } = useConcentratedLiquidityPool({
    chainId,
    token0: poolStats?.token0,
    token1: poolStats?.token1,
    feeAmount: poolStats?.feeAmount,
  })

  const { data: reserves, isLoading: isReservesLoading } =
    useConcentratedLiquidityPoolReserves({
      pool: cPool,
      chainId,
    })
  const fiatValues = useTokenAmountDollarValues({ chainId, amounts: reserves })

  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <div className="flex flex-col gap-6">
        {pool.hasEnabledSteerVault && (
          <Message variant="info" size="sm">
            {`This pool has been activated to leverage our smart pool feature. Smart pools are designed to optimize the
        allocation of liquidity within customized price ranges, thereby improving trading efficiency. They achieve
        this by enhancing liquidity depth around the current price, which results in higher fee earnings for liquidity
        providers (LPs) and allows the market to dictate the distribution of LPs' positions based on rational
        decisions.`}{' '}
            To create a smart pool position, click{' '}
            <LinkInternal
              shallow={true}
              href={`/pool/${pool.id}/smart`}
              className="underline"
            >
              here
            </LinkInternal>
          </Message>
        )}
        <PoolsFiltersProvider>
          <ConcentratedPositionsTable
            chainId={pool.chainId as SushiSwapV3ChainId}
            poolId={pool.address as Address}
            hideNewSmartPositionButton={!pool.hasEnabledSteerVault}
          />
        </PoolsFiltersProvider>
        <div className="py-4">
          <Separator />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[auto_400px] gap-6">
          <StatisticsCharts address={address} chainId={chainId} />
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Liquidity</CardTitle>
                <CardDescription>
                  {formatUSD(fiatValues[0] + fiatValues[1])}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardCurrencyAmountItem
                  isLoading={isReservesLoading}
                  amount={reserves?.[0]}
                  fiatValue={formatUSD(fiatValues[0])}
                />
                <CardCurrencyAmountItem
                  isLoading={isReservesLoading}
                  amount={reserves?.[1]}
                  fiatValue={formatUSD(fiatValues[1])}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-col md:flex-row justify-between gap-y-4">
                    Statistics
                    <div className="flex items-center gap-1">
                      <Toggle
                        variant="outline"
                        size="xs"
                        pressed={granularity === Granularity.Day}
                        onClick={() => setGranularity(Granularity.Day)}
                      >
                        24H
                      </Toggle>
                      <Toggle
                        variant="outline"
                        size="xs"
                        pressed={granularity === Granularity.Week}
                        onClick={() => setGranularity(Granularity.Week)}
                      >
                        1W
                      </Toggle>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <CardLabel>Volume</CardLabel>
                    {poolStats ? (
                      <div className="text-xl font-semibold">
                        {formatUSD(
                          granularity === Granularity.Week
                            ? poolStats.volume1w
                            : poolStats.volume1d ?? 0,
                        )}{' '}
                        <span
                          className={classNames(
                            'text-xs',
                            poolStats[
                              granularity === Granularity.Week
                                ? 'volumeChange1w'
                                : 'volumeChange1d'
                            ] > 0
                              ? 'text-green'
                              : 'text-red',
                          )}
                        >
                          (
                          {poolStats[
                            granularity === Granularity.Week
                              ? 'volumeChange1w'
                              : 'volumeChange1d'
                          ].toFixed(2)}
                          %)
                        </span>
                      </div>
                    ) : (
                      <SkeletonText />
                    )}
                  </div>
                  <div>
                    <CardLabel>Fees</CardLabel>
                    {poolStats ? (
                      <div className="text-xl font-semibold">
                        {formatUSD(
                          granularity === Granularity.Week
                            ? poolStats.fees1w
                            : poolStats.fees1d ?? 0,
                        )}{' '}
                        <span
                          className={classNames(
                            'text-xs',
                            poolStats[
                              granularity === Granularity.Week
                                ? 'feesChange1w'
                                : 'feesChange1d'
                            ] > 0
                              ? 'text-green'
                              : 'text-red',
                          )}
                        >
                          (
                          {poolStats[
                            granularity === Granularity.Week
                              ? 'feesChange1w'
                              : 'feesChange1d'
                          ].toFixed(2)}
                          %)
                        </span>
                      </div>
                    ) : (
                      <SkeletonText />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="py-4">
          <Separator />
        </div>
        <PoolRewardDistributionsCard pool={pool} />
        <PoolTransactionsV3 pool={pool} poolId={pool.address} />
      </div>
    </Container>
  )
}

export { PoolPageV3 }
