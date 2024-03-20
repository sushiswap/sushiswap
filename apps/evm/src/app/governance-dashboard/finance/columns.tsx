import { Currency, Progress, SkeletonText } from '@sushiswap/ui'
import { ColumnDef } from '@tanstack/react-table'
import { formatNumber } from 'sushi'
import { Native, Token } from 'sushi/currency'
import { TreasuryBalance } from '../../../lib/governance-dashboard'

export const TOKEN_COLUMN: ColumnDef<TreasuryBalance, unknown> = {
  id: 'token',
  header: 'Token',
  accessorFn: (row) => row.token,
  cell: (props) => {
    const token = props.row.original.token
    const currency = token.isNative
      ? Native.onChain(token.chainId)
      : new Token(token)

    return (
      <div className="flex items-center gap-2 font-medium">
        <Currency.Icon currency={currency} width={24} height={24} />
        {currency.symbol}
      </div>
    )
  },
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const PORTFOLIO_SHARE_COLUMN: ColumnDef<TreasuryBalance, unknown> = {
  id: 'portfolioShare',
  header: 'Portfolio Share',
  accessorFn: (row) => row.portfolioShare,
  cell: (props) => (
    <Progress
      value={props.row.original.portfolioShare * 100}
      className="w-20 md:w-[100px] bg-slate-900/20 dark:bg-slate-50/20"
    />
  ),
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const BALANCE_USD_COLUMN: ColumnDef<TreasuryBalance, unknown> = {
  id: 'balanceUSD',
  header: 'Value',
  accessorFn: (row) => row.balanceUSD,
  cell: (props) => `${formatNumber(props.row.original.balanceUSD)}`,
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const BALANCE_COLUMN: ColumnDef<TreasuryBalance, unknown> = {
  id: 'balance',
  header: 'Tokens',
  accessorFn: (row) => row.balance,
  cell: (props) => `${formatNumber(props.row.original.balance)}`,
  meta: {
    skeleton: <SkeletonText />,
  },
}

export const PRICE_COLUMN: ColumnDef<TreasuryBalance, unknown> = {
  id: 'price',
  header: 'Price',
  accessorFn: (row) => row.price,
  cell: (props) =>
    `${props.row.original.price.toLocaleString('EN', {
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'USD',
    })}`,
  meta: {
    skeleton: <SkeletonText />,
  },
}
