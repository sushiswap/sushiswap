import { TokenListChainId } from '@sushiswap/graph-client/data-api'
import { List } from '@sushiswap/ui'
import type { Type } from 'sushi/currency'
import { useAccount } from 'wagmi'
import { usePrices } from '~evm/_common/ui/price-provider/price-provider/use-prices'
import { useMyTokens } from '../hooks/use-my-tokens'
import {
  TokenSelectorCurrencyList,
  TokenSelectorCurrencyListLoading,
} from './common/token-selector-currency-list'

interface TokenSelectorMyTokens {
  chainId: TokenListChainId
  onSelect(currency: Type): void
  selected: Type | undefined
  includeNative?: boolean
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="text-sm">My Tokens</div>
      <List.Control className="flex flex-1">
        <div className="flex-1 block">{children}</div>
      </List.Control>
    </div>
  )
}

export function TokenSelectorMyTokens({
  chainId,
  onSelect,
  selected,
  includeNative,
}: TokenSelectorMyTokens) {
  const { address } = useAccount()

  const { data, isError, isLoading } = useMyTokens({
    chainId,
    account: address,
    includeNative,
  })

  const { data: pricesMap } = usePrices({
    chainId,
  })

  if (isLoading)
    return (
      <Shell>
        <TokenSelectorCurrencyListLoading count={10} />
      </Shell>
    )

  if (isError)
    return (
      <Shell>
        <div className="flex w-full justify-center py-3">
          An error has occurred.
        </div>
      </Shell>
    )

  if (!data.balanceMap?.size)
    return (
      <Shell>
        <div className="flex w-full justify-center py-3">
          No balances found.
        </div>
      </Shell>
    )

  return (
    <Shell>
      <TokenSelectorCurrencyList
        id="trending"
        selected={selected}
        onSelect={onSelect}
        // pin={{}}
        currencies={data.tokens}
        chainId={chainId}
        balancesMap={data.balanceMap}
        pricesMap={pricesMap}
        isBalanceLoading={!data.balanceMap}
      />
    </Shell>
  )
}
