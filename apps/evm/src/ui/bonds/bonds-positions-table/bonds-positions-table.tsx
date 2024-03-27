'use client'

import { BondChainId } from '@sushiswap/bonds-sdk'
import {
  BondPosition,
  GetBondsPositionsArgs,
  getBondsPositions,
  getBondsPositionsUrl,
} from '@sushiswap/client'
import { useIsMounted } from '@sushiswap/hooks'
import { Card, CardHeader, CardTitle, DataTable } from '@sushiswap/ui'
import { useAccount } from '@sushiswap/wagmi'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import React, { FC, useMemo, useState } from 'react'
import {
  CLAIM_COLUMN,
  MATURITY_COLUMN,
  PAYOUT_AMOUNT_COLUMN,
  PAYOUT_ASSET_COLUMN,
} from './bonds-positions-table-columns'

const COLUMNS = [
  PAYOUT_ASSET_COLUMN,
  PAYOUT_AMOUNT_COLUMN,
  MATURITY_COLUMN,
  CLAIM_COLUMN,
] satisfies ColumnDef<BondPosition, unknown>[]

interface PositionsTableProps {
  chainIds?: BondChainId[]
  payoutTokenId?: string // `${BondChainId}:0x${string}`
  onlyUnclaimedBonds?: boolean
}

export const BondsPositionsTable: FC<PositionsTableProps> = ({
  chainIds,
  payoutTokenId,
  onlyUnclaimedBonds,
}) => {
  const isMounted = useIsMounted()
  const { address } = useAccount()

  const args = useMemo<GetBondsPositionsArgs>(() => {
    if (!address) return undefined

    return {
      userAddress: address,
      chainIds,
      onlyUnclaimedBonds,
      payoutTokenId,
    }
  }, [address, chainIds, onlyUnclaimedBonds, payoutTokenId])

  const { data = [], isInitialLoading } = useQuery({
    queryKey: [getBondsPositionsUrl(args)],
    queryFn: () => getBondsPositions(args),
    refetchInterval: 15 * 1000,
    enabled: Boolean(args),
  })

  const [sortingState, setSortingState] = useState<SortingState>([
    { id: 'maturity', desc: false },
  ])

  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          My Bonds{' '}
          <span className="text-gray-400 dark:text-slate-500">
            ({data.length})
          </span>
        </CardTitle>
      </CardHeader>
      <DataTable
        loading={isInitialLoading || !isMounted}
        columns={COLUMNS}
        data={data}
        pagination={true}
        onPaginationChange={setPaginationState}
        onSortingChange={setSortingState}
        state={{
          sorting: sortingState,
          pagination: paginationState,
        }}
      />
    </Card>
  )
}
