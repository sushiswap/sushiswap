'use client'

import { Card, CardHeader, CardTitle, DataTable } from '@sushiswap/ui'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'

import { STEER_ENABLED_NETWORKS } from '@sushiswap/graph-config'
import {
  SkeletonText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@sushiswap/ui'
import { useAccount, useSteerAccountPositionsExtended } from '@sushiswap/wagmi'
import { formatPercent } from 'sushi'
import { APRHoverCard } from './APRHoverCard'
import {
  STEER_NAME_COLUMN,
  STEER_POSITION_SIZE_COLUMN,
  STEER_STRATEGY_COLUMN,
} from './ConcentratedPositionsTable/Tables/Smart/columns'
import { SteerPosition } from './ConcentratedPositionsTable/Tables/Smart/useSteerPositions'
import { usePoolFilters } from './PoolsFiltersProvider'

const COLUMNS = [
  STEER_NAME_COLUMN,
  STEER_STRATEGY_COLUMN,
  STEER_POSITION_SIZE_COLUMN,
  {
    id: 'totalApr1d',
    header: 'APR (24h)',
    accessorFn: (row) =>
      row.vault.apr1d * 100 +
      row.vault.pool.incentives
        .filter((el) => +el.rewardPerDay > 0)
        .reduce((acc, cur) => acc + cur.apr * 100, 0),
    cell: (props) => {
      const totalAPR =
        props.row.original.vault.apr1d * 100 +
        props.row.original.vault.pool.incentives
          .filter((el) => +el.rewardPerDay > 0)
          .reduce((acc, cur) => acc + cur.apr * 100, 0)

      return (
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="line-through text-muted-foreground">
                  {formatPercent(props.row.original.vault.pool.totalApr1d)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>APR when not staked within the vault.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <APRHoverCard
            pool={props.row.original.vault.pool}
            smartPoolAPR={props.row.original.vault.apr1d}
          >
            <span className="underline decoration-dotted underline-offset-2">
              {formatPercent(totalAPR / 100)}
            </span>
          </APRHoverCard>
        </div>
      )
    },
    meta: {
      skeleton: <SkeletonText fontSize="lg" />,
    },
  },
] satisfies ColumnDef<SteerPosition, unknown>[]

const tableState = { sorting: [{ id: 'positionSize', desc: true }] }

export const SmartPositionsTable = () => {
  const { address } = useAccount()
  const { chainIds } = usePoolFilters()
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: positions, isLoading } = useSteerAccountPositionsExtended({
    account: address,
    chainIds: chainIds ? chainIds : [...STEER_ENABLED_NETWORKS],
  })

  const _positions = useMemo(() => (positions ? positions : []), [positions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          My Positions{' '}
          <span className="text-gray-400 dark:text-slate-500">
            ({_positions?.length})
          </span>
        </CardTitle>
      </CardHeader>
      <DataTable
        loading={isLoading}
        linkFormatter={(row) =>
          `/pool/${row.vault.pool.id}/smart/${row.vault.id}`
        }
        columns={COLUMNS}
        data={_positions as SteerPosition[]}
        pagination={true}
        onPaginationChange={setPaginationState}
        state={{
          ...tableState,
          pagination: paginationState,
        }}
      />
    </Card>
  )
}
