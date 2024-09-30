import { useSwapDispatch, useSwapState } from '~tron/swap/swap-provider'
import { TokenInput } from '../Input/TokenInput'

export const AmountOut = () => {
  const { token1, amountOut } = useSwapState()
  const { setToken1, setAmountOut } = useSwapDispatch()

  return (
    <TokenInput
      className="border border-accent"
      amount={amountOut}
      setAmount={setAmountOut}
      type="output"
      currency={token1}
      setToken={setToken1}
      label="Buy"
    />
  )
}
