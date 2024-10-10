import { TokenListChainId } from '@sushiswap/graph-client/data-api'
import { useCustomTokens } from '@sushiswap/hooks'
import { List } from '@sushiswap/ui'
import { useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import type { Type } from 'sushi/currency'
import type { Address } from 'viem'
import { usePrices } from '~evm/_common/ui/price-provider/price-provider/use-prices'
import { useSearchTokens } from '../hooks/use-search-tokens'
import {
  TokenSelectorCurrencyList,
  TokenSelectorCurrencyListLoading,
} from './common/token-selector-currency-list'

interface TokenSelectorSearch {
  chainId: TokenListChainId
  search: string
  onSelect(currency: Type): void
  selected: Type | undefined
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <List.Control className="flex flex-1">
        <div className="flex-1 block">{children}</div>
      </List.Control>
    </div>
  )
}

const emptyMap = new Map()
const pageSize = 20

export function TokenSelectorSearch({
  chainId,
  search,
  selected,
  onSelect,
}: TokenSelectorSearch) {
  const { data, isError, isLoading, fetchNextPage, hasMore } = useSearchTokens({
    chainId,
    search,
    pagination: {
      initialPage: 0,
      pageSize,
    },
  })

  const { data: pricesMap } = usePrices({ chainId })

  const { data: _customTokens, mutate } = useCustomTokens()
  const customTokens = useMemo(
    () =>
      Object.values(_customTokens)
        .filter((t) => t.chainId === chainId)
        .map((t) => t.address),
    [_customTokens, chainId],
  )

  const importableSet = useMemo(() => {
    const set = new Set<Address>()

    if (data) {
      data.forEach((token) => {
        if (!customTokens.includes(token.address) && token.approved === false) {
          set.add(token.address.toLowerCase() as Address)
        }
      })
    }

    return set
  }, [customTokens, data])

  if (isLoading) {
    return (
      <Shell>
        <TokenSelectorCurrencyListLoading count={20} />
      </Shell>
    )
  }

  if (isError) {
    return (
      <Shell>
        <div className="flex w-full justify-center pt-3">
          An error has occurred.
        </div>
      </Shell>
    )
  }

  if (!data || !data.length) {
    return (
      <Shell>
        <div className="flex w-full justify-center pt-3">No tokens found.</div>
      </Shell>
    )
  }

  return (
    <Shell>
      <InfiniteScroll
        dataLength={data.length}
        hasMore={hasMore}
        loader={<TokenSelectorCurrencyListLoading count={pageSize} />}
        next={fetchNextPage}
        // 3/4 of the last page
        scrollThreshold={`${64 * (pageSize + 5)}px`}
        scrollableTarget="token-list-container"
        className="!overflow-visible"
      >
        <div>
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
            importConfig={{
              importableSet,
              onImport: (token) => {
                mutate('add', [token])
                onSelect(token)
              },
            }}
          />
        </div>
      </InfiniteScroll>
    </Shell>
  )
}
