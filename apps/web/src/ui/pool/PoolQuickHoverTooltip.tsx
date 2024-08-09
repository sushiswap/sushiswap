import { PlusIcon, UserCircleIcon } from '@heroicons/react-v1/solid'
import { V2Pool, V3Pool } from '@sushiswap/graph-client/data-api'

import { LinkInternal } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui'
import { List } from '@sushiswap/ui'
import React, { FC } from 'react'
import { incentiveRewardToToken } from 'src/lib/functions'
import { SushiSwapProtocol } from 'sushi'
import { ChainId } from 'sushi/chain'
import { formatNumber, formatPercent } from 'sushi/format'

interface PoolQuickHoverTooltipProps {
  row: V2Pool | V3Pool
}

export const PoolQuickHoverTooltip: FC<PoolQuickHoverTooltipProps> = ({
  row,
}) => {
  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-500 dark:text-slate-500">
          <span className="font-semibold text-gray-900 dark:text-slate-50">
            Total APR
          </span>{' '}
          • Rewards + Fees
        </span>
        <span className="text-3xl font-medium text-gray-900 dark:text-slate-50">
          {formatPercent(row.totalApr1d)}{' '}
          <span className="text-[10px] text-gray-500 dark:text-slate-500">
            {formatPercent(row.incentiveApr)} + {formatPercent(row.feeApr1d)}
          </span>
        </span>
      </div>
      <div className="flex gap-2">
        <Button icon={PlusIcon} asChild size="sm" variant="secondary">
          <LinkInternal
            href={
              row.protocol === SushiSwapProtocol.SUSHISWAP_V3
                ? `/${row.id}`
                : `/${row.id}/add`
            }
          >
            Deposit
          </LinkInternal>
        </Button>
        {row.protocol === SushiSwapProtocol.SUSHISWAP_V3 && (
          <Button icon={UserCircleIcon} asChild size="sm" variant="secondary">
            <LinkInternal href={`/pools/${row.id}`}>My Positions</LinkInternal>
          </Button>
        )}
      </div>

      {!!row?.incentives?.length && (
        <>
          <List className="!pt-5">
            <div className="flex justify-between">
              <List.Label>Reward Emission</List.Label>
              <List.Label>per day</List.Label>
            </div>
            <List.Control className="!bg-secondary">
              {row.incentives
                .filter((incentive) => incentive.rewardPerDay > 0)
                .map((incentive) => (
                  <List.Item
                    key={incentive.id}
                    icon={Currency.Icon}
                    iconProps={{
                      currency: incentiveRewardToToken(
                        row.chainId as ChainId,
                        incentive,
                      ),
                    }}
                    title={`${formatNumber(incentive.rewardPerDay)} ${
                      incentive.rewardToken.symbol
                    }`}
                  />
                ))}
            </List.Control>
          </List>
        </>
      )}
    </div>
  )
}
