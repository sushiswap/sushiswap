import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { ColumnDef } from '@tanstack/react-table'
import { formatPercent, formatUSD } from 'sushi/format'
import { TopPool } from '~tron/_common/lib/hooks/useTopPools'
import { PoolNameCell } from './PoolNameCell'

export const NAME_COLUMN: ColumnDef<TopPool, unknown> = {
  id: 'name',
  header: 'Name',
  cell: (props) => <PoolNameCell data={props.row.original} />,
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <div className="flex items-center">
          <SkeletonCircle radius={30} />
          <SkeletonCircle radius={30} className="-ml-[10px]" />
        </div>
        <div className="flex flex-col w-full min-w-[120px]">
          <SkeletonText fontSize="lg" />
        </div>
      </div>
    ),
  },
}

export const TVL_COLUMN: ColumnDef<TopPool, unknown> = {
  id: 'liquidityUSD',
  header: 'TVL',
  accessorFn: (row) => row.liquidityUSD,
  sortingFn: ({ original: rowA }, { original: rowB }) =>
    rowA.liquidityUSD - rowB.liquidityUSD,
  cell: (props) =>
    formatUSD(props.row.original.liquidityUSD).includes('NaN')
      ? '$0.00'
      : formatUSD(props.row.original.liquidityUSD),
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const VOLUME_1D_COLUMN: ColumnDef<TopPool, unknown> = {
  id: 'volumeUSD1d',
  header: 'Volume (24h)',
  accessorFn: (row) => row.volumeUSD1d,
  sortingFn: ({ original: rowA }, { original: rowB }) =>
    rowA.volumeUSD1d - rowB.volumeUSD1d,
  cell: (props) =>
    formatUSD(props.row.original.volumeUSD1d).includes('NaN')
      ? '$0.00'
      : formatUSD(props.row.original.volumeUSD1d),
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const FEES_1D_COLUMN: ColumnDef<TopPool, unknown> = {
  id: 'feeUSD1d',
  header: 'Fees (24h)',
  accessorFn: (row) => row.feeUSD1d,
  sortingFn: ({ original: rowA }, { original: rowB }) =>
    rowA.feeUSD1d - rowB.feeUSD1d,
  cell: (props) =>
    formatUSD(props.row.original.feeUSD1d).includes('NaN')
      ? '$0.00'
      : formatUSD(props.row.original.feeUSD1d),
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const TRANSACTIONS_1D_COLUMN: ColumnDef<TopPool, unknown> = {
  id: 'txCount1d',
  header: 'Transactions (24h)',
  accessorFn: (row) => row.txCount1d,
  sortingFn: ({ original: rowA }, { original: rowB }) =>
    rowA.txCount1d - rowB.txCount1d,
  cell: (props) => props.row.original.txCount1d,
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const APR_COLUMN: ColumnDef<TopPool, unknown> = {
  id: 'totalApr1d',
  header: 'APR',
  accessorFn: (row) => row.totalApr1d,
  cell: (props) => formatPercent(props.row.original.totalApr1d),
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}
