'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { SortingState, TableState } from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo, useState, useTransition } from 'react'

import { DataTable } from '@sushiswap/ui'
import { formatNumber } from '../../../lib/governance-dashboard'
import { FilterButton } from '../../../ui/governance-dashboard/FilterButton'
import {
  MONTHLY_CHANGE_COLUMN,
  NAME_COLUMN,
  OWNERSHIP_COLUMN,
  QUANTITY_COLUMN,
  RANK_COLUMN,
  VALUE_COLUMN,
} from './columns'
import { TokenHolder } from './types'

const BALANCE_FILTER = {
  key: 'balanceFilter',
  options: [1, 1_000, 10_000, 100_000],
}
const ORDER_DIRECTION_KEY = 'orderDirection'
const PAGE_KEY = 'page'

const COLUMNS = [
  RANK_COLUMN,
  NAME_COLUMN,
  QUANTITY_COLUMN,
  OWNERSHIP_COLUMN,
  VALUE_COLUMN,
  MONTHLY_CHANGE_COLUMN,
]

export function TokenHoldersTable({
  users,
  userCount,
}: { users: TokenHolder[]; userCount: number }) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams ?? '')
  const page = params.get(PAGE_KEY) ? Number(params.get(PAGE_KEY)) : 1
  const maxUserCountReached = userCount === 1000

  function filterBalance(balance: number) {
    if (balance === Number(params.get(BALANCE_FILTER.key))) {
      params.delete(BALANCE_FILTER.key)
    } else {
      params.set(BALANCE_FILTER.key, balance.toString())
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`)
    })
  }

  function setPage(page: number) {
    params.set(PAGE_KEY, page.toString())

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`)
    })
  }

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'quantity', desc: params.get(ORDER_DIRECTION_KEY) !== 'asc' },
  ])

  const state: Partial<TableState> = useMemo(() => {
    return {
      sorting,
    }
  }, [sorting])

  console.log('data', users)

  return (
    <div className="space-y-8">
      <h2 className="pl-1 text-2xl font-bold text-slate-900 dark:text-slate-200">
        All Holders
      </h2>
      <div className="space-y-6">
        <div className="flex gap-2">
          {BALANCE_FILTER.options.map((filter) => (
            <FilterButton
              onClick={() => filterBalance(filter)}
              isActive={Number(params.get(BALANCE_FILTER.key)) === filter}
              key={filter}
            >
              {`>=${formatNumber(filter)}`}{' '}
              <span className="hidden md:inline">$SUSHI</span>
            </FilterButton>
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-[#1A2031]">
          <DataTable
            state={state}
            onSortingChange={setSorting}
            loading={isPending}
            columns={COLUMNS}
            data={users}
          />
        </div>
        <div className="flex justify-between items-center text-sm pr-1">
          <div className="grid grid-cols-[repeat(5,minmax(24px,min-content))] items-center place-items-center">
            <button
              className="rounded p-1 transition-colors ease-in-out enabled:hover:bg-black/[0.12] disabled:text-slate-500 enabled:hover:dark:bg-white/[0.12]"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeftIcon className="h-3 w-3" strokeWidth={3} />
            </button>
            <span>{page}</span>
            <span>/</span>
            <span>
              {Math.ceil(userCount / 10)}
              {maxUserCountReached && '+'}
            </span>
            <button
              className="rounded p-1 transition-colors ease-in-out enabled:hover:bg-black/[0.12] disabled:text-slate-500 enabled:hover:dark:bg-white/[0.12]"
              onClick={() => setPage(page + 1)}
              disabled={page === Math.ceil(userCount / 10)}
            >
              <ChevronRightIcon className="h-3 w-3" strokeWidth={3} />
            </button>
          </div>
          <div>
            <span>{(page - 1) * 10 + 1}</span> - <span>{page * 10}</span> of{' '}
            <span>
              {userCount}
              {maxUserCountReached && '+'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
