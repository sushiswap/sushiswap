interface ComputePriceImpact {
  amountIn: number
  amountOut: number
  midPrice: number
}

export function computePriceImpact({
  amountIn,
  amountOut,
  midPrice,
}: ComputePriceImpact) {
  const quotedOutputAmount = amountIn * midPrice
  const priceImpact =
    ((quotedOutputAmount - amountOut) / quotedOutputAmount) * 100
  return priceImpact
}
