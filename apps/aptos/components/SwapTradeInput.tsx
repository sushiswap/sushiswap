import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useIsMounted } from '@sushiswap/hooks'
import { useSwapActions, useSwapState } from 'app/swap/trade/TradeProvider'
import React, { useEffect, useRef } from 'react'
import { useSwapRouter } from 'utils/useSwapRouter'
import { useTokenBalance } from 'utils/useTokenBalance'
import TradeInput from './TradeInput'

interface Props {
  handleSwap: () => void
}

export const SwapTradeInput = ({ handleSwap }: Props) => {
  const { connected, account } = useWallet()
  const tradeVal = useRef<HTMLInputElement>(null)
  const isMounted = useIsMounted()
  const { amount, token0, token1, error } = useSwapState()
  const { data: balance, isLoading: isPriceLoading } = useTokenBalance({
    account: account?.address as string,
    currency: token0?.address,
    refetchInterval: 2000,
  })
  const {
    setAmount,
    setError,
    setToken0,
    setOutputAmount,
    setPriceFetching,
    setSlippageAmount,
    setBestRoutes,
    setNoRouteFound,
  } = useSwapActions()

  const { data: routes, isFetching: isPriceFetching } = useSwapRouter({
    balance,
  })

  useEffect(() => {
    setOutputAmount('')
    setSlippageAmount(0)
    setNoRouteFound('')
    setPriceFetching(isPriceFetching)
    if (Number(amount) > 0) {
      if (routes?.amountOut) {
        setOutputAmount(String(routes?.amountOut))
        setSlippageAmount(routes?.amountOut)
      }
      if (routes?.route) {
        setBestRoutes(routes?.route)
        setNoRouteFound('')
      } else {
        setBestRoutes([])
        setNoRouteFound('No trade found')
      }
    }
  }, [amount, routes, isPriceFetching])

  const checkBalance = (value: string) => {
    setAmount(value)
    if (connected && balance) {
      const priceEst = balance / 10 ** token0?.decimals < parseFloat(value)
      if (priceEst) {
        setError('Exceeds Balance')
      } else {
        setError('')
      }
    } else {
      setError('')
    }
  }

  useEffect(() => {
    checkBalance(String(amount))
  }, [token0, token1, balance])

  if (!isMounted) return <></>

  return (
    <TradeInput
      id="swap-from"
      type="INPUT"
      setToken={setToken0}
      token={token0}
      alteredSelected={token1}
      value={String(amount)}
      balance={balance}
      error={error}
      isLoadingPrice={isPriceLoading}
      onUserInput={checkBalance}
      tradeVal={tradeVal}
      setAmount={setAmount}
      handleSwap={handleSwap}
      className="border border-accent p-3 bg-white dark:bg-slate-800 rounded-xl"
    />
  )
}
