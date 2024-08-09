import { Card, CardHeader, CardTitle, DataTable, Slot } from '@sushiswap/ui'
import { DisplayColumnDef, PaginationState, Row } from '@tanstack/react-table'
import { FC, ReactNode, useCallback, useMemo, useState } from 'react'
import { useSushiV2UserPositions } from 'src/lib/hooks'

import { V2Position } from '@sushiswap/graph-client/data-api'
import { ChainId } from 'sushi'
import { useAccount } from 'wagmi'
import { APR_COLUMN, NAME_COLUMN_POOL, VALUE_COLUMN } from './columns'

// ! Column types have to be checked manually
const COLUMNS = [
  NAME_COLUMN_POOL,
  VALUE_COLUMN,
  APR_COLUMN,
] as DisplayColumnDef<V2Position, unknown>[]

interface PositionsTableProps {
  chainId: ChainId
  onRowClick?(row: V2Position): void
  rowLink?(row: V2Position): string
}

const tableState = { sorting: [{ id: 'value', desc: true }] }

export const PositionsTable: FC<PositionsTableProps> = ({
  chainId,
  onRowClick,
  rowLink,
}) => {
  const { address } = useAccount()
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: positions, isLoading } = useSushiV2UserPositions({
    user: address,
    chainId,
  })

  const _positions = useMemo(() => {
    if (!positions) return []
    return positions
  }, [positions])

  const rowRenderer = useCallback(
    (row: Row<V2Position>, rowNode: ReactNode) => {
      if (onRowClick)
        return (
          <Slot
            className="cursor-pointer"
            onClick={() => onRowClick?.(row.original)}
          >
            {rowNode}
          </Slot>
        )
      return rowNode
    },
    [onRowClick],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          My Positions{' '}
          <span className="text-gray-400 dark:text-slate-500">
            ({positions?.length ?? 0})
          </span>
        </CardTitle>
      </CardHeader>
      <DataTable
        loading={isLoading}
        rowRenderer={rowRenderer}
        linkFormatter={rowLink}
        columns={COLUMNS}
        data={_positions}
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
