'use client'

import { DataTable } from '@sushiswap/ui'
import React from 'react'

import { TreasuryBalance } from '../../../lib/governance-dashboard'
import {
  BALANCE_COLUMN,
  BALANCE_USD_COLUMN,
  PORTFOLIO_SHARE_COLUMN,
  PRICE_COLUMN,
  TOKEN_COLUMN,
} from './columns'

const COLUMNS = [
  TOKEN_COLUMN,
  PORTFOLIO_SHARE_COLUMN,
  BALANCE_USD_COLUMN,
  BALANCE_COLUMN,
  PRICE_COLUMN,
]

export function TreasuryBalancesTable({
  balances,
}: { balances: TreasuryBalance[] }) {
  return (
    <div className="rounded-lg bg-white dark:bg-[#1A2031]">
      <div className="h-full w-full border-b border-slate-200 dark:border-slate-800 px-5 pb-7 pt-5">
        <h3 className="mt-3 text-xl font-semibold">Treasury Snapshot</h3>
      </div>
      <DataTable
        loading={!balances}
        state={{
          sorting: [{ id: 'portfolioShare', desc: true }],
        }}
        // rowRenderer={rowRenderer}
        columns={COLUMNS}
        data={balances}
      />
    </div>
  )
}
