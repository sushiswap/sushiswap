export const SECONDS_IN_YEAR = 31536000 // 365 * 24 * 60 * 60

export default function getFarmApr(
  poolWeight: number,
  cakePriceUsd: number,
  poolLiquidityUsd: number,
  regularCakePerSecond: number,
) {
  const yearlyCakeRewardAllocation = poolWeight
    ? poolWeight * regularCakePerSecond
    : NaN
  const cakeRewardsApr =
    ((yearlyCakeRewardAllocation * cakePriceUsd) / poolLiquidityUsd) * 100
  let cakeRewardsAprAsNumber: null | number = null
  if (!Number.isNaN(cakeRewardsApr) && Number.isFinite(cakeRewardsApr)) {
    cakeRewardsAprAsNumber = cakeRewardsApr / 10 ** 8
  }
  return { cakeRewardsApr: cakeRewardsAprAsNumber }
}
