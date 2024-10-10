import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  List,
  TextField,
} from '@sushiswap/ui'
import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { DialogHeader, DialogTitle, DialogTrigger } from '@sushiswap/ui'
import { classNames } from '@sushiswap/ui'
import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { useBaseTokens } from '~aptos/_common/lib/common/use-base-tokens'
import { useCustomTokens } from '~aptos/_common/lib/common/use-custom-tokens'
import { useSortedTokenList } from '~aptos/_common/lib/common/use-sorted-token-list'
import { useTokenWithCache } from '~aptos/_common/lib/common/use-token-with-cache'
import { Token } from '~aptos/_common/lib/types/token'
import { TokenSelectorImportRow } from './token-selector-import-row'
import { TokenListItem } from './token-selector-list-item'

type RowCallback = (row: {
  index: number
  style: CSSProperties
}) => ReactElement

interface PropType {
  id: string
  selected: Token
  onSelect: (token: Token) => void
  children: ReactNode
}

export default function TokenSelector({
  id,
  selected,
  children,
  onSelect,
}: PropType) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { data: tokens } = useBaseTokens()
  const { data: customTokens, mutate: customTokenMutate } = useCustomTokens()
  const { data: queryToken, isInitialLoading: isQueryTokenLoading } =
    useTokenWithCache({
      address: query,
      enabled:
        (query.startsWith('0x') && query.length > 65) ||
        query === '0x1::aptos_coin::AptosCoin',
      keepPreviousData: false,
    })

  const { data: sortedTokenList } = useSortedTokenList({
    query,
    tokenMap: tokens,
    customTokenMap: customTokens,
  })

  const handleImport = useCallback(
    (currency: Token) => {
      customTokenMutate('add', [currency])
      onSelect(currency)
    },
    [onSelect, customTokenMutate],
  )

  const _onSelect = useCallback(
    (token: Token) => {
      onSelect(token)
      setOpen(false)
    },
    [onSelect],
  )

  const Row = useCallback<RowCallback>(
    ({ index, style }) => {
      return (
        <>
          <TokenListItem
            style={style}
            token={sortedTokenList ? sortedTokenList[index] : ({} as Token)}
            selected={selected?.address === sortedTokenList?.[index]?.address}
            onSelect={_onSelect}
            id={id}
          />
        </>
      )
    },
    [selected, sortedTokenList, _onSelect, id],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="!flex flex-col justify-start min-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>
            Select a token from our default list or search for a token by symbol
            or address.
          </DialogDescription>
        </DialogHeader>
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
        <List.Control className="relative flex flex-1 flex-col flex-grow gap-3 px-1 py-0.5 min-h-[128px]">
          <div
            data-state={isQueryTokenLoading ? 'active' : 'inactive'}
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
            data-state={isQueryTokenLoading ? 'inactive' : 'active'}
            className={classNames(
              'data-[state=active]:block data-[state=active]:flex-1 data-[state=inactive]:hidden',
            )}
          >
            {queryToken &&
              !customTokens[`${queryToken.address}`] &&
              !tokens?.[`${queryToken.address}`] && (
                <TokenSelectorImportRow
                  token={queryToken}
                  onImport={() => {
                    queryToken && handleImport(queryToken)
                    close()
                  }}
                />
              )}
            <AutoSizer disableWidth>
              {({ height }: { height: number }) => (
                <FixedSizeList
                  width="100%"
                  height={height}
                  itemCount={sortedTokenList ? sortedTokenList?.length : 0}
                  itemSize={64}
                  className={'scroll'}
                  style={{ overflow: 'overlay' }}
                >
                  {Row}
                </FixedSizeList>
              )}
            </AutoSizer>
            {sortedTokenList?.length === 0 && !queryToken && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="flex items-center text-xs text-gray-500 dark:text-slate-500">
                    No tokens found on{' '}
                    <span className="font-medium">APTOS</span>.
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    Did you try searching with the token address?
                  </span>
                </div>
              </div>
            )}
          </div>
        </List.Control>
      </DialogContent>
    </Dialog>
  )
}
