'use client'

import { PlusIcon } from '@heroicons/react/20/solid'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  DataTable,
  LinkInternal,
} from '@sushiswap/ui'
import { PaginationState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { usePoolFilters } from 'src/ui/pool'
import { useMyPositions } from '~tron/_common/lib/hooks/useMyPositions'
import { IMyPositionData } from '~tron/_common/types/get-pools-type'
import { IToken } from '~tron/_common/types/token-type'
import {
  POSITION_NAME_COLUMN,
  SIZE_COLUMN,
  TVL_COLUMN,
} from './PositionColumns'

type PositionsTableProps = {
  hideNewPositionButton?: boolean
}

export type IPositionRowData = {
  token0: IToken
  token1: IToken
  pairAddress: string
  reserve0: string
  reserve1: string
}

export const PositionsTable = ({
  hideNewPositionButton,
}: PositionsTableProps) => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const { tokenSymbols } = usePoolFilters()
  const { data, isLoading } = useMyPositions()

  const filteredData = useMemo(() => {
    if (!data) return []
    if (!tokenSymbols.length) return data
    const queries = tokenSymbols.map((symbol) =>
      symbol.toLowerCase()?.replaceAll(' ', ''),
    )

    return data.filter((pool) => {
      const poolValues = [
        pool.pairAddress,
        pool.token0?.address,
        pool.token1?.address,
        pool.token0?.symbol,
        pool.token1?.symbol,
        pool.token0?.name,
        pool.token1?.name,
      ]

      return poolValues.some((value) =>
        queries.some((query) => value?.toLowerCase().includes(query)),
      )
    })
  }, [data, tokenSymbols])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span>
              My Positions{' '}
              <span className="text-gray-400 dark:text-slate-500">
                ({filteredData.length})
              </span>
            </span>
            <div className="flex gap-4">
              {!hideNewPositionButton ? (
                <LinkInternal shallow={true} href={`/tron/pool/add`}>
                  <Button icon={PlusIcon} asChild size="sm">
                    Create position
                  </Button>
                </LinkInternal>
              ) : null}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <DataTable
        loading={isLoading}
        data={
          filteredData?.map((pool) => ({
            token0: pool?.token0,
            token1: pool?.token1,
            pairAddress: pool?.pairAddress,
            reserve0: pool?.reserve0,
            reserve1: pool?.reserve1,
          })) ?? []
        }
        columns={[POSITION_NAME_COLUMN, TVL_COLUMN, SIZE_COLUMN]}
        linkFormatter={(data: IMyPositionData) => {
          const token0 = data?.token0?.address
          const token1 = data?.token1?.address
          return `/tron/pool/${token0}:${token1}:${data?.pairAddress}`
        }}
        externalLink={false}
        pagination={true}
        state={{
          pagination: paginationState,
        }}
        onPaginationChange={setPaginationState}
      />
    </Card>
  )
}
