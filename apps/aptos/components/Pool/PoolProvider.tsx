import { useSlippageTolerance } from '@sushiswap/hooks'
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import { Token } from 'utils/tokenType'
import { getTokensWithoutKey } from 'utils/useTokens'

interface PoolProviderProps {
  children: ReactNode
}

type State = {
  token0: Token
  token1: Token
  amount0: string | null
  amount1: string | null
  isLoadingPrice: boolean
  buttonError: string
  isTransactionPending: boolean
  isPriceFetching: boolean
  error: string
  pairs: object
  poolPairRatio: number
  slippageAmount0: number
  slippageAmount1: number
}

type PoolApi = {
  setToken0(token: Token): void
  setToken1(token: Token): void
  setAmount0(amount1: string): void
  setAmount1(amount2: string): void
  setLoadingPrice(isLoadingPrice: boolean): void
  setButtonError(buttonError: string): void
  setisTransactionPending(value: boolean): void
  setPriceFetching(value: boolean): void
  setError(value: string): void
  setPairs(value: object): void
  setPoolPairRatio(value: number): void
  setSlippageAmount0(amount1: number): void
  setSlippageAmount1(amount2: number): void
}

export const PoolStateContext = createContext<State>({} as State)
export const PoolActionsContext = createContext<PoolApi>({} as PoolApi)

type Actions =
  | { type: 'setToken0'; value: Token }
  | { type: 'setToken1'; value: Token }
  | { type: 'setAmount0'; value: string }
  | { type: 'setAmount1'; value: string }
  | { type: 'setLoadingPrice'; value: boolean }
  | { type: 'setButtonError'; value: string }
  | { type: 'setisTransactionPending'; value: boolean }
  | { type: 'setPriceFetching'; value: boolean }
  | { type: 'setError'; value: string }
  | { type: 'setPairs'; value: object }
  | { type: 'setPoolPairRatio'; value: number }
  | { type: 'setSlippageAmount0'; value: number }
  | { type: 'setSlippageAmount1'; value: number }

export const PoolProvider: FC<PoolProviderProps> = ({ children }) => {
  const [slippageTolerance] = useSlippageTolerance()
  const baseTokens = getTokensWithoutKey()
  const reducer = (state: State, action: Actions) => {
    switch (action.type) {
      case 'setToken0':
        return { ...state, token0: action.value }
      case 'setToken1':
        return { ...state, token1: action.value }
      case 'setAmount0':
        return { ...state, amount0: action.value }
      case 'setAmount1':
        return { ...state, amount1: action.value }
      case 'setLoadingPrice':
        return { ...state, isLoadingPrice: action.value }
      case 'setButtonError':
        return { ...state, buttonError: action.value }
      case 'setisTransactionPending':
        return { ...state, isTransactionPending: action.value }
      case 'setPriceFetching':
        return { ...state, isPriceFetching: action.value }
      case 'setError':
        return { ...state, error: action.value }
      case 'setPairs':
        return { ...state, pairs: action.value }
      case 'setPoolPairRatio':
        return { ...state, poolPairRatio: action.value }
      case 'setSlippageAmount0':
        return {
          ...state,
          slippageAmount0:
            action.value -
            (action.value *
              parseFloat(
                slippageTolerance
                  ? slippageTolerance === 'AUTO'
                    ? '0.5'
                    : slippageTolerance
                  : '0.5',
              )) /
              100,
        }
      case 'setSlippageAmount1':
        return {
          ...state,
          slippageAmount1:
            action.value -
            (action.value *
              parseFloat(
                slippageTolerance
                  ? slippageTolerance === 'AUTO'
                    ? '0.5'
                    : slippageTolerance
                  : '0.5',
              )) /
              100,
        }
    }
  }

  const [internalState, dispatch] = useReducer(reducer, {
    token0: baseTokens[0],
    token1: baseTokens[1],
    amount0: '',
    amount1: '',
    isLoadingPrice: false,
    buttonError: '',
    isTransactionPending: false,
    isPriceFetching: false,
    error: '',
    pairs: {},
    poolPairRatio: 0,
    slippageAmount0: 0,
    slippageAmount1: 0,
  })
  const state = useMemo(() => {
    return { ...internalState }
  }, [internalState, baseTokens])
  const api = useMemo(() => {
    const setToken0 = (value: Token) => dispatch({ type: 'setToken0', value })
    const setToken1 = (value: Token) => dispatch({ type: 'setToken1', value })
    const setAmount0 = (value: string) =>
      dispatch({ type: 'setAmount0', value })
    const setAmount1 = (value: string) =>
      dispatch({ type: 'setAmount1', value })
    const setLoadingPrice = (value: boolean) =>
      dispatch({ type: 'setLoadingPrice', value })
    const setButtonError = (value: string) =>
      dispatch({ type: 'setButtonError', value })
    const setisTransactionPending = (value: boolean) =>
      dispatch({ type: 'setisTransactionPending', value })
    const setPriceFetching = (value: boolean) =>
      dispatch({ type: 'setPriceFetching', value })
    const setError = (value: string) => dispatch({ type: 'setError', value })
    const setPairs = (value: object) => dispatch({ type: 'setPairs', value })
    const setPoolPairRatio = (value: number) =>
      dispatch({ type: 'setPoolPairRatio', value })
    const setSlippageAmount0 = (value: number) =>
      dispatch({ type: 'setSlippageAmount0', value })
    const setSlippageAmount1 = (value: number) =>
      dispatch({ type: 'setSlippageAmount1', value })

    return {
      setToken0,
      setToken1,
      setAmount0,
      setAmount1,
      setLoadingPrice,
      setButtonError,
      setisTransactionPending,
      setPriceFetching,
      setError,
      setPairs,
      setPoolPairRatio,
      setSlippageAmount0,
      setSlippageAmount1,
    }
  }, [internalState, baseTokens])

  return (
    <PoolActionsContext.Provider value={api}>
      <PoolStateContext.Provider value={useMemo(() => ({ ...state }), [state])}>
        {children}
      </PoolStateContext.Provider>
    </PoolActionsContext.Provider>
  )
}

export const usePoolState = () => {
  const context = useContext(PoolStateContext)
  if (!context) {
    throw new Error('Hooks can only be used inside State Context')
  }
  return context
}

export const usePoolActions = () => {
  const context = useContext(PoolActionsContext)
  if (!context) {
    throw new Error('Hooks can only be used inside State Actions Context')
  }
  return context
}
