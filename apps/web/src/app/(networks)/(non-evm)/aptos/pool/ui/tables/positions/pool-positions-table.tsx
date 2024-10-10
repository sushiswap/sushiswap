import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Card, CardHeader, CardTitle, DataTable } from '@sushiswap/ui'
import { PaginationState } from '@tanstack/react-table'
import { ColumnDef, SortingState, TableState } from '@tanstack/react-table'
import React, { useCallback, useMemo, useState } from 'react'
import { usePoolFilters } from 'src/ui/pool'
import { PoolExtended } from '~aptos/pool/lib/use-pools-extended'
import { useUserPositionPools } from '~aptos/pool/lib/use-user-position-pools'
import { MYPOSITION_TVL_COLUMN, NAME_COLUMN, TVL_COLUMN } from './columns'

const COLUMNS = [
  NAME_COLUMN,
  TVL_COLUMN,
  MYPOSITION_TVL_COLUMN,
] satisfies ColumnDef<PoolExtended, unknown>[]

export const PositionsTable = () => {
  const { tokenSymbols } = usePoolFilters()
  const { account } = useWallet()
  const { data: pools, isLoading } = useUserPositionPools(
    account?.address as string,
    true,
  )

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'reserveUSD', desc: true },
  ])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const filtered = useMemo(() => {
    if (!pools) return []

    return pools?.filter((position) => {
      if (tokenSymbols.length) {
        if (
          !tokenSymbols.every((symbol) => {
            symbol = symbol.toLowerCase()

            if (position.token0.symbol.toLowerCase().includes(symbol)) {
              return true
            }

            if (position.token1.symbol.toLowerCase().includes(symbol)) {
              return true
            }

            return false
          })
        ) {
          return false
        }
      }

      return true
    })
  }, [pools, tokenSymbols])

  const rowLink = useCallback((row: PoolExtended) => {
    return `/aptos/pool/v2/${row.id}`
  }, [])

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
          My Positions{' '}
          {filtered.length ? (
            <span className="text-gray-400 dark:text-slate-500">
              ({filtered.length})
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <DataTable
        state={state}
        onSortingChange={setSorting}
        onPaginationChange={setPagination}
        loading={isLoading}
        linkFormatter={rowLink}
        columns={COLUMNS}
        data={filtered}
        pagination={true}
      />
    </Card>
  )
}
