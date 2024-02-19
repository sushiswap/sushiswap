import { useDebounce } from '@sushiswap/hooks'
import { Card, CardHeader, CardTitle, DataTable } from '@sushiswap/ui'
import {
  ColumnDef,
  PaginationState,
  SortingState,
  TableState,
} from '@tanstack/react-table'
import React, { useCallback, useMemo, useState } from 'react'
import { useFarms } from 'utils/useFarms'
import { Pool, usePools } from 'utils/usePools'
import { usePoolFilters } from '../../PoolFiltersProvider'
import { NAME_COLUMN, TVL_COLUMN } from './Cells/columns'

const COLUMNS = [NAME_COLUMN, TVL_COLUMN] satisfies ColumnDef<Pool, unknown>[]

const CONTRACT_ADDRESS =
  process.env['NEXT_PUBLIC_SWAP_CONTRACT'] ||
  process.env['NEXT_PUBLIC_SWAP_CONTRACT']

export const PoolsTable = () => {
  const { tokenSymbols, farmsOnly } = usePoolFilters()
  const { data: pools, isLoading } = usePools()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'liquidityUSD', desc: true },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: farms } = useFarms()

  const farmFilter = useMemo(() => {
    return pools?.filter((pool) => {
      const lpAddress = pool.id
      const _isFarm = farms?.data?.lps.indexOf(
        `${CONTRACT_ADDRESS}::swap::LPToken<${lpAddress}>`,
      )
      return _isFarm !== -1
    })
  }, [pools, farms])

  const rowLink = useCallback((row: Pool) => {
    return `/pool/${row.id}`
  }, [])

  const data = useMemo(
    () =>
      !farmsOnly
        ? pools
            ?.flat()
            .filter((el) =>
              tokenSymbols.length > 0
                ? tokenSymbols.includes(
                    el.data.token_x_details.symbol.toLowerCase(),
                  ) ||
                  tokenSymbols.includes(
                    el.data.token_y_details.symbol.toLowerCase(),
                  )
                : true,
            ) || []
        : farmFilter?.flat() || [],
    [pools, farmsOnly, farmFilter, tokenSymbols],
  )

  const debouncedQuery = useDebounce(
    tokenSymbols.join(' ').trimStart().toLowerCase(),
    400,
  )

  const tableData = useMemo(() => {
    if (debouncedQuery.split(' ')[0] === '') return data
    return data.filter(
      (pool) =>
        debouncedQuery
          ?.split(' ')
          .includes(pool.data.token_x_details.symbol.toLowerCase()) ||
        debouncedQuery
          ?.split(' ')
          .includes(pool.data.token_y_details.symbol.toLowerCase()),
    )
  }, [debouncedQuery, data])

  const state: Partial<TableState> = useMemo(() => {
    return {
      sorting,
      pagination,
    }
  }, [sorting, pagination])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pools{' '}
          {tableData?.length ? (
            <span className="text-gray-400 dark:text-slate-500">
              ({tableData?.length})
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <DataTable
        state={state}
        onSortingChange={setSorting}
        onPaginationChange={setPagination}
        loading={!pools && isLoading}
        linkFormatter={rowLink}
        columns={COLUMNS}
        data={data}
        pagination={true}
      />
    </Card>
  )
}
