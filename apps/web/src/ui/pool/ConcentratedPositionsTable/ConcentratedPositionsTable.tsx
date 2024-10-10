'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  DataTable,
  LinkInternal,
  Switch,
} from '@sushiswap/ui'
import { Slot } from '@sushiswap/ui'
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table'
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react'
import { useConcentratedLiquidityPositions } from 'src/lib/wagmi/hooks/positions/hooks/useConcentratedLiquidityPositions'
import { ConcentratedLiquidityPositionWithV3Pool } from 'src/lib/wagmi/hooks/positions/types'
import { ChainId, ChainKey } from 'sushi'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { useAccount } from 'wagmi'
import { usePoolFilters } from '../PoolsFiltersProvider'
import {
  NAME_COLUMN_V3,
  POSITION_SIZE_CELL,
  POSITION_UNCLAIMED_CELL,
  PRICE_RANGE_COLUMN,
} from '../columns'

const COLUMNS = [
  NAME_COLUMN_V3,
  PRICE_RANGE_COLUMN,
  POSITION_SIZE_CELL,
  POSITION_UNCLAIMED_CELL,
] satisfies ColumnDef<ConcentratedLiquidityPositionWithV3Pool, unknown>[]

const tableState = { sorting: [{ id: 'positionSize', desc: true }] }

interface ConcentratedPositionsTableProps {
  chainId: ChainId
  poolAddress?: string
  onRowClick?(row: ConcentratedLiquidityPositionWithV3Pool): void
  hideNewSmartPositionButton?: boolean
  hideNewPositionButton?: boolean
}

export const ConcentratedPositionsTable: FC<ConcentratedPositionsTableProps> =
  ({
    chainId,
    onRowClick,
    poolAddress,
    hideNewSmartPositionButton = true,
    hideNewPositionButton = false,
  }) => {
    const { address } = useAccount()
    const { tokenSymbols } = usePoolFilters()
    const [hide, setHide] = useState(true)

    const chainIds = useMemo(() => {
      return isSushiSwapV3ChainId(chainId) ? [chainId] : []
    }, [chainId])

    const [paginationState, setPaginationState] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

    const { data: positions, isInitialLoading } =
      useConcentratedLiquidityPositions({
        account: address,
        chainIds,
      })

    const _positions = useMemo(() => {
      const _tokenSymbols = tokenSymbols?.filter((el) => el !== '') || []
      return (positions || [])
        .filter((el) =>
          _tokenSymbols.length > 0
            ? _tokenSymbols.some((symbol) => {
                return [
                  el.pool?.token0.symbol,
                  el.pool?.token1.symbol,
                ].includes(symbol.toUpperCase())
              })
            : true,
        )
        .filter((el) => {
          return (
            (hide ? el.liquidity !== 0n : true) &&
            (poolAddress
              ? el.address.toLowerCase() === poolAddress.toLowerCase()
              : true)
          )
        })
    }, [tokenSymbols, positions, hide, poolAddress])

    const rowRenderer = useCallback(
      (
        row: Row<ConcentratedLiquidityPositionWithV3Pool>,
        rowNode: ReactNode,
      ) => {
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="flex-grow whitespace-nowrap">
                My Positions{' '}
                <span className="text-gray-400 dark:text-slate-500">
                  ({_positions.length})
                </span>
              </span>
              <div className="flex gap-3 items-center whitespace-nowrap">
                <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                  Hide closed
                </span>
                <Switch
                  checked={hide}
                  onCheckedChange={() => setHide((prev) => !prev)}
                />
              </div>
              {!hideNewSmartPositionButton ? (
                <LinkInternal
                  shallow={true}
                  href={`/${ChainKey[chainId]}/pool/v3/${poolAddress}/smart`}
                  className="basis-full md:basis-[unset]"
                >
                  <Button
                    icon={PlusIcon}
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Create smart position
                  </Button>
                </LinkInternal>
              ) : null}
              {!hideNewPositionButton ? (
                <LinkInternal
                  shallow={true}
                  href={`/${ChainKey[chainId]}/pool/v3/${poolAddress}/create`}
                  className="basis-full md:basis-[unset]"
                >
                  <Button icon={PlusIcon} asChild size="sm" className="w-full">
                    Create position
                  </Button>
                </LinkInternal>
              ) : null}
            </div>
          </CardTitle>
        </CardHeader>
        <DataTable
          testId="concentrated-positions"
          loading={isInitialLoading}
          linkFormatter={(row) =>
            `/${row.chainId}/pool/v3/${row.address}/${row.tokenId.toString()}`
          }
          rowRenderer={rowRenderer}
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
