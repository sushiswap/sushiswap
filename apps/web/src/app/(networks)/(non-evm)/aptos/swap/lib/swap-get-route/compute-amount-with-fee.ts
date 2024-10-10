interface ComputeAmountWithFee {
  amountIn: number
}

export function computeAmountWithFee({ amountIn }: ComputeAmountWithFee) {
  return amountIn * 9975
}
