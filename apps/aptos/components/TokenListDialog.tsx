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
import { Token } from 'utils/tokenType'
import { useCustomTokens } from 'utils/useCustomTokens'
import { useSortedTokenList } from 'utils/useSortedTokenList'
import useTokenWithCache from 'utils/useTokenWithCache'
import { useTokens } from 'utils/useTokens'
import TokenListItem from './TokenListItem'
import { TokenSelectorImportRow } from './TokenSelectorImportRow'

type RowCallback = (row: {
  index: number
  style: CSSProperties
}) => ReactElement
interface PropType {
  id: string
  children: ReactNode
  selected: Token
  alteredSelected: Token
  handleChangeToken: (token: Token) => void
  handleSwap: () => void
}

export default function TokenListDialog({
  id,
  children,
  selected,
  alteredSelected,
  handleSwap,
  handleChangeToken,
}: PropType) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { data: tokens } = useTokens()
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
      handleChangeToken(currency)
    },
    [handleChangeToken, customTokenMutate],
  )

  const _handleChangeToken = useCallback(
    (token: Token) => {
      handleChangeToken(token)
      setOpen(false)
    },
    [handleChangeToken],
  )

  const Row = useCallback<RowCallback>(
    ({ index, style }) => {
      return (
        <>
          <TokenListItem
            style={style}
            token={sortedTokenList ? sortedTokenList[index] : ({} as Token)}
            selected={selected?.address === sortedTokenList?.[index]?.address}
            alteredSelected={alteredSelected}
            handleChangeToken={_handleChangeToken}
            id={id}
            handleSwap={handleSwap}
          />
        </>
      )
    },
    [
      selected,
      sortedTokenList,
      alteredSelected,
      _handleChangeToken,
      handleSwap,
      id,
    ],
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
