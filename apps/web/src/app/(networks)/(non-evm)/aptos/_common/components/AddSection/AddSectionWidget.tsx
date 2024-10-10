import { CogIcon } from '@heroicons/react/24/outline'
import { SlippageToleranceStorageKey } from '@sushiswap/hooks'
import {
  ButtonProps,
  IconButton,
  SettingsModule,
  SettingsOverlay,
  Widget,
  WidgetAction,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from '@sushiswap/ui'
import React, { FC, useEffect } from 'react'
import { DEFAULT_SLIPPAGE } from 'sushi/config'
import { Pool } from '~aptos/pool/lib/convert-pool-to-sushi-pool'
import { useTokensFromPool } from '~aptos/pool/lib/use-tokens-from-pool'
import { PoolAddCurrencyInput } from '~aptos/pool/ui/pool/add/pool-add-currency-input'
import { PoolAddDepositButton } from '~aptos/pool/ui/pool/add/pool-add-deposit-button'
import {
  usePoolActions,
  usePoolState,
} from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'
import { usePoolPairs } from '~aptos/swap/lib/swap-get-route/use-pool-pairs'

const buttonProps: ButtonProps = {
  // size: 'xl',
  fullWidth: true,
  variant: 'outline',
}

export const AddSectionWidget: FC<{ pool?: Pool }> = ({ pool }) => {
  usePoolPairs()

  const { token0, token1 } = useTokensFromPool(pool)

  const { setToken0, setToken1 } = usePoolActions()

  const { token0: token0State, token1: token1State } = usePoolState()

  useEffect(() => {
    if (!token0 || !token1) return

    if (token0State.address !== token0.address) {
      setToken0(token0)
    }
    if (token1State.address !== token1.address) {
      setToken1(token1)
    }
  }, [token0, token0State, token1, token1State, setToken0, setToken1])

  return (
    <Widget id="addLiquidity" variant="empty">
      <WidgetHeader>
        <WidgetTitle>Add Liquidity</WidgetTitle>
        <WidgetDescription>
          Provide liquidity to receive SLP tokens.
        </WidgetDescription>
        <WidgetAction variant="empty">
          <SettingsOverlay
            options={{
              slippageTolerance: {
                storageKey: SlippageToleranceStorageKey.AddLiquidity,
                defaultValue: DEFAULT_SLIPPAGE,
                title: 'Add Liquidity Slippage',
              },
            }}
            modules={[
              SettingsModule.CustomTokens,
              SettingsModule.SlippageTolerance,
            ]}
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
      <PoolAddCurrencyInput theme="outline" disabled={true} />
      <WidgetFooter>
        <PoolAddDepositButton buttonProps={buttonProps} />
      </WidgetFooter>
    </Widget>
  )
}
