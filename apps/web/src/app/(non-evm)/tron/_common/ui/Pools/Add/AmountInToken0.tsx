import { ComponentProps, useEffect, useMemo } from 'react'
import {
  formatUnitsForInput,
  parseUnits,
} from '~tron/_common/lib/utils/formatters'
import { getToken1AmountForLiquidity } from '~tron/_common/lib/utils/helpers'
import { TokenInput } from '~tron/_common/ui/Input/TokenInput'
import { usePoolDispatch, usePoolState } from '../pool-provider'

export const AmountInToken0 = ({
  theme = 'default',
  disabled = false,
}: {
  theme?: ComponentProps<typeof TokenInput>['theme']
  disabled?: boolean
}) => {
  const {
    token0,
    token1,
    amountInToken0,
    reserve0,
    reserve1,
    pairAddress,
    inputField,
  } = usePoolState()
  const { setToken0, setAmountInToken0, setAmountInToken1, setInputField } =
    usePoolDispatch()

  const pairExists = !!pairAddress

  const rateOfToken1 = useMemo(() => {
    if (!reserve0 || !reserve1) return
    if (!token0 || !token1) return
    return getToken1AmountForLiquidity(
      parseUnits(amountInToken0 ?? 0, token0?.decimals),
      reserve0,
      reserve1,
    )
  }, [token0, token1, reserve0, reserve1, amountInToken0])

  useEffect(() => {
    if (inputField === 'token1') {
      return
    }
    if (pairExists && amountInToken0 === '') {
      setAmountInToken1('')
      return
    }
    if (pairExists && rateOfToken1 && rateOfToken1 !== 'NaN' && token1) {
      const amountFormatted = formatUnitsForInput(
        rateOfToken1,
        token1?.decimals,
      )
      if (amountFormatted) {
        setAmountInToken1(amountFormatted)
      } else {
        setAmountInToken1('')
      }
    }
  }, [
    amountInToken0,
    pairExists,
    rateOfToken1,
    token1,
    inputField,
    setAmountInToken1,
  ])

  const setAmount = (amount: string) => {
    setInputField('token0')
    setAmountInToken0(amount)
  }

  return (
    <TokenInput
      theme={theme}
      type="input"
      amount={amountInToken0}
      setAmount={setAmount}
      currency={token0}
      setToken={disabled ? undefined : setToken0}
    />
  )
}
