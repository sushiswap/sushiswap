'use client'

import { Slot } from '@radix-ui/react-slot'
import { DataTable } from '@sushiswap/ui'
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table'
import React, { FC, ReactNode, useCallback, useState } from 'react'
import { ChainId } from 'sushi/chain'

import { ConcentratedLiquidityPositionWithV3Pool } from '@sushiswap/wagmi'
import { Address } from 'viem'
import {
  NAME_COLUMN_V3,
  POSITION_SIZE_CELL,
  POSITION_UNCLAIMED_CELL,
  PRICE_RANGE_COLUMN,
} from '../../../columns'
import { useManualPositions } from './useManualPositions'

const COLUMNS = [
  NAME_COLUMN_V3,
  PRICE_RANGE_COLUMN,
  POSITION_SIZE_CELL,
  POSITION_UNCLAIMED_CELL,
] satisfies ColumnDef<ConcentratedLiquidityPositionWithV3Pool, unknown>[]

const tableState = { sorting: [{ id: 'positionSize', desc: true }] }

interface Manual {
  chainId?: ChainId
  poolAddress?: Address
  onRowClick?(row: ConcentratedLiquidityPositionWithV3Pool): void
}

export const Manual: FC<Manual> = ({ chainId, poolAddress, onRowClick }) => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const rowRenderer = useCallback(
    (row: Row<ConcentratedLiquidityPositionWithV3Pool>, rowNode: ReactNode) => {
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

  const { data, isInitialLoading } = useManualPositions({
    chainId,
    poolAddress,
  })

  return (
    <DataTable
      testId="concentrated-positions"
      loading={isInitialLoading}
      linkFormatter={(row) =>
        `/pool/${row.chainId}:${
          row.address
        }/positions/${row.tokenId.toString()}`
      }
      rowRenderer={rowRenderer}
      columns={COLUMNS}
      data={data}
      pagination={true}
      onPaginationChange={setPaginationState}
      state={{
        ...tableState,
        pagination: paginationState,
      }}
    />
  )
}
