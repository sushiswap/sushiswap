import { LockClosedIcon, Square2StackIcon } from '@heroicons/react/24/outline'
import { PortfolioTransaction } from '@sushiswap/graph-client/data-api'
import { ClipboardController, FormattedNumber } from '@sushiswap/ui'
import { format, fromUnixTime } from 'date-fns'
import { FC } from 'react'
import React from 'react'
import { ChainId } from 'sushi/chain'
import { shortenHash } from 'sushi/format'
import { PortfolioInfoRow } from '../PortfolioInfoRow'

export const PortfolioApproveTransaction: FC<{ tx: PortfolioTransaction }> = ({
  tx,
}) => {
  return (
    <PortfolioInfoRow
      id={`${tx.chainId}:${tx.txHash}`}
      chainId={tx.chainId as ChainId}
      icon={
        <div className="p-1.5 bg-[#64748B] rounded-full w-7 h-7">
          <LockClosedIcon className="stroke-2 text-white" />
        </div>
      }
      leftContent={
        <React.Fragment>
          <div className="text-sm font-medium overflow-hidden overflow-ellipsis">
            Approve
          </div>
          <ClipboardController hideTooltip>
            {({ setCopied }) => (
              <div
                onClick={() => setCopied(tx.txHash)}
                onKeyDown={() => setCopied(tx.txHash)}
                className="flex items-center gap-x-1 text-xs text-muted-foreground cursor-pointer"
              >
                TxHash: {shortenHash(tx.txHash)}
                <Square2StackIcon className="w-3 h-3" />
              </div>
            )}
          </ClipboardController>
        </React.Fragment>
      }
      rightContent={
        <React.Fragment>
          <div className="text-sm font-medium flex justify-end items-center gap-x-1 overflow-hidden">
            {tx.approve.logoUrl ? (
              <div>
                <img
                  className="rounded-full"
                  src={tx.approve.logoUrl}
                  width={16}
                  height={16}
                  alt={tx.approve.symbol}
                />
              </div>
            ) : null}

            <span className="overflow-hidden overflow-ellipsis">
              <FormattedNumber number={tx.approve.amount.toString()} />{' '}
              {tx.approve.symbol}
            </span>
          </div>
          <div className="text-xs text-muted-foreground overflow-hidden overflow-ellipsis">
            {format(fromUnixTime(tx.timestamp), 'yyyy/MM/dd HH:mm')}
          </div>
        </React.Fragment>
      }
    />
  )
}
