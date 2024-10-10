'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Button, ButtonProps } from '@sushiswap/ui'
import { FC, useMemo } from 'react'
import { ZERO } from 'sushi/math'
import { useTokenBalances } from '~aptos/_common/lib/common/use-token-balances'

interface AmountsProps extends ButtonProps {
  amounts: {
    currency: string
    amount: number
  }[]
}

const Amounts: FC<AmountsProps> = ({
  type: _type,
  amounts,
  children,
  ...props
}) => {
  const { account } = useWallet()
  const amountsAreDefined = useMemo(
    () => amounts.every((el) => el.amount > ZERO),
    [amounts],
  )
  const currencies = useMemo(
    () => amounts.map((amount) => amount?.currency),
    [amounts],
  )

  const { data: balances } = useTokenBalances({
    account: account?.address,
    currencies,
    refetchInterval: 2000,
  })

  const sufficientBalance = useMemo(() => {
    if (!balances) return true

    return amounts.every((amount) => {
      const balance = balances[amount.currency]
      if (typeof balance !== 'number') return true

      return balance >= amount.amount
    })
  }, [amounts, balances])

  if (!amountsAreDefined) {
    return (
      <Button id="amount-checker" {...props} disabled>
        Enter Amount
      </Button>
    )
  }

  if (!sufficientBalance) {
    return (
      <Button id="amount-checker" {...props} disabled>
        Insufficient Balance
      </Button>
    )
  }

  return <>{children}</>
}

export { Amounts, type AmountsProps }
