'use client'

import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { StargateChainId } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'

export interface CrossChainSwapPendingTransaction {
  tradeId: string
  chainId0: StargateChainId
  chainId1: StargateChainId
  txHash: string
  amountIn: Amount<Type>
  amountOut: Amount<Type>
}

interface CrossChainSwapPendingTransactionsActionsState {
  push(transaction: CrossChainSwapPendingTransaction): void
  remove(tradeId: string): void
}

const CrossChainSwapPendingTransactionsStateContext = createContext<
  CrossChainSwapPendingTransaction[]
>([])

const CrossChainSwapPendingTransactionsActionsContext =
  createContext<CrossChainSwapPendingTransactionsActionsState>(
    {} as CrossChainSwapPendingTransactionsActionsState,
  )

export const CrossChainSwapPendingTransactionsProvider: FC<{
  children: ReactNode
}> = ({ children }) => {
  const [pendingTransactions, setPendingTransactions] = useState<
    CrossChainSwapPendingTransaction[]
  >([])

  const push = useCallback((transaction: CrossChainSwapPendingTransaction) => {
    setPendingTransactions((prev) => [...prev, transaction])
  }, [])

  const remove = useCallback((tradeId: string) => {
    setPendingTransactions((prev) => {
      return prev.filter((transaction) => transaction.tradeId !== tradeId)
    })
  }, [])

  return (
    <CrossChainSwapPendingTransactionsActionsContext.Provider
      value={useMemo(() => ({ push, remove }), [push, remove])}
    >
      <CrossChainSwapPendingTransactionsStateContext.Provider
        value={pendingTransactions}
      >
        {children}
      </CrossChainSwapPendingTransactionsStateContext.Provider>
    </CrossChainSwapPendingTransactionsActionsContext.Provider>
  )
}

export const useCrossChainSwapPendingTransactionsProvider = () => {
  return useContext(CrossChainSwapPendingTransactionsStateContext)
}

export const useCrossChainSwapPendingTransactionsActions = () => {
  return useContext(CrossChainSwapPendingTransactionsActionsContext)
}
