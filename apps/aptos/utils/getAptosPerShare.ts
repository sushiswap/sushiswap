import { FarmLP } from './useFarms'
import { ACC_SUSHI_PRECISION } from './useUserRewards'

export default function getAptosPerShare(
  farms: FarmLP | undefined,
  farmIndex: number | undefined,
) {
  const TOTAL_APTOS_RATE_PRECISION = 100000
  if (farms === undefined) return 0
  if (farmIndex === undefined || farmIndex === -1) return 0

  const poolInfo = farms?.data?.pool_info[farmIndex]
  let aptosReward = 0
  let currentAptosPerShare =
    farmIndex !== undefined && farmIndex !== -1
      ? Number(poolInfo.acc_aptos_per_share)
      : 0
  const currentTime = Date.now() / 1000

  if (currentTime > Number(poolInfo.last_reward_timestamp)) {
    let totalAllocPoint
    let aptosRate
    if (poolInfo.is_regular) {
      totalAllocPoint = farms.data.total_regular_alloc_point
      aptosRate = farms.data.aptos_rate_to_regular
    } else {
      totalAllocPoint = farms.data.total_special_alloc_point
      aptosRate = farms.data.aptos_rate_to_special
    }

    const supply = Number(poolInfo.total_amount)

    let multiplier
    if (farms.data.end_timestamp <= poolInfo.last_reward_timestamp) {
      multiplier = 0
    } else if (currentTime <= Number(farms.data.end_timestamp)) {
      multiplier =
        currentTime -
        Math.max(
          Number(poolInfo.last_reward_timestamp),
          Number(farms.data.last_upkeep_timestamp),
        )
    } else {
      multiplier =
        Number(farms.data.end_timestamp) -
        Math.max(
          Number(poolInfo.last_reward_timestamp),
          Number(farms.data.last_upkeep_timestamp),
        )
    }
    if (supply > 0 && Number(totalAllocPoint) > 0) {
      aptosReward =
        (multiplier *
          Number(farms.data.aptos_per_second) *
          Number(aptosRate) *
          Number(poolInfo.alloc_point)) /
        Number(totalAllocPoint) /
        TOTAL_APTOS_RATE_PRECISION
      currentAptosPerShare =
        Number(poolInfo.acc_aptos_per_share) +
        (aptosReward * ACC_SUSHI_PRECISION) / supply
    }
    return currentAptosPerShare
  }
  return 0
}
