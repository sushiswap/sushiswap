import { CardItem } from '@sushiswap/ui'
import React from 'react'
import { Token } from 'utils/tokenType'
import { Icon } from './Icon'

interface CardCurrencyAmountItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  currency: Token
  amount?: number
  fiatValue?: string
}

const CardCurrencyAmountItem = React.forwardRef<
  HTMLDivElement,
  CardCurrencyAmountItemProps
>(({ currency, isLoading, amount, fiatValue, ...props }, ref) => {
  if (isLoading) {
    return <CardItem ref={ref} skeleton />
  }

  return (
    <CardItem
      title={
        <div className="font-medium flex items-center gap-2 text-muted-foreground">
          <Icon currency={currency} width={18} height={18} />
          {currency.symbol}
        </div>
      }
      ref={ref}
      {...props}
    >
      <span className="flex gap-1 font-semibold">
        {amount}{' '}
        <span className="font-normal text-gray-400 dark:text-slate-600">
          {fiatValue}
        </span>
      </span>
    </CardItem>
  )
})
CardCurrencyAmountItem.displayName = 'CardCurrencyAmountItem'

export { CardCurrencyAmountItem }
