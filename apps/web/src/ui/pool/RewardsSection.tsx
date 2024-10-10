'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  Container,
  DataTable,
} from '@sushiswap/ui'
import { Carousel } from '@sushiswap/ui'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import React, { FC, useCallback, useMemo, useState } from 'react'
import {
  AngleRewardsPool,
  useAngleRewardsMultipleChains,
} from 'src/lib/hooks/react-query'
import { MERKL_SUPPORTED_CHAIN_IDS } from 'sushi/config'

import { useAccount } from 'wagmi'
import { useSidebar } from '../sidebar'
import { usePoolFilters } from './PoolsFiltersProvider'
import { RewardSlide, RewardSlideSkeleton } from './RewardSlide'
import {
  REWARDS_V3_APR_COLUMN,
  REWARDS_V3_CLAIMABLE_COLUMN,
  REWARDS_V3_NAME_COLUMN,
  REWARDS_V3_POSITION_SIZE_COLUMN,
} from './columns'

const COLUMNS = [
  REWARDS_V3_NAME_COLUMN,
  REWARDS_V3_POSITION_SIZE_COLUMN,
  REWARDS_V3_CLAIMABLE_COLUMN,
  REWARDS_V3_APR_COLUMN,
] satisfies ColumnDef<AngleRewardsPool, unknown>[]

export const RewardsSection: FC = () => {
  const { address } = useAccount()
  const { tokenSymbols } = usePoolFilters()
  const { data, isInitialLoading } = useAngleRewardsMultipleChains({
    chainIds: MERKL_SUPPORTED_CHAIN_IDS,
    account: address,
  })

  const { isOpen: isSidebarOpen } = useSidebar()

  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const chainsSorted = useMemo(() => {
    if (!data) return undefined
    return data.sort((a, b) => {
      const aAmount = a.unclaimed.reduce((acc, cur) => acc + cur.amountUSD, 0)
      const bAmount = b.unclaimed.reduce((acc, cur) => acc + cur.amountUSD, 0)

      return bAmount - aAmount
    })
  }, [data])

  const positions = useMemo(() => {
    const _tokenSymbols = tokenSymbols?.filter((el) => el !== '') || []
    return (data ?? []).flatMap((el) => {
      return Object.values(el.pools ?? {})
        .filter(
          (el) =>
            (el?.userBalanceToken0 ?? 0) + (el?.userBalanceToken1 ?? 0) > 0 ||
            Object.keys(el.rewardsPerToken).length > 0,
        )
        .filter((el) =>
          _tokenSymbols.length > 0
            ? _tokenSymbols.some((symbol) => {
                return [el.token0.symbol, el.token1.symbol].includes(
                  symbol.toUpperCase(),
                )
              })
            : true,
        )
    })
  }, [tokenSymbols, data])

  const rowLink = useCallback((row: AngleRewardsPool) => {
    return `/pool/${row.id}`
  }, [])

  return (
    <>
      <div className="pl-4">
        <Carousel<NonNullable<typeof chainsSorted>[0] | number>
          containerWidth={isSidebarOpen ? 1504 : 1280}
          slides={chainsSorted || MERKL_SUPPORTED_CHAIN_IDS}
          render={(row) =>
            typeof row === 'number' ? (
              <RewardSlideSkeleton />
            ) : (
              <RewardSlide data={row} address={address} />
            )
          }
          className="!pt-0 px-2"
        />
      </div>
      <Container maxWidth="7xl" className="px-4 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              My Rewards{' '}
              <span className="text-gray-400 dark:text-slate-500">
                ({positions.length})
              </span>
            </CardTitle>
          </CardHeader>
          <DataTable
            linkFormatter={rowLink}
            loading={isInitialLoading}
            columns={COLUMNS}
            data={positions}
            pagination={true}
            onPaginationChange={setPaginationState}
            state={{
              pagination: paginationState,
            }}
          />
        </Card>
      </Container>
    </>
  )
}
