'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  DataTable,
  SkeletonText,
} from '@sushiswap/ui'
import { ColumnDef, SortingState, TableState } from '@tanstack/react-table'
import React, { useCallback, useMemo, useState } from 'react'
import { usePoolFilters } from 'src/ui/pool'
import { TopPool, useTopPools } from '~tron/_common/lib/hooks/useTopPools'
import {
  APR_COLUMN,
  FEES_1D_COLUMN,
  NAME_COLUMN,
  TRANSACTIONS_1D_COLUMN,
  TVL_COLUMN,
  VOLUME_1D_COLUMN,
} from './PoolColumns'

const COLUMNS = [
  NAME_COLUMN,
  TVL_COLUMN,
  VOLUME_1D_COLUMN,
  FEES_1D_COLUMN,
  TRANSACTIONS_1D_COLUMN,
  APR_COLUMN,
] satisfies ColumnDef<TopPool, unknown>[]

export const PoolsTable = () => {
  const { tokenSymbols, farmsOnly } = usePoolFilters()

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'liquidityUSD', desc: true },
  ])

  const { data: pools, isLoading } = useTopPools()

  const rowLink = useCallback((row: TopPool) => {
    return `/tron/pool/${row.token0Address}:${row.token1Address}:${row.address}`
  }, [])

  const filtered = useMemo(() => {
    if (!pools) return [] as TopPool[]

    return pools.filter((pool) => {
      if (farmsOnly) {
        if (!pool.isIncentivized) return false
      }

      if (tokenSymbols.length) {
        if (
          !tokenSymbols.every((symbol) => {
            symbol = symbol.toLowerCase()

            if (pool.name.toLowerCase().includes(symbol)) return true

            return false
          })
        ) {
          return false
        }
      }

      return true
    })
  }, [farmsOnly, tokenSymbols, pools])

  const state: Partial<TableState> = useMemo(() => {
    return {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: filtered?.length,
      },
    }
  }, [sorting, filtered])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isLoading ? (
            <div className="!w-28 !h-[18px]">
              <SkeletonText />
            </div>
          ) : (
            <span>
              Pools{' '}
              <span className="text-gray-400 dark:text-slate-500">
                ({filtered.length})
              </span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <DataTable
        state={state}
        onSortingChange={setSorting}
        loading={isLoading}
        linkFormatter={rowLink}
        columns={COLUMNS}
        data={filtered}
      />
    </Card>
  )
}
