import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkInternal,
  Separator,
  Stat,
  StatLabel,
  StatValue,
  classNames,
} from '@sushiswap/ui'
import { FC } from 'react'
import { formatPercent, formatUSD } from 'sushi/format'

import { VaultV1 } from '@sushiswap/graph-client/data-api'
import type { PoolWithFeeAprs, PoolWithIncentives } from 'sushi/types'
import { APRHoverCard } from '../APRHoverCard'
import { SteerAPRChart } from './SteerAPRChart'
import { SteerLiquidityDistributionWidget } from './SteerLiquidityDistributionWidget/SteerLiquidityDistributionWidget'
import { SteerStrategyConfig } from './constants'

interface SteerPoolCardProps {
  pool: PoolWithIncentives<PoolWithFeeAprs>
  vault: VaultV1
}

export const SteerPoolCard: FC<SteerPoolCardProps> = ({ pool, vault }) => {
  return (
    <LinkInternal
      href={`/${vault.chainId}/pool/v3/${vault.poolAddress}/smart/${vault.address}`}
    >
      <Card
        className={classNames(
          'max-w-[400px] hover:border-blue-300 hover:shadow-md',
        )}
      >
        <CardHeader>
          <CardTitle>{SteerStrategyConfig[vault.strategy].name}</CardTitle>
          <CardDescription>
            {SteerStrategyConfig[vault.strategy].description}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <Stat className="!p-0">
            <StatLabel size="sm">Weekly APR</StatLabel>
            <StatValue size="sm">
              <APRHoverCard pool={pool} smartPoolAPR={vault.apr}>
                <span className="underline decoration-dotted underline-offset-2">
                  {formatPercent(vault.apr + pool.incentiveApr)}
                </span>
              </APRHoverCard>
            </StatValue>
          </Stat>
          <div className="h-[200px] rounded-xl flex items-center justify-center">
            {!vault.isDeprecated ? (
              <SteerAPRChart vault={vault} />
            ) : (
              <div className="text-center text-red dark:text-red-600">
                <div className=" font-medium">This vault is deprecated.</div>
                <div className="text-sm">
                  It might not accrue any fees and won{"'"}t be readjusted.
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <Separator />
        <div className="grid grid-cols-2 divide-x divide-accent">
          <Stat className="px-6 py-4">
            <StatLabel size="sm">TVL</StatLabel>
            <StatValue size="sm">{formatUSD(vault.reserveUSD)}</StatValue>
          </Stat>
          <Stat className="px-6 py-4">
            <StatLabel size="sm">Total Fees</StatLabel>
            <StatValue size="sm">{formatUSD(vault.feesUSD)}</StatValue>
          </Stat>
        </div>
        <Separator />
        <CardContent className="pt-6">
          <SteerLiquidityDistributionWidget vault={vault} />
        </CardContent>
      </Card>
    </LinkInternal>
  )
}
