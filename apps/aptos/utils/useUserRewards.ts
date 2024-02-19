import { useMemo } from 'react'
import getAptosPerShare from './getAptosPerShare'
import { FarmLP } from './useFarms'
import { userStakes } from './useUserHandle'

export const ACC_SUSHI_PRECISION = 1000000000000

export function useUserRewards(
  farms: FarmLP | undefined,
  stakes: userStakes | undefined,
  pIdIndex: number | undefined,
  farmIndex: number | undefined,
) {
  return useMemo(() => {
    const aptosPerShare = getAptosPerShare(farms, farmIndex)
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
