'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
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
interface SwapProviderProps {
  children: ReactNode
}
type State = {
  token0: Token
  token1: Token
  amount: string | null
  slippageAmount: number
  outputAmount: string
  error: string
  isLoadingPrice: boolean
  isTransactionPending: boolean
  isPriceFetching: boolean
  bestRoutes: string[]
  noRouteFound: string
}
type SwapApi = {
  setToken0(token: Token): void
  setToken1(token: Token): void
  swapTokens(): void
  setAmount(amount: string): void
  setSlippageAmount(amount: number): void
  setOutputAmount(amount: string): void
  setError(value: string): void
  setLoadingPrice(value: boolean): void
  setisTransactionPending(value: boolean): void
  setPriceFetching(value: boolean): void
  setBestRoutes(value: string[]): void
  setNoRouteFound(value: string): void
}

export const SwapStateContext = createContext<State>({} as State)
export const SwapActionsContext = createContext<SwapApi>({} as SwapApi)

type Actions =
  | { type: 'setToken0'; value: Token }
  | { type: 'setToken1'; value: Token }
  | { type: 'swapTokens' }
  | { type: 'setAmount'; value: string }
  | { type: 'setSlippageAmount'; value: number }
  | { type: 'setOutputAmount'; value: string }
  | { type: 'setError'; value: string }
  | { type: 'setLoadingPrice'; value: boolean }
  | { type: 'setisTransactionPending'; value: boolean }
  | { type: 'setPriceFetching'; value: boolean }
  | { type: 'setBestRoutes'; value: string[] }
  | { type: 'setNoRouteFound'; value: string }

export const SwapProvider: FC<SwapProviderProps> = ({ children }) => {
  const [slippageTolerance] = useSlippageTolerance()
  const { account, network } = useWallet()
  const baseTokens = getTokensWithoutKey()
  const reducer = (state: State, action: Actions) => {
    switch (action.type) {
      case 'setToken0':
        return { ...state, token0: action.value }
      case 'setToken1':
        return { ...state, token1: action.value }
      case 'swapTokens':
        return { ...state, token0: state.token1, token1: state.token0 }
      case 'setAmount':
        return { ...state, amount: action.value }
      case 'setSlippageAmount':
        return {
          ...state,
          slippageAmount:
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
      case 'setOutputAmount':
        return { ...state, outputAmount: action.value }
      case 'setError':
        return { ...state, error: action.value }
      case 'setLoadingPrice':
        return { ...state, isLoadingPrice: action.value }
      case 'setisTransactionPending':
        return { ...state, isTransactionPending: action.value }
      case 'setPriceFetching':
        return { ...state, isPriceFetching: action.value }
      case 'setBestRoutes':
        return { ...state, bestRoutes: action.value }
      case 'setNoRouteFound':
        return { ...state, noRouteFound: action.value }
    }
  }
  const [internalState, dispatch] = useReducer(reducer, {
    token0: baseTokens[0],
    token1: baseTokens[1],
    amount: '',
    slippageAmount: 0,
    outputAmount: '',
    error: '',
    isLoadingPrice: false,
    isTransactionPending: false,
    isPriceFetching: false,
    bestRoutes: [],
    noRouteFound: '',
  })
  const state = useMemo(() => {
    return { ...internalState }
  }, [internalState, network, account, baseTokens])
  const api = useMemo(() => {
    const setToken0 = (value: Token) => dispatch({ type: 'setToken0', value })
    const setToken1 = (value: Token) => dispatch({ type: 'setToken1', value })
    const swapTokens = () => dispatch({ type: 'swapTokens' })
    const setAmount = (value: string) => dispatch({ type: 'setAmount', value })
    const setSlippageAmount = (value: number) =>
      dispatch({ type: 'setSlippageAmount', value })
    const setOutputAmount = (value: string) =>
      dispatch({ type: 'setOutputAmount', value })
    const setError = (value: string) => dispatch({ type: 'setError', value })
    const setLoadingPrice = (value: boolean) =>
      dispatch({ type: 'setLoadingPrice', value })
    const setisTransactionPending = (value: boolean) =>
      dispatch({ type: 'setisTransactionPending', value })
    const setPriceFetching = (value: boolean) =>
      dispatch({ type: 'setPriceFetching', value })
    const setBestRoutes = (value: string[]) =>
      dispatch({ type: 'setBestRoutes', value })
    const setNoRouteFound = (value: string) =>
      dispatch({ type: 'setNoRouteFound', value })

    return {
      setToken0,
      setToken1,
      swapTokens,
      setAmount,
      setSlippageAmount,
      setOutputAmount,
      setError,
      setLoadingPrice,
      setisTransactionPending,
      setPriceFetching,
      setBestRoutes,
      setNoRouteFound,
    }
  }, [internalState, baseTokens])

  return (
    <SwapActionsContext.Provider value={api}>
      <SwapStateContext.Provider value={useMemo(() => ({ ...state }), [state])}>
        {children}
      </SwapStateContext.Provider>
    </SwapActionsContext.Provider>
  )
  // return <></>
}

export const useSwapState = () => {
  const context = useContext(SwapStateContext)
  if (!context) {
    throw new Error('Hook can only be used inside State Context')
  }

  return context
}
export const useSwapActions = () => {
  const context = useContext(SwapActionsContext)
  if (!context) {
    throw new Error('Hook can only be used inside State Actions Context')
  }

  return context
}
