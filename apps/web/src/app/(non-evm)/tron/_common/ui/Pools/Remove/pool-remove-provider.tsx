'use client'

import { FC, createContext, useContext, useMemo, useReducer } from 'react'

type Action =
  | { type: 'setPercentage'; value: number }
  | { type: 'setIsTxnPending'; value: boolean }
  | { type: 'setAmountToken0PerLP'; value: string }
  | { type: 'setAmountToken1PerLP'; value: string }
  | { type: 'setTotalSupplyLP'; value: string }
  | { type: 'setLPBalance'; value: string }
  | { type: 'setLPToRemove'; value: string }
  | { type: 'setMinAmountToken0'; value: string }
  | { type: 'setMinAmountToken1'; value: string }

type Dispatch = {
  setIsTxnPending(isPending: boolean): void
  setPercentage(percentage: number): void
  setAmountToken0PerLP(amount: string): void
  setAmountToken1PerLP(amount: string): void
  setTotalSupplyLP(amount: string): void
  setLPBalance(amount: string): void
  setLPToRemove(amount: string): void
  setMinAmountToken0(amount: string): void
  setMinAmountToken1(amount: string): void
}

type State = {
  percentage: number
  isTxnPending: boolean
  amountToken0PerLP: string
  amountToken1PerLP: string
  totalSupplyLP: string
  lpBalance: string
  lpToRemove: string
  minAmountToken0: string
  minAmountToken1: string
}

type RemoveProviderProps = { children: React.ReactNode }

const RemoveContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function removeReducer(_state: State, action: Action) {
  switch (action.type) {
    case 'setPercentage': {
      return { ..._state, percentage: action.value }
    }
    case 'setIsTxnPending': {
      return { ..._state, isTxnPending: action.value }
    }
    case 'setAmountToken0PerLP': {
      return { ..._state, amountToken0PerLP: action.value }
    }
    case 'setAmountToken1PerLP': {
      return { ..._state, amountToken1PerLP: action.value }
    }
    case 'setTotalSupplyLP': {
      return { ..._state, totalSupplyLP: action.value }
    }
    case 'setLPBalance': {
      return { ..._state, lpBalance: action.value }
    }
    case 'setLPToRemove': {
      return { ..._state, lpToRemove: action.value }
    }
    case 'setMinAmountToken0': {
      return { ..._state, minAmountToken0: action.value }
    }
    case 'setMinAmountToken1': {
      return { ..._state, minAmountToken1: action.value }
    }
  }
}

const RemoveProvider: FC<RemoveProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(removeReducer, {
    percentage: 0, //0-100
    isTxnPending: false,
    amountToken0PerLP: '', //will be formatted, will not be in wei amount
    amountToken1PerLP: '', //will be formatted, will not be in wei amount
    totalSupplyLP: '', //will be in wei
    lpBalance: '', //will be in wei
    lpToRemove: '', //will be in wei
    minAmountToken0: '', //will be in wei
    minAmountToken1: '', //will be in wei
  })

  const dispatchWithAction = useMemo(
    () => ({
      setPercentage: (value: number) =>
        dispatch({ type: 'setPercentage', value }),
      setIsTxnPending: (value: boolean) =>
        dispatch({ type: 'setIsTxnPending', value }),
      setAmountToken0PerLP: (value: string) =>
        dispatch({ type: 'setAmountToken0PerLP', value }),
      setAmountToken1PerLP: (value: string) =>
        dispatch({ type: 'setAmountToken1PerLP', value }),
      setTotalSupplyLP: (value: string) =>
        dispatch({ type: 'setTotalSupplyLP', value }),
      setLPBalance: (value: string) =>
        dispatch({ type: 'setLPBalance', value }),
      setLPToRemove: (value: string) =>
        dispatch({ type: 'setLPToRemove', value }),
      setMinAmountToken0: (value: string) =>
        dispatch({ type: 'setMinAmountToken0', value }),
      setMinAmountToken1: (value: string) =>
        dispatch({ type: 'setMinAmountToken1', value }),
    }),
    [],
  )

  return (
    <RemoveContext.Provider
      value={useMemo(() => {
        return { state, dispatch: dispatchWithAction }
      }, [state, dispatchWithAction])}
    >
      {children}
    </RemoveContext.Provider>
  )
}

const useRemoveContext = () => {
  const context = useContext(RemoveContext)
  if (!context) {
    throw new Error('Hook can only be used inside Remove Liq Provider')
  }

  return context
}

const useRemoveLiqState = () => {
  const context = useRemoveContext()
  return context.state
}

const useRemoveLiqDispatch = () => {
  const context = useRemoveContext()
  return context.dispatch
}

export { RemoveProvider, useRemoveLiqState, useRemoveLiqDispatch }
