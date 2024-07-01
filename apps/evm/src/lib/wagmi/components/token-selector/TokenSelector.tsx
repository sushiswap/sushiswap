'use client'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import {
  DEFAULT_BASES,
  useCustomTokens,
  useDebounce,
  usePinnedTokens,
} from '@sushiswap/hooks'
import {
  NativeAddress,
  useBalances,
  useOtherTokenListsQuery,
  usePrices,
  useTokens,
} from '@sushiswap/react-query'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceEventName,
  InterfaceModalName,
  Trace,
  TraceEvent,
} from '@sushiswap/telemetry'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IconButton,
  TextField,
  classNames,
  gtagEvent,
} from '@sushiswap/ui'
import { Button, buttonIconVariants } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui'
import { List } from '@sushiswap/ui'
import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ChainId } from 'sushi/chain'
import { Native, Token, Type } from 'sushi/currency'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useTokenWithCache } from '../../hooks/tokens/useTokenWithCache'
import { TokenSelectorCurrencyList } from './TokenSelectorCurrencyList'
import { TokenSelectorImportRow } from './TokenSelectorImportRow'
import { useSortedTokenList } from './hooks/useSortedTokenList'

interface TokenSelectorProps {
  id: string
  selected: Type | undefined
  chainId: ChainId
  onSelect(currency: Type): void
  children: ReactNode
  currencies?: Record<string, Token>
  includeNative?: boolean
  hidePinnedTokens?: boolean
  hideSearch?: boolean
}

