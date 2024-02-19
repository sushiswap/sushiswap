import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { ColumnDef } from '@tanstack/react-table'
import { Pool } from 'utils/usePools'
import { PoolNameCell } from '../SharedCells/PoolNameCell'
import { PoolReserveCell } from '../SharedCells/PoolReserveCell'
import { PoolTVLCell } from '../SharedCells/PoolTVLCell'
export const ICON_SIZE = 26
export const PAGE_SIZE = 20

export const NAME_COLUMN: ColumnDef<Pool, unknown> = {
  id: 'name',
  header: 'Name',
  cell: (props) => <PoolNameCell row={props.row.original} />,
  size: 280,
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <div className="flex items-center">
          <SkeletonCircle radius={ICON_SIZE} />
          <SkeletonCircle radius={ICON_SIZE} className="-ml-[12px]" />
        </div>
        <div className="flex flex-col w-full">
          <SkeletonText fontSize="lg" />
        </div>
      </div>
    ),
  },
}

export const RESERVE_COLUMN: ColumnDef<Pool, unknown> = {
  id: 'reserve',
  header: 'Reserve',
  cell: (props) => <PoolReserveCell row={props.row.original} />,
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <div className="flex flex-col w-full">
          <SkeletonText fontSize="lg" />
        </div>
      </div>
    ),
  },
}

export const TVL_COLUMN: ColumnDef<Pool, unknown> = {
  id: 'TVL',
  header: 'TVL',
  cell: (props) => <PoolTVLCell row={props.row.original} />,
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <div className="flex flex-col w-full">
          <SkeletonText fontSize="lg" />
        </div>
      </div>
    ),
  },
}
