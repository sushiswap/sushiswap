import { computeAmountWithFee } from './compute-amount-with-fee'

interface ComputeExactOutput {
  amountIn: number
  res_x: number
  res_y: number
}

export function computeExactOutput({
  amountIn,
  res_x,
  res_y,
}: ComputeExactOutput) {
  const amountWithFee = computeAmountWithFee({ amountIn })
  const amountOut = (amountWithFee * res_y) / (res_x * 10000 + amountWithFee)

  return amountOut
}
