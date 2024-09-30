'use client'

import { FC, createContext, useContext, useMemo, useReducer } from 'react'
import { STABLE_TOKENS, TRON } from '~tron/_common/constants/token-list'
import { IToken } from '~tron/_common/types/token-type'

type Action =
  | { type: 'swapTokens' }
  | { type: 'setToken0'; value: IToken }
  | { type: 'setToken1'; value: IToken }
  | { type: 'setIsTxnPending'; value: boolean }
  | { type: 'setAmountIn'; value: string }
  | { type: 'setAmountOut'; value: string }
  | { type: 'setRoute'; value: string[] }
  | { type: 'setPriceImpactPercentage'; value: number }

type Dispatch = {
  swapTokens(): void
  setToken0(token: IToken): void
  setToken1(token: IToken): void
  setIsTxnPending(isPending: boolean): void
  setAmountIn(amount: string): void
  setAmountOut(amount: string): void
  setPriceImpactPercentage(priceImpactPercentage: number): void
  setRoute(route: string[]): void
}

type State = {
  token0: IToken
  token1: IToken
  isTxnPending: boolean
  amountIn: string
  amountOut: string
  priceImpactPercentage: number
  route: string[]
}

type SwapProviderProps = { children: React.ReactNode }

const SwapContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function swapReducer(_state: State, action: Action) {
  switch (action.type) {
    case 'setToken0': {
      if (_state.token1.address === action.value.address) {
        //if token1 is the same as the new token0, swap them
        return {
          ..._state,
          token1: _state.token0,
          token0: action.value,
          amountIn: '',
          amountOut: '',
        }
      }
      return { ..._state, token0: action.value, amountIn: '', amountOut: '' }
    }
    case 'setToken1': {
      if (_state.token0.address === action.value.address) {
        //if token0 is the same as the new token1, swap them
        return {
          ..._state,
          token0: _state.token1,
          token1: action.value,
          amountIn: '',
          amountOut: '',
        }
      }
      return { ..._state, token1: action.value }
    }
    case 'swapTokens': {
      return {
        ..._state,
        token0: _state.token1,
        token1: _state.token0,
        amountIn: '',
        amountOut: '',
      }
    }
    case 'setIsTxnPending': {
      return { ..._state, isTxnPending: action.value }
    }
    case 'setAmountIn': {
      return { ..._state, amountIn: action.value }
    }
    case 'setAmountOut': {
      return { ..._state, amountOut: action.value }
    }
    case 'setPriceImpactPercentage': {
      return { ..._state, priceImpactPercentage: action.value }
    }
    case 'setRoute': {
      return { ..._state, route: action.value }
    }
    // default: {
    // 	throw new Error(`Unhandled action type: ${action.type}`);
    // }
  }
}

const SwapProvider: FC<SwapProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(swapReducer, {
    token0: TRON,
    token1: STABLE_TOKENS[0],
    isTxnPending: false,
    amountIn: '',
    amountOut: '',
    priceImpactPercentage: 0,
    route: [],
  })

  const dispatchWithAction = useMemo(
    () => ({
      setToken0: (value: IToken) => dispatch({ type: 'setToken0', value }),
      setToken1: (value: IToken) => dispatch({ type: 'setToken1', value }),
      swapTokens: () => dispatch({ type: 'swapTokens' }),
      setIsTxnPending: (value: boolean) =>
        dispatch({ type: 'setIsTxnPending', value }),
      setAmountIn: (value: string) => dispatch({ type: 'setAmountIn', value }),
      setAmountOut: (value: string) =>
        dispatch({ type: 'setAmountOut', value }),
      setPriceImpactPercentage: (value: number) =>
        dispatch({ type: 'setPriceImpactPercentage', value }),
      setRoute: (value: string[]) => dispatch({ type: 'setRoute', value }),
    }),
    [],
  )

  return (
    <SwapContext.Provider
      value={useMemo(() => {
        return { state, dispatch: dispatchWithAction }
      }, [state, dispatchWithAction])}
    >
      {children}
    </SwapContext.Provider>
  )
}

const useSwapContext = () => {
  const context = useContext(SwapContext)
  if (!context) {
    throw new Error('Hook can only be used inside Swap Provider')
  }

  return context
}

const useSwapState = () => {
  const context = useSwapContext()
  return context.state
}

const useSwapDispatch = () => {
  const context = useSwapContext()
  return context.dispatch
}

export { SwapProvider, useSwapState, useSwapDispatch }
