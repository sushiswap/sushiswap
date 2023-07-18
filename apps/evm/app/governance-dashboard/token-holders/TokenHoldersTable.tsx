'use client'

import { ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { shortenAddress } from '@sushiswap/format'
import { SkeletonText } from '@sushiswap/ui/components/skeleton'
import { GenericTable } from '@sushiswap/ui/components/table/GenericTable'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortDirection,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useTransition } from 'react'

import { FilterButton } from '../components/FilterButton'
import { formatNumber } from '../lib'
import { tokenHolderNames } from './tokenHolderNames'

type TokenHolder = {
  id: string
  rank: number
  address: string
  quantity: number
  ownership: number
  value: number
  change30d: number
}

const columnHelper = createColumnHelper<TokenHolder>()

const BALANCE_FILTER = {
  key: 'balanceFilter',
  options: [1, 1_000, 10_000, 100_000],
}
const ORDER_DIRECTION_KEY = 'orderDirection'
const PAGE_KEY = 'page'

function isCustomName(address: string): address is keyof typeof tokenHolderNames {
  return address in tokenHolderNames
}

export function TokenHoldersTable({ users, userCount }: { users: TokenHolder[]; userCount: number }) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams ?? '')
  const page = params.get(PAGE_KEY) ? Number(params.get(PAGE_KEY)) : 1
  const maxUserCountReached = userCount === 1000

  function sortColumn(direction: false | SortDirection) {
    params.set(ORDER_DIRECTION_KEY, direction === 'desc' ? 'asc' : 'desc')

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`)
    })
  }

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

  const [columns] = useState([
    columnHelper.accessor('rank', {
      header: 'Rank',
      cell: (info) => <span className="text-slate-600 dark:text-slate-300">{info.getValue()}</span>,
      size: 40,
      enableSorting: false,
      meta: { skeleton: <SkeletonText /> },
    }),
    columnHelper.accessor('address', {
      header: 'Name',
      cell: (info) => {
        const address = info.getValue()
        return (
          <a href={`https://etherscan.io/address/${address}`} className="gap-2 font-bold flex items-center">
            {isCustomName(address) ? tokenHolderNames[address] : shortenAddress(address)}
            <ArrowTopRightOnSquareIcon className="mb-0.5 h-4 w-4" strokeWidth={2.5} />
          </a>
        )
      },
      minSize: 240,
      enableSorting: false,
      meta: { skeleton: <SkeletonText /> },
    }),
    columnHelper.accessor('quantity', {
      header: (h) => <div onClick={() => sortColumn(h.column.getIsSorted())}>Quantity</div>,
      cell: (info) => (
        <span className="text-slate-600 dark:text-slate-300">
          {info.getValue().toLocaleString('EN', {
            maximumFractionDigits: 0,
          })}
        </span>
      ),
      meta: { skeleton: <SkeletonText /> },
      size: 100,
    }),
    columnHelper.accessor('ownership', {
      header: (h) => <div onClick={() => sortColumn(h.column.getIsSorted())}>Ownership</div>,
      cell: (info) => (
        <span className="text-slate-600 dark:text-slate-300">
          {info.getValue().toLocaleString('EN', {
            maximumFractionDigits: 2,
            style: 'percent',
          })}
        </span>
      ),
      meta: { skeleton: <SkeletonText /> },
      size: 60,
    }),
    columnHelper.accessor('value', {
      header: (h) => <div onClick={() => sortColumn(h.column.getIsSorted())}>Value</div>,
      cell: (info) =>
        info.getValue().toLocaleString('EN', {
          maximumFractionDigits: 0,
          style: 'currency',
          currency: 'USD',
        }),
      meta: { skeleton: <SkeletonText /> },
      size: 110,
    }),
    columnHelper.accessor('change30d', {
      header: 'Change (30d)',
      cell: (info) => {
        const change = info.getValue()
        const color = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-700 dark:text-gray-50'
        return (
          <span className={color}>
            {change.toLocaleString('EN', {
              maximumFractionDigits: 2,
              style: 'percent',
            })}
          </span>
        )
      },
      meta: { skeleton: <SkeletonText /> },
      enableSorting: false,
      size: 60,
    }),
  ])

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'quantity', desc: params.get(ORDER_DIRECTION_KEY) !== 'asc' },
  ])

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    sortDescFirst: true,
  })

  return (
    <div className="space-y-8">
      <h2 className="pl-1 text-2xl font-bold text-slate-900 dark:text-slate-200">All Holders</h2>
      <div className="space-y-6">
        <div className="flex gap-2">
          {BALANCE_FILTER.options.map((filter) => (
            <FilterButton
              onClick={() => filterBalance(filter)}
              isActive={Number(params.get(BALANCE_FILTER.key)) === filter}
              key={filter}
            >
              {`>=${formatNumber(filter)}`} <span className="hidden md:inline">$SUSHI</span>
            </FilterButton>
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-[#1A2031]">
          <GenericTable<TokenHolder>
            loading={isPending}
            table={table}
            placeholder=""
            pageSize={Math.max(users.length, 5)}
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
