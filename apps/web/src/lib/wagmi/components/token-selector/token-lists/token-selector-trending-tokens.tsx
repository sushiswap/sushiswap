import { TrendingTokensChainId } from '@sushiswap/graph-client/data-api'
import { List } from '@sushiswap/ui'
import type { Type } from 'sushi/currency'
import { usePrices } from '~evm/_common/ui/price-provider/price-provider/use-prices'
import { useTrendingTokens } from '../hooks/use-trending-tokens'
import {
  TokenSelectorCurrencyList,
  TokenSelectorCurrencyListLoading,
} from './common/token-selector-currency-list'

interface TokenSelectorTrendingTokens {
  chainId: TrendingTokensChainId
  onSelect(currency: Type): void
  selected: Type | undefined
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col space-y-2">
      <div className="text-sm">Trending Tokens</div>
      <List.Control className="flex flex-1">
        <div className="flex-1 block">{children}</div>
      </List.Control>
    </div>
  )
}

const emptyMap = new Map()

export function TokenSelectorTrendingTokens({
  chainId,
  onSelect,
  selected,
}: TokenSelectorTrendingTokens) {
  const { data, isError, isLoading } = useTrendingTokens({ chainId })

  const { data: pricesMap } = usePrices({ chainId })

  if (isLoading)
    return (
      <Shell>
        <TokenSelectorCurrencyListLoading count={20} />
      </Shell>
    )

  if (isError)
    return (
      <Shell>
        <div className="flex w-full justify-center pt-3">
          An error has occurred.
        </div>
      </Shell>
    )

  if (!data?.length)
    return (
      <Shell>
        <div className="flex w-full justify-center pt-3">No tokens found.</div>
      </Shell>
    )

  return (
    <Shell>
      <TokenSelectorCurrencyList
        id="trending"
        selected={selected}
        onSelect={onSelect}
        // pin={{}}
        currencies={data}
        chainId={chainId}
        balancesMap={emptyMap}
        pricesMap={pricesMap}
        isBalanceLoading={false}
      />
    </Shell>
  )
}
