'use client'

import { ButtonProps } from '@sushiswap/ui/components/button'
import { FC } from 'react'
import { Amount, Type } from 'sushi/currency'

import { Address } from 'viem'
import { ApproveERC20 } from './ApproveERC20'

interface ApproveERC20MultipleProps extends ButtonProps {
  id: string
  amounts: { amount: Amount<Type>; contract: Address }[]
  enabled?: boolean
  index?: number
}

/*
 * Recursive component for multiple ApproveERC20s
 */
const ApproveERC20Multiple: FC<ApproveERC20MultipleProps> = ({
  fullWidth = true,
  size = 'xl',
  index,
  id,
  amounts,
  children,
  ...props
}) => {
  if (amounts === undefined) return <>{children}</>
  const _index = typeof index === 'number' ? index : amounts.length - 1
  if (_index < 0) return <>{children}</>

  return (
    <ApproveERC20
      {...props}
      fullWidth={fullWidth}
      size={size}
      id={`${id}-${_index}`}
      amount={amounts[_index].amount}
      contract={amounts[_index].contract}
    >
      <ApproveERC20Multiple
        {...props}
        index={_index - 1}
        id={id}
        amounts={amounts}
      >
        {children}
      </ApproveERC20Multiple>
    </ApproveERC20>
  )
}

export { ApproveERC20Multiple, type ApproveERC20MultipleProps }
