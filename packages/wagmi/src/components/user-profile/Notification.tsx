import { Disclosure } from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  ArrowsUpDownIcon,
  BanknotesIcon,
  CheckIcon,
  ChevronDownIcon,
  FireIcon,
  LockOpenIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ResolvedNotification } from '@sushiswap/dexie'
import { classNames } from '@sushiswap/ui'
import { Currency as UICurrency } from '@sushiswap/ui/components/currency'
import { NetworkIcon, SquidIcon } from '@sushiswap/ui/components/icons'
import { LinkExternal } from '@sushiswap/ui/components/link'
import { Loader } from '@sushiswap/ui/components/loader'
import { TimeAgo } from '@sushiswap/ui/components/time-ago'
import React, { FC } from 'react'
import { Chain, ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { useWaitForTransactionReceipt } from 'wagmi'

export const STARGATE_TOKEN = new Token({
  chainId: ChainId.ETHEREUM,
  address: '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6',
  decimals: 18,
  symbol: 'STG',
  name: 'StargateToken',
})

export const Notification: FC<{
  data: ResolvedNotification
  showExtra?: boolean
  hideStatus?: boolean
}> = ({ data: notification, showExtra = false, hideStatus = false }) => {
  const { status } = useWaitForTransactionReceipt({
    chainId: notification.chainId,
    hash: notification.txHash as `0x${string}`,
  })

  if (!status)
    return (
      <div className="flex items-center gap-5 px-4 pr-8 rounded-2xl min-h-[82px] w-full">
        <div>
          <div className="rounded-full bg-slate-600 h-9 w-9" />
        </div>
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col w-full gap-1">
            <div className="bg-slate-500 w-full h-[12px] animate-pulse rounded-full" />
            <div className="bg-slate-500 w-[60px] h-[12px] animate-pulse rounded-full" />
          </div>
          <div className="bg-slate-600 w-[120px] h-[10px] animate-pulse rounded-full" />
        </div>
      </div>
    )

  return (
    <div className="relative hover:bg-black/[0.02] active:bg-black/[0.03] hover:dark:bg-white/[0.02] active:dark:bg-white/[0.03]">
      {showExtra && (
        <Disclosure.Button className="absolute right-3 top-0 bottom-0 z-[100]">
          {({ open }) => (
            <div className="p-1.5 hover:dark:bg-white/[0.04] hover:bg-gray-200 rounded-full">
              <ChevronDownIcon
                width={20}
                height={20}
                className={classNames(
                  open ? 'rotate-180' : 'rotate-0',
                  'rounded-full transition-all delay-200',
                )}
              />
            </div>
          )}
        </Disclosure.Button>
      )}
      <LinkExternal
        href={
          notification.href
            ? notification.href
            : notification.txHash
              ? Chain.from(notification.chainId)?.getTxUrl(notification.txHash)
              : ''
        }
      >
        <div
          className={classNames(
            showExtra ? 'pr-14' : 'pr-4',
            'relative cursor-pointer flex items-center gap-3 rounded-2xl px-4 py-3',
          )}
        >
          <div className="p-2 bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-slate-200 rounded-full min-h-[36px] min-w-[36px] flex justify-center items-center">
            {!hideStatus &&
              (status === 'loading' ? (
                <Loader size={18} />
              ) : status === 'error' ? (
                <XMarkIcon width={20} height={20} className="text-red-400" />
              ) : (
                <></>
              ))}
            {notification.type === 'stargate' && (
              <UICurrency.Icon
                currency={STARGATE_TOKEN}
                width={20}
                height={20}
              />
            )}
            {notification.type === 'squid' && (
              <SquidIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'send' && (
              <ArrowRightIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'swap' && (
              <ArrowsUpDownIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'approval' && (
              <LockOpenIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'mint' && (
              <PlusIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'burn' && (
              <FireIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'enterBar' && (
              <ArrowDownTrayIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'transferStream' && (
              <ArrowRightIcon width={20} height={20} />
            )}
            {status === 'success' &&
              notification.type === 'transferVesting' && (
                <ArrowRightIcon width={20} height={20} />
              )}
            {status === 'success' &&
              notification.type === 'createMultipleStream' && (
                <CheckIcon width={20} height={20} />
              )}
            {status === 'success' &&
              notification.type === 'createMultipleVesting' && (
                <CheckIcon width={20} height={20} />
              )}
            {status === 'success' && notification.type === 'cancelStream' && (
              <CheckIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'createVesting' && (
              <CheckIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'createStream' && (
              <CheckIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'updateStream' && (
              <ArrowDownTrayIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'withdrawStream' && (
              <ArrowUpTrayIcon width={20} height={20} />
            )}
            {status === 'success' &&
              notification.type === 'withdrawVesting' && (
                <ArrowUpTrayIcon width={20} height={20} />
              )}
            {status === 'success' && notification.type === 'leaveBar' && (
              <ArrowUpTrayIcon width={20} height={20} />
            )}
            {status === 'success' && notification.type === 'claimRewards' && (
              <BanknotesIcon width={20} height={20} />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium items-center whitespace-normal text-gray-900 dark:text-slate-50">
                {notification.summary}
              </span>
            </div>
            <span className="flex gap-1 items-center text-xs text-gray-600 dark:text-slate-500">
              <NetworkIcon
                type="naked"
                chainId={notification.chainId}
                width={14}
                height={14}
              />
              • <TimeAgo value={new Date(notification.timestamp)} />
            </span>
          </div>
        </div>
      </LinkExternal>
    </div>
  )
}
