import { CardItem } from '@sushiswap/ui'
import { formatUSD } from 'sushi/format'
import { formatUnits } from '~tron/_common/lib/utils/formatters'
import { IToken } from '~tron/_common/types/token-type'
import { Icon } from '~tron/_common/ui/General/Icon'

export const LiquidityItem = ({
  isLoading,
  token,
  amount,
  usdAmount,
}: {
  isLoading: boolean
  token: IToken | undefined
  amount: string
  usdAmount: string
}) => {
  if (isLoading || !token) {
    return <CardItem skeleton={true} />
  }
  return (
    <CardItem
      title={
        <div className="font-medium flex items-center gap-2 text-muted-foreground">
          <Icon currency={token} width={18} height={18} />
          {token?.symbol}
        </div>
      }
    >
      <span className="flex gap-1 font-semibold">
        {+amount > 0 ? formatUnits(amount, token.decimals, 4) : 0}{' '}
        <span className="font-normal text-gray-400 dark:text-slate-600">
          {formatUSD(usdAmount)}
        </span>
      </span>
    </CardItem>
  )
}
