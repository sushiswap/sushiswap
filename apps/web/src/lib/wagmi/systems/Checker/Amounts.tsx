'use client'

import { Button, ButtonProps } from '@sushiswap/ui'
import { FC, useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import { Amount, Type } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { useAmountBalances } from '~evm/_common/ui/balance-provider/use-balances'

type AmountsProps = ButtonProps & {
  chainId: ChainId | undefined
} & (
    | { amounts: (Amount<Type> | undefined)[]; amount?: undefined }
    | { amounts?: undefined; amount: Amount<Type> | undefined }
  )

const Amounts: FC<AmountsProps> = ({
  type: _type,
  amounts: _amounts,
  amount,
  chainId,
  children,
  fullWidth = true,
  size = 'xl',
  ...props
}) => {
  const amounts = useMemo(() => {
    if (_amounts) return _amounts
    return [amount]
  }, [_amounts, amount])

  const amountsAreDefined = useMemo(
    () => amounts.every((el) => el?.greaterThan(ZERO)),
    [amounts],
  )
  const currencies = useMemo(
    () => amounts.map((amount) => amount?.currency),
    [amounts],
  )

  const { data: balances } = useAmountBalances(chainId, currencies)

  const sufficientBalance = useMemo(() => {
    return amounts?.every((amount) => {
      if (!amount) return true
      return !balances?.get(amount.currency.id)?.lessThan(amount)
    })
  }, [amounts, balances])

  if (!amountsAreDefined)
    return (
      <Button
        id="amount-checker"
        disabled={true}
        fullWidth={fullWidth}
        size={size}
        {...props}
      >
        Enter Amount
      </Button>
    )

  if (!sufficientBalance)
    return (
      <Button
        id="amount-checker"
        disabled={true}
        fullWidth={fullWidth}
        size={size}
        {...props}
      >
        Insufficient Balance
      </Button>
    )

  return <>{children}</>
}

export { Amounts, type AmountsProps }
