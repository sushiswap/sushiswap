import React, { useEffect, useTransition } from 'react'
import { CurrencyInput } from '~aptos/_common/ui/currency/currency-input/currency-input'
import { useSwap } from '~aptos/swap/lib/use-swap'
import {
  useSimpleSwapActions,
  useSimpleSwapState,
} from '~aptos/swap/ui/simple/simple-swap-provider/simple-swap-provider'

export const SimpleSwapToken0Input = () => {
  const [, startTransition] = useTransition()

  const { amount, token0 } = useSimpleSwapState()

  const {
    setAmount,
    setToken0,
    setOutputAmount,
    setPriceFetching,
    setSlippageAmount,
    setBestRoutes,
    setNoRouteFound,
  } = useSimpleSwapActions()

  const { data: route, isFetching: isPriceFetching } = useSwap()

  useEffect(() => {
    startTransition(() => {
      setOutputAmount('')
      setSlippageAmount(0)
      setNoRouteFound('')
      setPriceFetching(isPriceFetching)
      if (Number(amount) > 0) {
        if (route?.amountOut) {
          setOutputAmount(String(route?.amountOut))
          setSlippageAmount(route?.amountOut)
        }
        if (route?.route) {
          setBestRoutes(route?.route)
          setNoRouteFound('')
        } else {
          setBestRoutes([])
          setNoRouteFound('No trade found')
        }
      }
    })
  }, [
    amount,
    route,
    isPriceFetching,
    setSlippageAmount,
    setBestRoutes,
    setNoRouteFound,
    setOutputAmount,
    setPriceFetching,
  ])

  return (
    <CurrencyInput
      id="swap-from"
      type="INPUT"
      onSelect={setToken0}
      token={token0}
      value={String(amount)}
      onChange={setAmount}
      className="border border-accent p-3 bg-white dark:bg-slate-800 rounded-xl"
      label="Sell"
    />
  )
}
