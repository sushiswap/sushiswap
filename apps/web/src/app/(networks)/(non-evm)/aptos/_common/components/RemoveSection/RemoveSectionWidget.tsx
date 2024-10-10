import { CogIcon } from '@heroicons/react/24/outline'
import { SlippageToleranceStorageKey } from '@sushiswap/hooks'
import {
  Button,
  Card,
  CardGroup,
  CardLabel,
  IconButton,
  Message,
  SettingsModule,
  SettingsOverlay,
  Widget,
  WidgetAction,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from '@sushiswap/ui'
import { FC, ReactNode } from 'react'
import { formatUSD } from 'sushi'
import { DEFAULT_SLIPPAGE } from 'sushi/config'
import { CardCurrencyAmountItem } from '~aptos/_common/components/CardCurrencyAmountItem'
import { useStablePrice } from '~aptos/_common/lib/common/use-stable-price'
import { Token as TokenType } from '~aptos/_common/lib/types/token'

interface RemoveSectionWidgetProps {
  title?: string
  isFarm: boolean
  percentage: string
  setPercentage(percentage: string): void
  children: ReactNode
  token0: TokenType
  token1: TokenType
  balance: number
  reserve0: string | undefined
  reserve1: string | undefined
  totalSupply: string | undefined
  token0MinMinimum: string
  token1MinMinimum: string
}

export const RemoveSectionWidget: FC<RemoveSectionWidgetProps> = ({
  title,
  percentage,
  setPercentage,
  children,
  token0,
  token1,
  balance,
  // reserve0,
  // reserve1,
  // totalSupply,
  token0MinMinimum,
  token1MinMinimum,
}) => {
  const token0Price = useStablePrice({ currency: token0 })
  const token1Price = useStablePrice({ currency: token1 })
  const token0PoolPrice = token0Price
    ? token0Price * Number(token0MinMinimum)
    : 0
  const token1PoolPrice = token1Price
    ? token1Price * Number(token1MinMinimum)
    : 0

  return (
    <Widget id="removeLiquidity" variant="empty">
      <WidgetHeader title={title || 'Unstake Liquidity'}>
        <WidgetTitle>Remove Liquidity</WidgetTitle>
        <WidgetDescription>
          Trade in your LP tokens to receive your underlying tokens
        </WidgetDescription>
        <WidgetAction variant="empty">
          <SettingsOverlay
            options={{
              slippageTolerance: {
                storageKey: SlippageToleranceStorageKey.RemoveLiquidity,
                defaultValue: DEFAULT_SLIPPAGE,
                title: 'Remove Liquidity Slippage',
              },
            }}
            modules={[SettingsModule.SlippageTolerance]}
          >
            <IconButton
              size="sm"
              name="Settings"
              icon={CogIcon}
              variant="secondary"
            />
          </SettingsOverlay>
        </WidgetAction>
      </WidgetHeader>
      {balance <= 0 ? (
        <Message variant="warning" size="sm" className="mb-4">
          No LP tokens found. Are you sure you unstaked your LP tokens?
        </Message>
      ) : null}
      <div className={balance <= 0 ? 'opacity-40 pointer-events-none' : ''}>
        <div className="flex flex-col gap-6">
          <Card variant="outline" className="p-6">
            <div className="flex justify-between gap-4">
              <div>
                <h1 className="py-1 text-3xl text-gray-900 dark:text-slate-50">
                  {percentage}%
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  fullWidth
                  variant={percentage === '25' ? 'default' : 'secondary'}
                  onClick={() => setPercentage('25')}
                  testId="remove-liquidity-25"
                >
                  25%
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  variant={percentage === '50' ? 'default' : 'secondary'}
                  onClick={() => setPercentage('50')}
                  testId="remove-liquidity-50"
                >
                  50%
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  variant={percentage === '75' ? 'default' : 'secondary'}
                  onClick={() => setPercentage('75')}
                  testId="remove-liquidity-75"
                >
                  75%
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  variant={percentage === '100' ? 'default' : 'secondary'}
                  onClick={() => setPercentage('100')}
                  testId="remove-liquidity-max"
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="px-1 pt-2 pb-3">
              <input
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                type="range"
                min="1"
                max="100"
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
              />
            </div>
          </Card>
          <Card variant="outline" className="p-6">
            <CardGroup>
              <CardLabel>You&apos;ll receive at least:</CardLabel>
              <CardCurrencyAmountItem
                amount={Number(token0MinMinimum)}
                currency={token0}
                fiatValue={formatUSD(token0PoolPrice)}
              />
              <CardCurrencyAmountItem
                amount={Number(token1MinMinimum)}
                currency={token1}
                fiatValue={formatUSD(token1PoolPrice)}
              />
            </CardGroup>
          </Card>
        </div>
      </div>
      <WidgetFooter>{children}</WidgetFooter>
    </Widget>
  )
}
