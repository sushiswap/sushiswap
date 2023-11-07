enum PayloadType {
  Swap = 'swap',
}

interface SwapPayload {
  type: PayloadType.Swap
  inputAmount: string
  outputAmount: string
  inputToken: {
    address: string
    decimals: number
    symbol: string
  }
  outputToken: {
    address: string
    decimals: number
    symbol: string
  }
}

type Payloads = SwapPayload

const isSwapPayload = (payload: Payloads): payload is SwapPayload => {
  return payload.type === PayloadType.Swap
}

export { PayloadType, type SwapPayload, isSwapPayload }
