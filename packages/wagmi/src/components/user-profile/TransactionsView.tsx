import { ArrowLeftIcon, ArrowsRightLeftIcon } from '@heroicons/react/20/solid'
import { Button } from '@sushiswap/ui/components/button'
import React, { Dispatch, FC, SetStateAction, useMemo } from 'react'

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import {
  ClipboardController,
  LinkExternal,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  classNames,
} from '@sushiswap/ui'
import { IconButton } from '@sushiswap/ui/components/iconbutton'
import { format } from 'date-fns'
import groupBy from 'lodash.groupby'
import mapKeys from 'lodash.mapkeys'
import { Chain } from 'sushi/chain'
import {
  isSwapPayload,
  useTransactionDeleter,
  useTransactions,
} from '../../hooks'
import { ProfileView } from './ProfileView'

interface TransactionsProps {
  address: `0x${string}`
  setView: Dispatch<SetStateAction<ProfileView>>
}

const precision = 60 * 60 * 24 * 1000

export const TransactionsView: FC<TransactionsProps> = ({
  setView,
  address,
}) => {
  const { data: transactions } = useTransactions({ account: address })
  const { mutate: clear } = useTransactionDeleter({ account: address })

  const sortedTxs = useMemo(() => {
    const groupedTxs = mapKeys(
      groupBy(transactions, (el) => Math.floor(el.timestamp / precision)),
      (_, val) => {
        return format(Number(val) * precision, 'MMMM do, yyyy')
      },
    )

    return Object.entries(groupedTxs).sort(
      (a, b) => Number(b[0]) - Number(a[0]),
    )
  }, [transactions])

  return (
    <>
      <div className="flex justify-between items-center">
        <IconButton
          size="xs"
          onClick={() => setView(ProfileView.Default)}
          icon={ArrowLeftIcon}
          name="Back"
        />
        <Button
          onClick={() => clear()}
          variant="ghost"
          size="xs"
          className="!px-2"
        >
          Clear all
        </Button>
      </div>
      <div className="space-y-2 divide-y divide-accent">
        {sortedTxs.length > 0 ? (
          sortedTxs.map(([label, value]) => {
            return (
              <div className="flex flex-col gap-2 pt-4">
                <span className="text-muted-foreground text-sm font-medium">
                  {label}
                </span>
                <div className="flex flex-col">
                  {value.reverse().map((el) => {
                    const payload = JSON.parse(el.payload)
                    if (isSwapPayload(payload)) {
                      return (
                        <div
                          className={classNames(
                            el.status !== 'pending'
                              ? 'grid-cols-2'
                              : 'grid-cols-1',
                            'group -ml-4 -mr-4 w-[calc(100%+32px)] hover:bg-secondary px-4 py-3 grid gap-4 justify-between items-center',
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="text-left flex gap-1 items-center text-muted-foreground text-xs font-semibold w-full truncate">
                              <ArrowsRightLeftIcon width={14} height={14} />
                              Swap
                            </div>
                            <div className="font-medium text-sm w-full truncate text-left flex items-center gap-2">
                              {payload.inputToken.symbol} →{' '}
                              {payload.outputToken.symbol}{' '}
                              {el.status === 'pending' ? (
                                <div className="rounded-full px-2 bg-blue text-white text-[10px]">
                                  Pending
                                </div>
                              ) : null}
                            </div>
                          </div>
                          {el.status !== 'pending' ? (
                            <div className="flex flex-col gap-1 items-end">
                              <div className="group-hover:hidden text-muted-foreground text-xs w-full truncate font-semibold text-right">
                                -{payload.inputAmount}{' '}
                                {payload.inputToken.symbol}
                              </div>
                              <div className="gap-2 hidden group-hover:flex justify-end items-center text-muted-foreground text-xs w-full truncate font-semibold text-right">
                                <ClipboardController hideTooltip>
                                  {({ setCopied, isCopied }) => (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() => setCopied(el.hash)}
                                          >
                                            {`${el.hash.substring(
                                              0,
                                              5,
                                            )}...${el.hash.substring(64)}`}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                          <p>{isCopied ? 'Copied!' : 'Copy'}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </ClipboardController>
                                <LinkExternal
                                  href={Chain.from(el.chainId)?.getTxUrl(
                                    el.hash,
                                  )}
                                  className="text-inherit"
                                >
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ArrowTopRightOnSquareIcon
                                          width={16}
                                          height={16}
                                          className="cursor-pointer"
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>View on explorer</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </LinkExternal>
                              </div>
                              <div className="text-green-600 text-sm font-semibold w-full truncate text-right">
                                +{payload.inputAmount}{' '}
                                {payload.outputToken.symbol}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    }
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div className="h-[210px] flex items-center justify-center text-muted-foreground text-xs">
            No transactions found
          </div>
        )}
      </div>
    </>
  )
}
