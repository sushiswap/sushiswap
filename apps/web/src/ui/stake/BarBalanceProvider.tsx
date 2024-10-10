'use client'

import { FC, ReactNode, createContext, useContext, useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import { Amount, SUSHI, Type, XSUSHI } from 'sushi/currency'
import { useAccount } from 'wagmi'
import { useAmountBalance } from '~evm/_common/ui/balance-provider/use-balance'

interface BarBalanceContext {
  sushiBalance: Amount<Type>
  xSushiBalance: Amount<Type>
  isConnected: boolean
  isLoading: boolean
  isError: boolean
}

const Context = createContext<BarBalanceContext | undefined>(undefined)

export const BarBalanceProvider: FC<{
  children: ReactNode
  watch?: boolean
}> = ({ children }) => {
  const { isConnected } = useAccount()

  const {
    data: sushiBalance,
    isLoading: isSushiBalanceLoading,
    isError: isSushiBalanceError,
  } = useAmountBalance(SUSHI[ChainId.ETHEREUM])

  const {
    data: xSushiBalance,
    isLoading: isXSushiBalanceLoading,
    isError: isXSushiBalanceError,
  } = useAmountBalance(XSUSHI[ChainId.ETHEREUM])

  return (
    <Context.Provider
      value={useMemo(
        () => ({
          sushiBalance:
            sushiBalance ?? Amount.fromRawAmount(SUSHI[ChainId.ETHEREUM], 0),
          xSushiBalance:
            xSushiBalance ?? Amount.fromRawAmount(XSUSHI[ChainId.ETHEREUM], 0),
          isConnected,
          isLoading:
            isConnected && (isSushiBalanceLoading || isXSushiBalanceLoading),
          isError: isConnected && (isSushiBalanceError || isXSushiBalanceError),
        }),
        [
          sushiBalance,
          xSushiBalance,
          isConnected,
          isSushiBalanceLoading,
          isXSushiBalanceLoading,
          isSushiBalanceError,
          isXSushiBalanceError,
        ],
      )}
    >
      {children}
    </Context.Provider>
  )
}

export const useBarBalance = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('Hook can only be used inside BarBalance Context')
  }

  return context
}
