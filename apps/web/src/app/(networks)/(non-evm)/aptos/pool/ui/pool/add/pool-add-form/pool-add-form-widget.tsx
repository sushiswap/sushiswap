'use client'

import { ButtonProps, FormSection } from '@sushiswap/ui'
import { FC } from 'react'
import { PoolAddCurrencyInput } from '../pool-add-currency-input'
import { PoolAddDepositButton } from '../pool-add-deposit-button'

const buttonProps: ButtonProps = {
  size: 'xl',
  fullWidth: true,
}

export const PoolAddFormWidget: FC = () => {
  return (
    <FormSection
      title="Deposit"
      description="Select the amount of tokens you want to deposit"
    >
      <PoolAddCurrencyInput />
      <PoolAddDepositButton buttonProps={buttonProps} />
    </FormSection>
  )
}
