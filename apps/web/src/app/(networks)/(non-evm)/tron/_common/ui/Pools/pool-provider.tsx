'use client'

import { FC, createContext, useContext, useMemo, useReducer } from 'react'
import {
  DEFAULT_TOKEN_LIST,
  STABLE_TOKENS,
  TRON,
} from '~tron/_common/constants/token-list'
import { IToken } from '~tron/_common/types/token-type'
import { ReserveHelper } from '~tron/_common/ui/Pools/ReserveHelper'

type InputFieldType = 'token0' | 'token1'

type Action =
  | { type: 'setToken0'; value: IToken }
  | { type: 'setToken1'; value: IToken }
  | { type: 'setIsTxnPending'; value: boolean }
  | { type: 'setAmountInToken0'; value: string }
  | { type: 'setAmountInToken1'; value: string }
  | { type: 'setPairAddress'; value: string | undefined | null }
  | { type: 'setReserve0'; value: string }
  | { type: 'setReserve1'; value: string }
  | { type: 'setInputField'; value: InputFieldType }

type Dispatch = {
  setToken0(token: IToken): void
  setToken1(token: IToken): void
  setIsTxnPending(isPending: boolean): void
  setAmountInToken0(amount: string): void
  setAmountInToken1(amount: string): void
  setPairAddress(pairAddress: string | undefined | null): void
  setReserve0(reserve0: string): void
  setReserve1(reserve1: string): void
  setInputField(inputField: InputFieldType): void
}

type State = {
  token0: IToken | undefined
  token1: IToken | undefined
  isTxnPending: boolean
  amountInToken0: string
  amountInToken1: string
  pairAddress: string | undefined | null
  reserve0: string
  reserve1: string
  inputField: 'token0' | 'token1'
}

type PoolProviderProps = { children: React.ReactNode }

const PoolContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function poolReducer(_state: State, action: Action) {
  switch (action.type) {
    case 'setToken0': {
      if (_state?.token1?.address === action.value.address) {
        //if token1 is the same as the new token0, swap them
        return { ..._state, token1: _state.token0, token0: action.value }
      }
      //if token1 is TRX and the new token is WRTX or vice versa, go back to default pair
      if (
        (_state?.token1?.symbol === 'TRX' && action.value.symbol === 'WTRX') ||
        (_state?.token1?.symbol === 'WTRX' && action.value.symbol === 'TRX')
      ) {
        return {
          ..._state,
          token0: DEFAULT_TOKEN_LIST[0],
          token1: DEFAULT_TOKEN_LIST[2],
        }
      }
      return { ..._state, token0: action.value }
    }
    case 'setToken1': {
      if (_state?.token0?.address === action.value.address) {
        //if token0 is the same as the new token1, swap them
        return { ..._state, token0: _state.token1, token1: action.value }
      }
      if (
        (_state?.token0?.symbol === 'TRX' && action.value.symbol === 'WTRX') ||
        (_state?.token0?.symbol === 'WTRX' && action.value.symbol === 'TRX')
      ) {
        return {
          ..._state,
          token0: DEFAULT_TOKEN_LIST[0],
          token1: DEFAULT_TOKEN_LIST[2],
        }
      }
      return { ..._state, token1: action.value }
    }
    case 'setIsTxnPending': {
      return { ..._state, isTxnPending: action.value }
    }
    case 'setAmountInToken0': {
      return { ..._state, amountInToken0: action.value }
    }
    case 'setAmountInToken1': {
      return { ..._state, amountInToken1: action.value }
    }
    case 'setPairAddress': {
      return { ..._state, pairAddress: action.value }
    }
    case 'setReserve0': {
      return { ..._state, reserve0: action.value }
    }
    case 'setReserve1': {
      return { ..._state, reserve1: action.value }
    }
    case 'setInputField': {
      return { ..._state, inputField: action.value }
    }
  }
}

const PoolProvider: FC<PoolProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(poolReducer, {
    token0: TRON,
    token1: STABLE_TOKENS[0],
    isTxnPending: false,
    amountInToken0: '',
    amountInToken1: '',
    pairAddress: undefined,
    reserve0: '',
    reserve1: '',
    inputField: 'token0',
  })

  const dispatchWithAction = useMemo(
    () => ({
      setToken0: (value: IToken) => dispatch({ type: 'setToken0', value }),
      setToken1: (value: IToken) => dispatch({ type: 'setToken1', value }),
      setIsTxnPending: (value: boolean) =>
        dispatch({ type: 'setIsTxnPending', value }),
      setAmountInToken0: (value: string) =>
        dispatch({ type: 'setAmountInToken0', value }),
      setAmountInToken1: (value: string) =>
        dispatch({ type: 'setAmountInToken1', value }),
      setPairAddress: (value: string | undefined | null) =>
        dispatch({ type: 'setPairAddress', value }),
      setReserve0: (value: string) => dispatch({ type: 'setReserve0', value }),
      setReserve1: (value: string) => dispatch({ type: 'setReserve1', value }),
      setInputField: (value: InputFieldType) =>
        dispatch({ type: 'setInputField', value }),
    }),
    [],
  )

  return (
    <PoolContext.Provider
      value={useMemo(() => {
        return { state, dispatch: dispatchWithAction }
      }, [state, dispatchWithAction])}
    >
      <ReserveHelper />
      {children}
    </PoolContext.Provider>
  )
}

const usePoolContext = () => {
  const context = useContext(PoolContext)
  if (!context) {
    throw new Error('Hook can only be used inside Pool Provider')
  }

  return context
}

const usePoolState = () => {
  const context = usePoolContext()
  return context.state
}

const usePoolDispatch = () => {
  const context = usePoolContext()
  return context.dispatch
}

export { PoolProvider, usePoolState, usePoolDispatch }
