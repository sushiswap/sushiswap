import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { ColumnDef } from '@tanstack/react-table'
import { ICON_SIZE } from '~tron/_common/constants/icon-size'
import { IMyPositionData } from '~tron/_common/types/get-pools-type'
import { PositionNameCell } from './PositionNameCell'
import { PositionSizeCell } from './PositionSizeCell'
import { PositionTvlCell } from './PositionTvlCell'

export const POSITION_NAME_COLUMN: ColumnDef<IMyPositionData, unknown> = {
  id: 'name',
  header: 'Name',
  cell: (props) => <PositionNameCell data={props.row.original} />,
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

export const TVL_COLUMN: ColumnDef<any, unknown> = {
  id: 'TVL',
  header: 'TVL',
  cell: (props) => <PositionTvlCell data={props.row.original} />,
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

export const SIZE_COLUMN: ColumnDef<IMyPositionData, unknown> = {
  id: 'size',
  header: 'Size',
  cell: (props) => <PositionSizeCell data={props.row.original} />,
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
