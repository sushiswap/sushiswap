import { ComponentProps, useEffect, useMemo } from 'react'
import {
  formatUnitsForInput,
  parseUnits,
} from '~tron/_common/lib/utils/formatters'
import { getToken0AmountForLiquidity } from '~tron/_common/lib/utils/helpers'
import { TokenInput } from '~tron/_common/ui/Input/TokenInput'
import { usePoolDispatch, usePoolState } from '../pool-provider'

export const AmountInToken1 = ({
  theme = 'default',
  disabled = false,
}: {
  theme?: ComponentProps<typeof TokenInput>['theme']
  disabled?: boolean
}) => {
  const {
    token0,
    token1,
    amountInToken1,
    pairAddress,
    reserve0,
    reserve1,
    inputField,
  } = usePoolState()
  const { setToken1, setAmountInToken1, setAmountInToken0, setInputField } =
    usePoolDispatch()

  const pairExists = !!pairAddress

  const rateOfToken0 = useMemo(() => {
    if (!reserve0 || !reserve1) return
    if (!token0 || !token1) return
    return getToken0AmountForLiquidity(
      parseUnits(amountInToken1 ?? 0, token1?.decimals),
      reserve0,
      reserve1,
    )
  }, [token0, token1, reserve0, reserve1, amountInToken1])

  useEffect(() => {
    if (inputField === 'token0') {
      return
    }
    if (pairExists && amountInToken1 === '') {
      setAmountInToken0('')
      return
    }
    if (pairExists && rateOfToken0 && rateOfToken0 !== 'NaN' && token0) {
      const amountFormatted = formatUnitsForInput(
        rateOfToken0,
        token0?.decimals,
      )
      if (amountFormatted) {
        setAmountInToken0(amountFormatted)
      } else {
        setAmountInToken0('')
      }
    }
  }, [
    amountInToken1,
    pairExists,
    rateOfToken0,
    token0,
    inputField,
    setAmountInToken0,
  ])

  const setAmount = (amount: string) => {
    setInputField('token1')
    setAmountInToken1(amount)
  }

  return (
    <TokenInput
      theme={theme}
      type="input"
      amount={amountInToken1}
      setAmount={setAmount}
      currency={token1}
      setToken={disabled ? undefined : setToken1}
    />
  )
}
