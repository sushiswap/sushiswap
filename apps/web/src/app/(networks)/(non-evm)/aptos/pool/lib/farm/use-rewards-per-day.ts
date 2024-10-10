import { useMemo } from 'react'
import { formatNumberWithDecimals } from '~aptos/_common/lib/common/format-number-with-decimals'
import { FarmLP } from './use-farms'

const SECONDS_PER_DAY = 86400

export function useRewardsPerDay(
  farms: FarmLP | undefined,
  farmIndex: number | undefined,
  decimals: number | undefined,
) {
  return useMemo(() => {
    if (farms && farmIndex !== undefined && farmIndex !== -1 && decimals) {
      const total_allocPoint = farms?.data?.pool_info?.[farmIndex].is_regular
        ? farms?.data?.total_regular_alloc_point
        : farms?.data?.total_special_alloc_point

      return formatNumberWithDecimals(
        (Number(farms?.data?.sushi_per_second) *
          SECONDS_PER_DAY *
          Number(farms?.data?.pool_info?.[farmIndex]?.alloc_point)) /
          Number(total_allocPoint),
        decimals,
      )
    } else {
      return '0'
    }
  }, [farms, farmIndex, decimals])
}
