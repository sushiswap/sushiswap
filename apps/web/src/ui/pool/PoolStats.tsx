'use client'

import { V2Pool } from '@sushiswap/graph-client/data-api'
import {
  Card,
  CardContent,
  CardHeader,
  CardLabel,
  CardTitle,
  classNames,
} from '@sushiswap/ui'
import { FC } from 'react'
import { formatNumber, formatPercent, formatUSD } from 'sushi/format'

interface PoolStats {
  pool: V2Pool
}

export const PoolStats: FC<PoolStats> = ({ pool }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <CardLabel>Liquidity</CardLabel>
            {pool ? (
              <div className="text-xl font-semibold">
                {formatUSD(pool.liquidityUSD ?? 0)}{' '}
                <span
                  className={classNames(
                    'text-xs',
                    pool.liquidityUSD1dChange > 0 ? 'text-green' : 'text-red',
                  )}
                >
                  {pool.liquidityUSD1dChange > 0 ? '+' : '-'}
                  {formatPercent(Math.abs(pool.liquidityUSD1dChange))}
                </span>
              </div>
            ) : null}
          </div>
          <div>
            <CardLabel>Volume (24h)</CardLabel>
            {pool ? (
              <div className="text-xl font-semibold">
                {formatUSD(pool.volumeUSD1d ?? 0)}{' '}
                <span
                  className={classNames(
                    'text-xs',
                    pool.volumeUSD1dChange > 0 ? 'text-green' : 'text-red',
                  )}
                >
                  {pool.volumeUSD1dChange > 0 ? '+' : '-'}
                  {formatPercent(Math.abs(pool.volumeUSD1dChange))}
                </span>
              </div>
            ) : null}
          </div>
          <div>
            <CardLabel>Fees (24h)</CardLabel>
            {pool ? (
              <div className="text-xl font-semibold">
                {formatUSD(pool.feesUSD1d ?? 0)}{' '}
                <span
                  className={classNames(
                    'text-xs',
                    pool.feesUSD1dChange > 0 ? 'text-green' : 'text-red',
                  )}
                >
                  {pool.feesUSD1dChange > 0 ? '+' : '-'}
                  {formatPercent(Math.abs(pool.feesUSD1dChange))}
                </span>
              </div>
            ) : null}
          </div>
          <div>
            <CardLabel>Transactions (24h)</CardLabel>
            {pool ? (
              <div className="text-xl font-semibold">
                {formatNumber(pool.txCount1d).replace('.00', '')}{' '}
                <span
                  className={classNames(
                    'text-xs',
                    pool.txCount1dChange > 0 ? 'text-green' : 'text-red',
                  )}
                >
                  {pool.txCount1dChange > 0 ? '+' : '-'}
                  {formatPercent(Math.abs(pool.txCount1dChange))}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
