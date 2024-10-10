import { useMemo } from 'react'
import { UserStakes } from '~aptos/_common/lib/common/use-user-handle'
import farmGetTokenPerShare from './get-token-per-share'
import { FarmLP } from './use-farms'

export const ACC_SUSHI_PRECISION = 1000000000000

export function useUserRewards(
  farms: FarmLP | undefined,
  stakes: UserStakes | undefined,
  pIdIndex: number | undefined,
  farmIndex: number | undefined,
) {
  return useMemo(() => {
    const aptosPerShare = farmGetTokenPerShare(farms, farmIndex)
    return stakes?.data.current_table_items &&
      pIdIndex !== undefined &&
      pIdIndex !== -1 &&
      farmIndex !== undefined &&
      farmIndex !== -1
      ? (Number(
          stakes.data.current_table_items[pIdIndex].decoded_value.amount,
        ) *
          aptosPerShare) /
          ACC_SUSHI_PRECISION -
          Number(
            stakes.data.current_table_items[pIdIndex].decoded_value.reward_debt,
          )
      : 0
  }, [farms, stakes, pIdIndex, farmIndex])
}
