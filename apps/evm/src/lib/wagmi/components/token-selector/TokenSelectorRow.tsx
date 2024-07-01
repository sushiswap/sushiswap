import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid'
import { NativeAddress } from '@sushiswap/react-query'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceEventName,
  TraceEvent,
} from '@sushiswap/telemetry'
import {
  IconButton,
  SkeletonText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  classNames,
} from '@sushiswap/ui'
import { Badge } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui'
import React, { CSSProperties, FC, memo, useCallback } from 'react'
import { Chain } from 'sushi/chain'
import { Amount, Type } from 'sushi/currency'
import { Fraction, ZERO } from 'sushi/math'
import { zeroAddress } from 'viem'

export interface TokenSelectorRow {
  id: string
  account?: `0x${string}`
  currency: Type
  style?: CSSProperties
  className?: string
  onSelect(currency: Type): void
  balance?: Amount<Type> | undefined
  showWarning: boolean
  price?: Fraction
  pin?: {
    isPinned: boolean
    onPin(): void
  }
  selected: boolean
  isBalanceLoading: boolean
}

export const TokenSelectorRow: FC<TokenSelectorRow> = memo(
  function TokenSelectorRow({
    id,
    price,
    balance,
    currency,
    style,
    className,
    onSelect,
    pin,
    selected,
    isBalanceLoading,
    showWarning,
  }) {
    const onClick = useCallback(() => {
      onSelect(currency)
    }, [currency, onSelect])

    const onPin = useCallback(
      (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation()
        pin?.onPin()
      },
      [pin],
    )

    return (
      <TraceEvent
        events={[BrowserEvent.onClick, BrowserEvent.onKeyPress]}
        name={InterfaceEventName.TOKEN_SELECTED}
        properties={{
          token_symbol: currency?.symbol,
          token_address: currency?.isNative ? NativeAddress : currency?.address,
          total_balances_usd: balance?.quotient,
        }}
        element={InterfaceElementName.TOKEN_SELECTOR_ROW}
      >
        <div className="relative py-0.5 h-[64px]" style={style}>
          <div
            testdata-id={`${id}-row-${
              currency.isNative
                ? zeroAddress
                : currency.wrapped.address.toLowerCase()
            }`}
            onClick={onClick}
            onKeyDown={onClick}
            className={classNames(
              className,
              selected ? 'bg-secondary' : '',
              `group flex items-center w-full hover:bg-muted focus:bg-accent h-full rounded-lg px-3 token-${currency?.symbol}`,
            )}
          >
            <div className="flex items-center justify-between flex-grow gap-2 rounded cursor-pointer">
              <div className="flex flex-row items-center flex-grow gap-4">
                {selected ? (
                  <Badge
                    position="bottom-right"
                    badgeContent={
                      <div className="bg-white rounded-full dark:bg-slate-800">
                        <CheckCircleIcon
                          width={20}
                          height={20}
                          className="rounded-full text-blue"
                        />
                      </div>
                    }
                  >
                    <div className="w-10 h-10">
                      <Currency.Icon
                        disableLink
                        currency={currency}
                        width={40}
                        height={40}
                      />
                    </div>
                  </Badge>
                ) : (
                  <div className="w-10 h-10">
                    <Currency.Icon
                      disableLink
                      currency={currency}
                      width={40}
                      height={40}
                    />
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <div className="flex gap-1">
                    <span className="font-semibold text-gray-900 group-hover:text-gray-900 dark:text-slate-50 dark:group-hover:text-white">
                      {currency.symbol}
                    </span>
                    {showWarning ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <ExclamationCircleIcon
                              width={20}
                              height={20}
                              className="text-yellow"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            Not on our default token list
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground hover:underline">
                          {currency.name ?? currency.symbol}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="flex items-center gap-1"
                      >
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={Chain.from(currency.chainId)?.getTokenUrl(
                            currency.wrapped.address,
                          )}
                          className="text-blue hover:underline flex gap-1"
                        >
                          Show on explorer{' '}
                          <ArrowTopRightOnSquareIcon width={16} height={16} />
                        </a>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isBalanceLoading ? (
                  <div className="flex flex-col min-w-[60px]">
                    <SkeletonText className="w-[60px]" align="right" />
                    <SkeletonText
                      fontSize="sm"
                      className="w-[20px]"
                      align="right"
                    />
                  </div>
                ) : (
                  balance?.greaterThan(ZERO) && (
                    <div className="flex flex-col max-w-[140px]">
                      <span
                        className={classNames(
                          selected ? 'font-semibold' : 'font-medium',
                          'text-right text-gray-900 dark:text-slate-50 truncate',
                        )}
                      >
                        {balance?.toSignificant(6)}
                      </span>
                      <span className="text-sm font-medium text-right text-gray-500 dark:text-slate-400">
                        {price
                          ? `$${balance?.multiply(price).toFixed(2)}`
                          : '-'}
                      </span>
                    </div>
                  )
                )}
                {pin && (
                  <IconButton
                    size="xs"
                    icon="⭐"
                    variant="ghost"
                    name="pin"
                    onClick={onPin}
                    className={classNames(
                      pin.isPinned ? '' : 'grayscale opacity-50',
                      'z-50',
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </TraceEvent>
    )
  },
)
