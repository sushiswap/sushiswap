'use client'

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid'
import { LinkExternal, Loader, Timer, classNames } from '@sushiswap/ui'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@sushiswap/ui'
import { useAccount, useTransactionAdder } from '@sushiswap/wagmi'
import { FC, useEffect, useState } from 'react'
import { Chain } from 'sushi/chain'
import { STARGATE_CONFIRMATION_SECONDS } from 'sushi/config'
import { useLayerZeroScanLink } from '../../../lib/swap/useLayerZeroScanLink'
import { CrossChainSwapPendingTransaction } from './cross-chain-swap-pending-transactions-provider'

export const CrossChainSwapPendingCard: FC<CrossChainSwapPendingTransaction> =
  ({ tradeId, amountIn, amountOut, chainId0, chainId1, txHash }) => {
    const { address } = useAccount()
    const { mutate } = useTransactionAdder({ account: address })
    const { data } = useLayerZeroScanLink({
      tradeId,
      network0: chainId0,
      network1: chainId1,
      txHash,
    })

    const [date] = useState<Date>(
      new Date(Date.now() + 1000 * STARGATE_CONFIRMATION_SECONDS[chainId0]),
    )

    // Add to tx history
    useEffect(() => {
      if (data?.status === 'DELIVERED' && address) {
        mutate({
          account: address,
          chainId: chainId0,
          hash: data.dstTxHash as `0x${string}`,
          payload: JSON.stringify({
            type: 'swap',
            inputAmount: amountIn.toSignificant(6),
            outputAmount: amountOut.toSignificant(6),
            inputToken: {
              address: amountIn.currency.wrapped.address,
              decimals: amountIn.currency.decimals,
              symbol: amountIn.currency.symbol,
            },
            outputToken: {
              address: amountOut.currency.wrapped.address,
              decimals: amountOut.currency.decimals,
              symbol: amountOut.currency.symbol,
            },
          }),
          timestamp: new Date().getTime(),
        })
      }
    }, [address, amountIn, amountOut, chainId0, data, mutate])

    return (
      <div className="relative overflow-hidden group flex flex-col space-y-3 px-4 py-2 bg-white rounded-l-sm rounded-r-lg border border-input">
        <div className="flex items-center justify-between space-x-4 w-full">
          <div className="grid grid-cols-[auto_100px] gap-1 justify-between items-center w-full text-sm font-medium">
            <div className="min-w-0 truncate group-hover:whitespace-normal">
              <div className="block truncate text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                {Chain.fromChainId(chainId0)?.name}
                <ArrowRightIcon className="inline h-3 w-3 -mt-0.5 ml-1 mr-1" />
                {Chain.fromChainId(chainId1)?.name}
              </div>
              <div className="block truncate group-hover:whitespace-normal">
                {amountIn.toSignificant(6)} {amountIn.currency.symbol}{' '}
                <ArrowRightIcon className="inline h-4 w-4 -mt-0.5" />{' '}
                {amountOut.toSignificant(6)} {amountOut.currency.symbol}
              </div>
            </div>
            <div className="flex gap-2">
              <Timer date={date}>
                {({ minutes, seconds }) => {
                  return (
                    <span className="text-right w-full">
                      {minutes}:{seconds}
                    </span>
                  )
                }}
              </Timer>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LinkExternal
                      href={data?.link}
                      className={classNames(
                        data?.link
                          ? ''
                          : '!cursor-default opacity-40 pointer-events-none text-muted-foreground',
                        'text-right w-full',
                      )}
                    >
                      <ArrowTopRightOnSquareIcon
                        width={18}
                        height={18}
                        className="text-blue hover:underline"
                      />
                    </LinkExternal>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {data?.link
                        ? 'View on LayerzeroScan'
                        : 'Not available yet'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div
          className={classNames(
            data?.status === 'DELIVERED'
              ? 'bg-green'
              : data?.status === 'FAILED'
              ? 'bg-yellow'
              : 'bg-blue',
            'absolute bottom-0 top-0 left-0 w-[3px] !mt-0',
          )}
        />
      </div>
    )
  }
