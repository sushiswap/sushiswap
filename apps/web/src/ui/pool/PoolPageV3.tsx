'use client'

import { V3Pool } from '@sushiswap/graph-client/data-api'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
  Container,
  LinkInternal,
  Message,
  Separator,
  SkeletonText,
  classNames,
} from '@sushiswap/ui'
import { FC } from 'react'
import { useTokenAmountDollarValues } from 'src/lib/hooks'
import { useConcentratedLiquidityPoolStats } from 'src/lib/hooks/react-query'
import { useConcentratedLiquidityPoolReserves } from 'src/lib/wagmi/hooks/pools/hooks/useConcentratedLiquidityPoolReserves'
import { ChainKey } from 'sushi'
import { formatUSD } from 'sushi/format'
import { ConcentratedLiquidityProvider } from './ConcentratedLiquidityProvider'
import { PoolRewardDistributionsCard } from './PoolRewardDistributionsCard'
import { PoolTransactionsV3 } from './PoolTransactionsV3'
import { StatisticsChartsV3 } from './StatisticsChartV3'

const PoolPageV3: FC<{ pool: V3Pool }> = ({ pool }) => {
  return (
    <ConcentratedLiquidityProvider>
      <Pool pool={pool} />
    </ConcentratedLiquidityProvider>
  )
}

const Pool: FC<{ pool: V3Pool }> = ({ pool }) => {
  const { chainId, address } = pool

  const { data: poolStats } = useConcentratedLiquidityPoolStats({
    chainId,
    address,
  })

  const { data: reserves, isLoading: isReservesLoading } =
    useConcentratedLiquidityPoolReserves({
      pool,
      chainId,
    })
  const fiatValues = useTokenAmountDollarValues({ chainId, amounts: reserves })

  return (
    <Container maxWidth="5xl" className="flex flex-col gap-4 px-4">
      {pool.hasEnabledSteerVault && (
        <Message variant="info" size="sm" className="mb-4">
          {`This pool has been activated to leverage our smart pool feature. Smart pools are designed to optimize the
        allocation of liquidity within customized price ranges, thereby improving trading efficiency. They achieve
        this by enhancing liquidity depth around the current price, which results in higher fee earnings for liquidity
        providers (LPs) and allows the market to dictate the distribution of LPs' positions based on rational
        decisions.`}{' '}
          To create a smart pool position, click{' '}
          <LinkInternal
            shallow={true}
            href={`/${ChainKey[chainId]}/pool/v3/${address}/smart`}
            className="underline"
          >
            here
          </LinkInternal>
        </Message>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatisticsChartsV3 address={address} chainId={chainId} pool={pool} />
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Liquidity</CardTitle>
              <CardDescription>
                {formatUSD(fiatValues[0] + fiatValues[1])}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CardGroup>
                <CardLabel>Tokens</CardLabel>
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
              </CardGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex flex-col md:flex-row justify-between gap-y-4">
                  Statistics
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <CardLabel>Volume (24h)</CardLabel>
                  {poolStats ? (
                    <div className="text-xl font-semibold">
                      {formatUSD(poolStats.volumeUSD1d ?? 0)}{' '}
                      <span
                        className={classNames(
                          'text-xs',
                          poolStats['volumeUSD1dChange'] > 0
                            ? 'text-green'
                            : 'text-red',
                        )}
                      >
                        ({poolStats['volumeUSD1dChange'].toFixed(2)}
                        %)
                      </span>
                    </div>
                  ) : (
                    <SkeletonText />
                  )}
                </div>
                <div>
                  <CardLabel>Fees (24h)</CardLabel>
                  {poolStats ? (
                    <div className="text-xl font-semibold">
                      {formatUSD(poolStats.feesUSD1d ?? 0)}{' '}
                      <span
                        className={classNames(
                          'text-xs',
                          poolStats['feesUSD1dChange'] > 0
                            ? 'text-green'
                            : 'text-red',
                        )}
                      >
                        ({poolStats['feesUSD1dChange'].toFixed(2)}
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
      <PoolTransactionsV3 pool={pool} poolAddress={address} />
    </Container>
  )
}

export { PoolPageV3 }