export const TokenSelector: FC<TokenSelectorProps> = ({
  includeNative = true,
  id,
  selected,
  onSelect,
  chainId,
  children,
  currencies,
  hidePinnedTokens,
  hideSearch,
}) => {
  const { address } = useAccount()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const debouncedQuery = useDebounce(query, 250)

  useEffect(() => {
    if (debouncedQuery) gtagEvent('token-search', { query: debouncedQuery })
  }, [debouncedQuery])

  const { data: customTokenMap, mutate: customTokenMutate } = useCustomTokens()
  const {
    data: pinnedTokenMap,
    mutate: pinnedTokenMutate,
    hasToken: isTokenPinned,
  } = usePinnedTokens()
  const { data: defaultTokenMap, isLoading: isTokensLoading } = useTokens({
    chainId,
  })
  const { data: otherTokenMap, isLoading: isOtherTokensLoading } =
    useOtherTokenListsQuery({ chainId, query: debouncedQuery })
  const { data: pricesMap } = usePrices({ chainId })
  const {
    data: balancesMap,
    isInitialLoading: isBalanceLoading,
    refetch,
  } = useBalances({ chainId, account: address, enabled: open })

  const tokenMap = useMemo(() => {
    return {
      ...defaultTokenMap,
      ...otherTokenMap,
    }
  }, [defaultTokenMap, otherTokenMap])

  const officialTokenIds = useMemo(() => {
    if (!defaultTokenMap) return []
    return Object.values(defaultTokenMap).map((el) => el.wrapped.address)
  }, [defaultTokenMap])

  const { data: queryToken, isInitialLoading: isQueryTokenLoading } =
    useTokenWithCache({
      chainId,
      address: query,
      withStatus: false,
      enabled: isAddress(query),
      keepPreviousData: false,
    })

  const { data: sortedTokenList } = useSortedTokenList({
    query: debouncedQuery,
    customTokenMap: currencies ? {} : customTokenMap,
    tokenMap: currencies ? currencies : tokenMap,
    pricesMap,
    balancesMap: balancesMap ?? {},
    chainId,
    includeNative,
  })

  const pinnedTokens = useMemo(() => {
    const pinned = (pinnedTokenMap?.[chainId] ?? [])
      .map((id) => {
        const [, address] = id.split(':')
        if (address === 'NATIVE') return Native.onChain(chainId)
        return tokenMap?.[address] || customTokenMap?.[address]
      })
      .filter((token): token is Token => !!token)
      .map((token) => ({
        token,
        isDefault: false,
      }))

    const defaults = (DEFAULT_BASES[chainId] ?? []).map((token) => ({
      token: token,
      isDefault: true,
    }))

    return [...defaults, ...pinned]
  }, [pinnedTokenMap, tokenMap, chainId, customTokenMap])

  const _onSelect = useCallback(
    (currency: Type) => {
      if (onSelect) {
        onSelect(currency)
      }

      setOpen(false)
    },
    [onSelect],
  )

  const _onPin = useCallback(
    (currencyId: string) => {
      console.debug('onPin', currencyId, isTokenPinned(currencyId))
      if (isTokenPinned(currencyId)) {
        pinnedTokenMutate('remove', currencyId)
      } else {
        pinnedTokenMutate('add', currencyId)
      }
    },
    [pinnedTokenMutate, isTokenPinned],
  )

  const handleImport = useCallback(
    (currency: Token) => {
      customTokenMutate('add', [currency])
      _onSelect(currency)
    },
    [_onSelect, customTokenMutate],
  )

  // Refetch whenever TokenSelector opens
  useEffect(() => {
    if (open && !!address) refetch()
  }, [open, address, refetch])

  const isLoading =
    isTokensLoading || isOtherTokensLoading || isQueryTokenLoading

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="!flex flex-col justify-start min-h-[85vh]">
        <Trace
          name={InterfaceEventName.TOKEN_SELECTOR_OPENED}
          modal={InterfaceModalName.TOKEN_SELECTOR}
          shouldLogImpression
        >
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
            <DialogDescription>
              Select a token from our default list or search for a token by
              symbol or address.
            </DialogDescription>
          </DialogHeader>
          {!hideSearch ? (
            <div className="flex gap-2">
              <TextField
                placeholder="Search by token or address"
                icon={MagnifyingGlassIcon}
                type="text"
                testdata-id={`${id}-address-input`}
                value={query}
                onValueChange={setQuery}
              />
            </div>
          ) : null}

          {pinnedTokens.length > 0 && !hidePinnedTokens ? (
            <div className="flex flex-wrap gap-2">
              {pinnedTokens.map(({ token, isDefault }) => (
                <TraceEvent
                  events={[BrowserEvent.onClick, BrowserEvent.onKeyPress]}
                  name={InterfaceEventName.TOKEN_SELECTED}
                  properties={{
                    token_symbol: token?.symbol,
                    token_address: token?.isNative
                      ? NativeAddress
                      : token?.address,
                    total_balances_usd:
                      balancesMap?.[
                        token?.isNative ? NativeAddress : token?.address
                      ]?.quotient,
                  }}
                  element={InterfaceElementName.COMMON_BASES_CURRENCY_BUTTON}
                  key={token.id}
                >
                  <div className="group">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="group"
                      key={token.id}
                      onClick={() => _onSelect(token)}
                    >
                      <Currency.Icon
                        width={20}
                        height={20}
                        className={buttonIconVariants({ size: 'default' })}
                        currency={token}
                        disableLink
                      />
                      {token.symbol}
                      {!isDefault && (
                        <IconButton
                          size="xs"
                          name="remove"
                          icon={XMarkIcon}
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            _onPin(token.id)
                          }}
                        />
                      )}
                    </Button>
                  </div>
                </TraceEvent>
              ))}
            </div>
          ) : null}

          <List.Control className="relative flex flex-1 flex-col flex-grow gap-3 px-1 py-0.5 min-h-[128px]">
            <div
              data-state={isLoading ? 'active' : 'inactive'}
              className={classNames(
                'data-[state=active]:block data-[state=active]:flex-1 data-[state=inactive]:hidden',
                'py-0.5 h-[64px] -mb-3',
              )}
            >
              <div className="flex items-center w-full h-full px-3 rounded-lg">
                <div className="flex items-center justify-between flex-grow gap-2 rounded">
                  <div className="flex flex-row items-center flex-grow gap-4">
                    <SkeletonCircle radius={40} />
                    <div className="flex flex-col items-start">
                      <SkeletonText className="w-full w-[100px]" />
                      <SkeletonText fontSize="sm" className="w-full w-[60px]" />
                    </div>
                  </div>

                  <div className="flex flex-col w-full">
                    <SkeletonText className="w-[80px]" />
                    <SkeletonText
                      fontSize="sm"
                      align="right"
                      className="w-[40px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              data-state={isLoading ? 'inactive' : 'active'}
              className={classNames(
                'data-[state=active]:block data-[state=active]:flex-1 data-[state=inactive]:hidden',
              )}
            >
              {queryToken &&
                !customTokenMap[
                  `${queryToken.chainId}:${queryToken.wrapped.address}`
                ] &&
                !tokenMap?.[`${queryToken.wrapped.address}`] && (
                  <TokenSelectorImportRow
                    currency={queryToken}
                    onImport={() => queryToken && handleImport(queryToken)}
                  />
                )}
              <TokenSelectorCurrencyList
                selected={selected}
                onSelect={_onSelect}
                id={id}
                pin={{ onPin: _onPin, isPinned: isTokenPinned }}
                officialTokenIds={officialTokenIds}
                currencies={sortedTokenList}
                chainId={chainId}
                balancesMap={balancesMap ?? {}}
                pricesMap={pricesMap}
                isBalanceLoading={isBalanceLoading}
              />
              {sortedTokenList?.length === 0 && !queryToken && chainId && (
                <span className="h-10 flex items-center justify-center text-center text-sm text-gray-500 dark:text-slate-500">
                  No results found.
                </span>
              )}
            </div>
          </List.Control>
        </Trace>
      </DialogContent>
    </Dialog>
  )
}
