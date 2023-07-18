'use client'

import { Native, Token } from '@sushiswap/currency'
import { Currency, Progress } from '@sushiswap/ui'
import { GenericTable } from '@sushiswap/ui/components/table/GenericTable'
import { createColumnHelper, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import React from 'react'

import { formatNumber, TreasuryBalance } from '../lib'

const columnHelper = createColumnHelper<TreasuryBalance>()

const columns = [
  columnHelper.accessor('token', {
    header: 'Token',
    enableSorting: false,
    minSize: 100,
    cell: (info) => {
      const token = info.getValue()
      const currency = token.isNative ? Native.onChain(token.chainId) : new Token(token)

      return (
        <div className="flex items-center gap-2 font-medium">
          <Currency.Icon currency={currency} width={24} height={24} />
          {currency.symbol}
        </div>
      )
    },
  }),
  columnHelper.accessor('portfolioShare', {
    header: 'Portfolio Share',
    minSize: 150,
    cell: (info) => (
      <Progress value={info.getValue() * 100} className="w-20 md:w-[100px] bg-slate-900/20 dark:bg-slate-50/20" />
    ),
  }),
  columnHelper.accessor('balanceUSD', {
    header: () => <div className="w-full text-right">Value</div>,
    enableSorting: false,
    minSize: 80,
    cell: (info) => <div className="w-full text-right">${formatNumber(info.getValue())}</div>,
  }),
  columnHelper.accessor('balance', {
    header: () => <div className="w-full text-right">Tokens</div>,
    enableSorting: false,
    minSize: 80,
    cell: (info) => <div className="w-full text-right">{formatNumber(info.getValue())}</div>,
  }),
  columnHelper.accessor('price', {
    header: () => <div className="w-full text-right">Price</div>,
    enableSorting: false,
    meta: { className: 'pr-3' },
    minSize: 80,
    cell: (info) => (
      <div className="w-full pr-3 text-right">
        {(+info.getValue()).toLocaleString('EN', {
          maximumFractionDigits: 2,
          style: 'currency',
          currency: 'USD',
        })}
      </div>
    ),
  }),
]

export function TreasuryBalancesTable({ balances }: { balances: TreasuryBalance[] }) {
  const table = useReactTable({
    data: balances,
    columns,
    initialState: {
      sorting: [{ id: 'portfolioShare', desc: true }],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-lg bg-white dark:bg-[#1A2031]">
      <div className="h-full w-full border-b border-slate-200 dark:border-slate-800 px-5 pb-7 pt-5">
        <h3 className="mt-3 text-xl font-semibold">Treasury Snapshot</h3>
      </div>
      <GenericTable<TreasuryBalance>
        loading={false}
        loadingOverlay={false}
        table={table}
        placeholder=""
        pageSize={Math.max(balances.length, 3)}
      />
    </div>
  )
}
