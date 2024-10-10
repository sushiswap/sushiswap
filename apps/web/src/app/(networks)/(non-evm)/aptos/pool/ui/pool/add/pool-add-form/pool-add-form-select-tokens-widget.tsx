import { FormSection } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { SelectIcon } from '@sushiswap/ui'
import React, { FC } from 'react'
import { CurrencyIcon } from '~aptos/_common/ui/currency/currency-icon'
import TokenSelector from '~aptos/_common/ui/token-selector/token-selector'
import {
  usePoolActions,
  usePoolState,
} from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'

export const PoolAddFormSelectTokensWidget: FC = () => {
  const { setToken0, setToken1 } = usePoolActions()

  const { token0, token1 } = usePoolState()

  return (
    <FormSection
      title="Tokens"
      description="Which token pair would you like to add liquidity to."
    >
      <div className="flex gap-3">
        <TokenSelector
          id={'token0-token-selector'}
          selected={token0}
          onSelect={setToken0}
        >
          <Button
            variant="secondary"
            id={'token0-select-button'}
            testId={'token0-select'}
          >
            {token0 ? (
              <>
                <CurrencyIcon currency={token0} width={16} height={16} />
                {token0.symbol}
              </>
            ) : (
              'Select Token'
            )}
            <SelectIcon />
          </Button>
        </TokenSelector>
        <TokenSelector
          id={'token1-token-selector'}
          selected={token1}
          onSelect={setToken1}
        >
          <Button
            variant="secondary"
            color={!token1 ? 'blue' : 'default'}
            id={'token1-select-button'}
            testId={'token1-select'}
          >
            {token1 ? (
              <>
                <CurrencyIcon currency={token1} width={16} height={16} />
                {token1.symbol}
              </>
            ) : (
              'Select Token'
            )}
            <SelectIcon />
          </Button>
        </TokenSelector>
      </div>
    </FormSection>
  )
}
