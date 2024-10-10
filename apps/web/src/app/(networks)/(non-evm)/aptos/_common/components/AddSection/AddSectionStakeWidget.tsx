import { Transition } from '@headlessui/react'
import {
  Button,
  TextField,
  Widget,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
  textFieldVariants,
} from '@sushiswap/ui'
import { FC, Fragment, ReactNode, useMemo } from 'react'
import { formatUSD } from 'sushi/format'
import { Token } from '~aptos/_common/lib/types/token'
import { CurrencyIcon } from '~aptos/_common/ui/currency/currency-icon'
import { CurrencyIconList } from '~aptos/_common/ui/currency/currency-icon-list'

interface AddSectionStakeWidgetProps {
  title?: string
  setValue(value: string): void
  value: string
  children: ReactNode
  token0: Token
  token1: Token
  balance: number
  price: number
}

export const AddSectionStakeWidget: FC<AddSectionStakeWidgetProps> = ({
  title,
  setValue,
  value,
  children,
  token0,
  token1,
  balance,
  price,
}) => {
  const priceUsd = price * Number(value)

  return useMemo(
    () => (
      <Widget id="stakeLiquidity" className="bg-white dark:bg-slate-800">
        <WidgetHeader title={title || 'Stake Liquidity'}>
          <WidgetTitle>Stake Liquidity</WidgetTitle>
          <WidgetDescription>
            Stake your liquidity tokens to receive incentive rewards on top of
            your pool fee rewards
          </WidgetDescription>
        </WidgetHeader>
        <>
          <div
            className={textFieldVariants({
              className: 'flex flex-col gap-2 !h-[unset]',
            })}
          >
            <TextField
              id="stake-input"
              variant="naked"
              type="number"
              onValueChange={setValue}
              value={value}
              placeholder="0"
              className="!text-2xl"
              unit="SLP"
            />
            <div className="flex w-full justify-between gap-2">
              <Button
                size="sm"
                variant="link"
                testId="stake-balance"
                onClick={() => setValue(String(balance))}
              >
                Balance: {String(balance)}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="xs"
              fullWidth
              variant={value === '25' ? 'default' : 'secondary'}
              onClick={() => setValue(String(balance / 4))}
              testId="stake-25"
            >
              25%
            </Button>
            <Button
              size="xs"
              fullWidth
              variant={value === '50' ? 'default' : 'secondary'}
              onClick={() => setValue(String(balance / 2))}
              testId="stake-50"
            >
              50%
            </Button>
            <Button
              size="xs"
              fullWidth
              variant={value === '75' ? 'default' : 'secondary'}
              onClick={() => setValue(String(balance * (3 / 4)))}
              testId="stake-75"
            >
              75%
            </Button>
            <Button
              size="xs"
              fullWidth
              variant={value === '100' ? 'default' : 'secondary'}
              onClick={() => setValue(String(balance))}
              testId="stake-max"
            >
              MAX
            </Button>
          </div>
          <div className="min-w-[56px] -mr-[10px]">
            <CurrencyIconList iconHeight={28} iconWidth={28}>
              <CurrencyIcon currency={token0} />
              <CurrencyIcon currency={token1} />
            </CurrencyIconList>
          </div>
          <div className="grid items-center justify-between grid-cols-3 pb-2">
            <Transition
              appear
              as={Fragment}
              show={Boolean(balance)}
              enter="transition duration-300 origin-center ease-out"
              enterFrom="transform scale-90 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform opacity-100"
              leaveTo="transform opacity-0"
            >
              <span className="text-gray-700 dark:text-slate-300 hover:text-slate-20 text-sm font-medium">
                {formatUSD(priceUsd)}
              </span>
            </Transition>
            <Transition
              appear
              show={Boolean(balance)}
              as={Fragment}
              enter="transition duration-300 origin-center ease-out"
              enterFrom="transform scale-90 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform opacity-100"
              leaveTo="transform opacity-0"
            >
              <span
                onClick={() => setValue(String(balance))}
                onKeyUp={() => setValue(String(balance))}
                className="flex justify-end col-span-2 text-gray-800 truncate dark:text-slate-300 hover:dark:text-slate-200 text-sm font-medium"
              >
                Balance: {balance}
              </span>
            </Transition>
          </div>
        </>
        <WidgetFooter>{children}</WidgetFooter>
      </Widget>
    ),
    [children, setValue, title, value, priceUsd, balance, token0, token1],
  )
}
