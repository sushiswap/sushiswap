import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { SkeletonText } from '@sushiswap/ui'
import { ColumnDef } from '@tanstack/react-table'
import { shortenAddress } from 'sushi/format'
import { isCustomName, tokenHolderNames } from './tokenHolderNames'
import { TokenHolder } from './types'

export const RANK_COLUMN: ColumnDef<TokenHolder, unknown> = {
  id: 'rank',
  header: 'Rank',
  size: 40,
  accessorFn: (row) => row.rank,
  cell: (props) => (
    <span className="text-slate-600 dark:text-slate-300">
      {props.row.original.rank}
    </span>
  ),
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const NAME_COLUMN: ColumnDef<TokenHolder, unknown> = {
  id: 'name',
  header: 'Name',
  minSize: 240,
  accessorFn: (row) => row.address,
  cell: (props) => (
    <a
      href={`https://etherscan.io/address/${props.row.original.address}`}
      className="gap-2 font-bold flex items-center"
    >
      {isCustomName(props.row.original.address)
        ? tokenHolderNames[props.row.original.address]
        : shortenAddress(props.row.original.address)}
      <ArrowTopRightOnSquareIcon className="mb-0.5 h-4 w-4" strokeWidth={2.5} />
    </a>
  ),
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const QUANTITY_COLUMN: ColumnDef<TokenHolder, unknown> = {
  id: 'quantity',
  header: 'Quantity',
  accessorFn: (row) => row.quantity,
  cell: (props) => (
    <span className="text-slate-600 dark:text-slate-300">
      {props.row.original.quantity.toLocaleString('EN', {
        maximumFractionDigits: 0,
      })}
    </span>
  ),
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const OWNERSHIP_COLUMN: ColumnDef<TokenHolder, unknown> = {
  id: 'ownership',
  header: 'Ownership',
  accessorFn: (row) => row.ownership,
  cell: (props) => (
    <span className="text-slate-600 dark:text-slate-300">
      {props.row.original.ownership.toLocaleString('EN', {
        maximumFractionDigits: 2,
        style: 'percent',
      })}
    </span>
  ),
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const VALUE_COLUMN: ColumnDef<TokenHolder, unknown> = {
  id: 'value',
  header: 'Value',
  accessorFn: (row) => row.value,
  cell: (props) =>
    props.row.original.value.toLocaleString('EN', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'USD',
    }),
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const MONTHLY_CHANGE_COLUMN: ColumnDef<TokenHolder, unknown> = {
  id: 'change30d',
  header: 'Change (30d)',
  accessorFn: (row) => row.change30d,
  cell: (props) => {
    const change = props.row.original.change30d
    const color =
      change > 0
        ? 'text-green-400'
        : change < 0
          ? 'text-red-400'
          : 'text-slate-700 dark:text-gray-50'
    return (
      <span className={color}>
        {change.toLocaleString('EN', {
          maximumFractionDigits: 2,
          style: 'percent',
        })}
      </span>
    )
  },
  meta: {
    skeleton: <SkeletonText />,
  },
}
