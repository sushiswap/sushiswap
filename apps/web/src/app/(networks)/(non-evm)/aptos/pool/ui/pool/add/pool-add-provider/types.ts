import { Token } from '~aptos/_common/lib/types/token'
import { PoolReserve } from '~aptos/pool/lib/use-pools-reserves'

export type State = {
  token0: Token
  token1: Token
  amount0: string | null
  amount1: string | null
  independentField: 'token0' | 'token1'
  isLoadingPrice: boolean
  buttonError: string
  isTransactionPending: boolean
  isPriceFetching: boolean
  error: string
  poolReserves: PoolReserve | null
  poolPairRatio: number | null
  slippageTolerance: number
  slippageAmount0: number
  slippageAmount1: number
}

export type PoolApi = {
  setToken0(token: Token): void
  setToken1(token: Token): void
  swapTokens(): void
  setAmount0(amount0: string): void
  setAmount1(amount1: string): void
  setIndependentField(independentField: State['independentField']): void
  setLoadingPrice(isLoadingPrice: boolean): void
  setButtonError(buttonError: string): void
  setisTransactionPending(value: boolean): void
  setPriceFetching(value: boolean): void
  setError(value: string): void
  setPoolReserves(value: PoolReserve | null): void
  setPoolPairRatio(value: number): void
  setSlippageAmount0(amount0: number): void
  setSlippageAmount1(amount1: number): void
}

export type Actions =
  | { type: 'setToken0'; value: Token }
  | { type: 'setToken1'; value: Token }
  | { type: 'swapTokens' }
  | { type: 'setAmount0'; value: string }
  | { type: 'setAmount1'; value: string }
  | { type: 'setIndependentField'; value: State['independentField'] }
  | { type: 'setLoadingPrice'; value: boolean }
  | { type: 'setButtonError'; value: string }
  | { type: 'setisTransactionPending'; value: boolean }
  | { type: 'setPriceFetching'; value: boolean }
  | { type: 'setError'; value: string }
  | { type: 'setPoolReserves'; value: PoolReserve | null }
  | { type: 'setPoolPairRatio'; value: number }
  | { type: 'setSlippageTolerance'; value: number | string }
  | { type: 'setSlippageAmount0'; value: number }
  | { type: 'setSlippageAmount1'; value: number }
