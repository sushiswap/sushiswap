import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { FC, useMemo } from 'react'
import { formatUSD } from 'sushi/format'
import { formatNumberWithDecimals } from '~aptos/_common/lib/common/format-number-with-decimals'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { useStablePrice } from '~aptos/_common/lib/common/use-stable-price'
import { useTokenBalance } from '~aptos/_common/lib/common/use-token-balances'
import { useTotalSupply } from '~aptos/_common/lib/common/use-total-supply'
import { PoolExtended } from '~aptos/pool/lib/use-pools-extended'
import { useTokensFromPool } from '~aptos/pool/lib/use-tokens-from-pool'
import { Row } from '../../types'

export const PoolMyPositionTVLCell: FC<Row<PoolExtended>> = ({ row }) => {
  const {
    contracts: { swap: swapContract },
  } = useNetwork()

  const { token0, token1 } = useTokensFromPool(row)
  const tokenAddress = row?.id
  const { account } = useWallet()

  const { data: liquidityBalance } = useTokenBalance({
    account: account?.address as string,
    currency: `${swapContract}::swap::LPToken<${tokenAddress}>`,
    enabled: Boolean(swapContract && account?.address && tokenAddress),
    refetchInterval: 2000,
  })

  const { data: coinInfo } = useTotalSupply(
    `${row?.token0?.address},${row?.token1?.address}`,
  )

  const totalSupply = coinInfo?.data?.supply?.vec?.[0]?.integer?.vec?.[0]?.value

  const [reserve0, reserve1] = useMemo(() => {
    return [row?.reserve0, row?.reserve1]
  }, [row])

  const currencyABalance = useMemo(() => {
    return token0
      ? liquidityBalance
        ? Math.floor(
            (Number(reserve0) * Math.floor(liquidityBalance)) /
              Number(totalSupply),
          )
        : 0
      : undefined
  }, [liquidityBalance, reserve0, token0, totalSupply])

  const currencyBBalance = useMemo(() => {
    return token1
      ? liquidityBalance
        ? Math.floor(
            (Number(reserve1) * Math.floor(liquidityBalance)) /
              Number(totalSupply),
          )
        : 0
      : undefined
  }, [liquidityBalance, reserve1, token1, totalSupply])

  const token0Price = useStablePrice({ currency: token0 }) ?? 0
  const token1Price = useStablePrice({ currency: token1 }) ?? 0

  const userPositionTvl =
    token0 && token1
      ? token0Price *
          Number(
            formatNumberWithDecimals(Number(currencyABalance), token0.decimals),
          ) +
        token1Price *
          Number(
            formatNumberWithDecimals(Number(currencyBBalance), token1.decimals),
          )
      : 0

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
          {currencyABalance && currencyBBalance
            ? formatUSD(userPositionTvl)
            : formatUSD(0)}
        </span>
      </div>
    </div>
  )
}
