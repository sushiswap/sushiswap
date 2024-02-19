import {
  Button,
  SelectIcon,
  SkeletonBox,
  TextField,
  classNames,
} from '@sushiswap/ui'
import React from 'react'
import { Token } from 'utils/tokenType'
import { BalancePanel } from './BalancePanel'
import { Icon } from './Icon'
import { PricePanel } from './PricePanel'
import TokenListDialog from './TokenListDialog'
import useStablePrice from 'utils/useStablePrice'
interface PropType {
  id: string
  type: 'INPUT' | 'OUTPUT'
  token: Token
  alteredSelected: Token
  value: string
  setAmount?: (value: string) => void
  disabled?: boolean
  setToken?: (token: Token) => void
  balance: number | undefined
  error?: string
  isLoadingPrice: boolean
  tradeVal?: React.RefObject<HTMLInputElement>
  onUserInput?: (value: string) => void
  handleSwap: () => void
  className?: string
  fetching?: boolean
}

export default function TradeInput({
  id,
  type,
  token,
  alteredSelected,
  value,
  setAmount,
  disabled,
  setToken,
  balance,
  error,
  isLoadingPrice,
  onUserInput,
  handleSwap,
  className,
  fetching,
}: PropType) {
  const balanceClick = () => {
    if (setAmount && balance) {
      // if (token.symbol == 'APT') {
      //   setAmount(((balance - 2000000) / 10 ** 8) as unknown as string)
      // } else {
      //   setAmount((balance / 10 ** 8) as unknown as string)
      // }
      if (onUserInput) {
        token.symbol === 'APT'
          ? onUserInput(((balance - 2000000) / 10 ** 8) as unknown as string)
          : onUserInput((balance / 10 ** 8) as unknown as string)
      }
    }
    if (!balance && setAmount) {
      setAmount('0')
    }
  }

  const tokenPrice = useStablePrice(token)
  const amountInDollar = tokenPrice ? tokenPrice * Number(value) : 0

  return (
    <div
      className={classNames(
        error ? '!bg-red-500/20 !dark:bg-red-900/30' : '',
        'relative space-y-2 overflow-hidden pb-2',
        className,
      )}
    >
      <div
        data-state={fetching ? 'active' : 'inactive'}
        className="transition-all data-[state=inactive]:hidden data-[state=active]:block absolute inset-0 overflow-hidden p-4 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_.5s_infinite] before:bg-gradient-to-r before:from-transparent dark:before:via-slate-50/10 before:via-gray-900/[0.07] before:to-transparent"
      />
      <div className="relative flex items-center gap-4">
        <div
          data-state={isLoadingPrice ? 'active' : 'inactive'}
          className={classNames(
            'data-[state=inactive]:hidden data-[state=active]:flex',
            'gap-4 items-center justify-between flex-grow h-[44px]',
          )}
        >
          <SkeletonBox className="w-2/3 h-[32px] rounded-lg" />
          <SkeletonBox className="w-1/3 h-[32px] rounded-lg" />
        </div>
        <div
          data-state={isLoadingPrice ? 'inactive' : 'active'}
          className="data-[state=inactive]:hidden data-[state=active]:flex flex-1 items-center"
        >
          <TextField
            testdata-id={`${id}-input`}
            type="number"
            variant="naked"
            disabled={disabled}
            onValueChange={(value) => {
              if (onUserInput && token !== alteredSelected) {
                onUserInput(value)
              }
            }}
            value={value}
            readOnly={disabled}
            className={classNames('p-0 py-1 !text-3xl font-medium')}
          />
        </div>

        {setToken ? (
          <TokenListDialog
            id={id}
            selected={token}
            alteredSelected={alteredSelected}
            handleChangeToken={setToken}
            handleSwap={handleSwap}
          >
            <Button
              size="lg"
              data-state={isLoadingPrice ? 'inactive' : 'active'}
              variant={token ? 'secondary' : 'default'}
              id={`${id}-token-selector`}
              type="button"
              testdata-id="swap-from-button"
              className={classNames(
                token ? 'pl-2 pr-3 text-xl' : '',
                '!rounded-full data-[state=inactive]:hidden data-[state=active]:flex',
              )}
            >
              {token ? (
                <>
                  <span className="w-[28px] h-[28px] mr-0.5">
                    <Icon currency={token} height={28} width={28} />
                  </span>
                  {token.symbol}
                  <SelectIcon />
                </>
              ) : (
                'Select'
              )}
            </Button>
          </TokenListDialog>
        ) : (
          <div
            id={`${id}-button`}
            className={classNames(
              'flex items-center gap-1 text-xl py-2 pl-2 pr-2 rounded-full font-medium whitespace-nowrap',
            )}
          >
            {token ? (
              <>
                <span className="w-[28px] h-[28px] mr-0.5">
                  <Icon currency={token} height={28} width={28} />
                </span>
                {token.symbol}
              </>
            ) : (
              <span className="text-gray-400 dark:text-slate-500">
                No token selected
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-row items-center justify-between h-[36px]">
        <PricePanel
          isLoading={isLoadingPrice}
          error={error}
          value={amountInDollar}
        />
        <BalancePanel
          coinData={balance ? balance : 0}
          isLoading={isLoadingPrice}
          decimals={token?.decimals}
          onClick={balanceClick}
          type={type}
        />
      </div>
    </div>
  )
}
