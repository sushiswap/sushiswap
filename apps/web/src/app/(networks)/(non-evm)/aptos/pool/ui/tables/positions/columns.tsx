import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { ColumnDef } from '@tanstack/react-table'
import { PoolExtended } from '~aptos/pool/lib/use-pools-extended'
import { PositionNameCell } from './cells/position-name-cell'
import { PoolMyPositionTVLCell } from './cells/position-tvl-cell'

export const NAME_COLUMN: ColumnDef<PoolExtended, unknown> = {
  id: 'name',
  header: 'Name',
  cell: (props) => <PositionNameCell row={props.row.original} />,
  meta: {
    skeleton: (
      <div className="flex items-center w-full gap-2">
        <div className="flex items-center">
          <SkeletonCircle radius={26} />
          <SkeletonCircle radius={26} className="-ml-[12px]" />
        </div>
        <div className="flex flex-col w-full">
          <SkeletonText fontSize="lg" />
        </div>
      </div>
    ),
  },
}

export const TVL_COLUMN: ColumnDef<PoolExtended, unknown> = {
  id: 'reserveUSD',
  header: 'TVL',
  accessorFn: (row) => row.reserveUSD,
  cell: (props) => <PoolMyPositionTVLCell row={props.row.original} />,
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

export const MYPOSITION_TVL_COLUMN: ColumnDef<PoolExtended, unknown> = {
  id: 'Size',
  header: 'Size',
  cell: (props) => <PoolMyPositionTVLCell row={props.row.original} />,
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

// export const MYPOSITION_APR_COLUMN: ColumnDef<Pool, unknown> = {
//   id: 'APR',
//   header: 'APR',
//   cell: (props) => <PoolMyPositionAprCell row={props.row.original} />,
//   meta: {
//     skeleton: (
//       <div className="flex items-center w-full gap-2">
//         <div className="flex flex-col w-full">
//           <SkeletonText fontSize="lg" />
//         </div>
//       </div>
//     ),
//   },
// }
