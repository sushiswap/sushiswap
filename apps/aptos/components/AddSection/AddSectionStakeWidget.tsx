import {
  Button,
  TextField,
  Widget,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
  textFieldVariants,
  typographyVariants,
} from '@sushiswap/ui'
import { FC, ReactNode } from 'react'
import { formatUSD } from 'sushi'

interface AddSectionStakeWidgetProps {
  setValue(value: string): void
  value: string
  children: ReactNode
  balance: number
  lpPrice: number
}

export const AddSectionStakeWidget: FC<AddSectionStakeWidgetProps> = ({
  setValue,
  value,
  children,
  balance,
  lpPrice,
}) => {
  const priceUsd = lpPrice * Number(value)

  return (
    <Widget id="stakeLiquidity" variant="empty">
      <WidgetHeader>
        <WidgetTitle>Stake Liquidity</WidgetTitle>
        <WidgetDescription>
          Stake your liquidity tokens to receive incentive rewards on top of
          your pool fee rewards
        </WidgetDescription>
      </WidgetHeader>
      <div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
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
                <span
                  className={typographyVariants({
                    variant: 'muted',
                    className: 'text-sm',
                  })}
                >
                  {formatUSD(priceUsd)}
                </span>
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

            <div className="flex w-full gap-2">
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
          </div>
        </div>
      </div>
      <WidgetFooter>{children}</WidgetFooter>
    </Widget>
  )
}
