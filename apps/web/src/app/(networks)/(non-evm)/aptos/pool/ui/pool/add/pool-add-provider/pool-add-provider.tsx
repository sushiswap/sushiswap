import { useSlippageTolerance } from '@sushiswap/hooks'
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import { getBaseTokensWithoutKey } from '~aptos/_common/lib/common/use-base-tokens'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { Token } from '~aptos/_common/lib/types/token'
import { PoolReserve } from '~aptos/pool/lib/use-pools-reserves'
import { setAmount0 } from './actions/setAmount0'
import { setAmount1 } from './actions/setAmount1'
import { setPoolPairRatio } from './actions/setPoolPairRatio'
import { setSlippageAmount0 } from './actions/setSlippageAmount0'
import { setSlippageAmount1 } from './actions/setSlippageAmount1'
import {
  parseSlippageTolerance,
  setSlippageTolerance,
} from './actions/setSlippageTolerance'
import { setToken0 } from './actions/setToken0'
import { setToken1 } from './actions/setToken1'
import { swapTokens } from './actions/swapTokens'
import { Actions, PoolApi, State } from './types'

interface PoolProviderProps {
  children: ReactNode
}

export const PoolStateContext = createContext<State>({} as State)
export const PoolActionsContext = createContext<PoolApi>({} as PoolApi)

export const PoolProvider: FC<PoolProviderProps> = ({ children }) => {
  const [slippageTolerance] = useSlippageTolerance()

  const { network } = useNetwork()

  const baseTokens = getBaseTokensWithoutKey({ network })

  const reducer = (state: State, action: Actions): State => {
    switch (action.type) {
      case 'setToken0':
        return setToken0(state, action)
      case 'setToken1':
        return setToken1(state, action)
      case 'swapTokens':
        return swapTokens(state, action)
      case 'setAmount0':
        return setAmount0(state, action)
      case 'setAmount1':
        return setAmount1(state, action)
      case 'setIndependentField':
        return { ...state, independentField: action.value }
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
      case 'setPoolReserves':
        return { ...state, poolReserves: action.value }
      case 'setPoolPairRatio':
        return setPoolPairRatio(state, action)
      case 'setSlippageTolerance':
        return setSlippageTolerance(state, action)
      case 'setSlippageAmount0':
        return setSlippageAmount0(state, action)
      case 'setSlippageAmount1':
        return setSlippageAmount1(state, action)
    }
  }

  const [internalState, dispatch] = useReducer(reducer, {
    token0: baseTokens[0],
    token1: baseTokens[1],
    amount0: '',
    amount1: '',
    independentField: 'token0',
    isLoadingPrice: false,
    buttonError: '',
    isTransactionPending: false,
    isPriceFetching: false,
    error: '',
    poolReserves: null,
    poolPairRatio: null,
    slippageTolerance: parseSlippageTolerance(slippageTolerance),
    slippageAmount0: 0,
    slippageAmount1: 0,
  })

  const state = useMemo(() => {
    return { ...internalState }
  }, [internalState])

  const api = useMemo(() => {
    const setToken0 = (token: Token) =>
      dispatch({ type: 'setToken0', value: token })
    const setToken1 = (token: Token) =>
      dispatch({ type: 'setToken1', value: token })
    const swapTokens = () => dispatch({ type: 'swapTokens' })
    const setAmount0 = (value: string) =>
      dispatch({ type: 'setAmount0', value })
    const setAmount1 = (value: string) =>
      dispatch({ type: 'setAmount1', value })
    const setIndependentField = (value: State['independentField']) =>
      dispatch({ type: 'setIndependentField', value })
    const setLoadingPrice = (value: boolean) =>
      dispatch({ type: 'setLoadingPrice', value })
    const setButtonError = (value: string) =>
      dispatch({ type: 'setButtonError', value })
    const setisTransactionPending = (value: boolean) =>
      dispatch({ type: 'setisTransactionPending', value })
    const setPriceFetching = (value: boolean) =>
      dispatch({ type: 'setPriceFetching', value })
    const setError = (value: string) => dispatch({ type: 'setError', value })
    const setPoolReserves = (value: PoolReserve | null) =>
      dispatch({ type: 'setPoolReserves', value })
    const setPoolPairRatio = (value: number) =>
      dispatch({ type: 'setPoolPairRatio', value })
    const setSlippageAmount0 = (value: number) =>
      dispatch({ type: 'setSlippageAmount0', value })
    const setSlippageAmount1 = (value: number) =>
      dispatch({ type: 'setSlippageAmount1', value })

    return {
      setToken0,
      setToken1,
      swapTokens,
      setAmount0,
      setAmount1,
      setIndependentField,
      setLoadingPrice,
      setButtonError,
      setisTransactionPending,
      setPriceFetching,
      setError,
      setPoolReserves,
      setPoolPairRatio,
      setSlippageAmount0,
      setSlippageAmount1,
    }
  }, [])

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
