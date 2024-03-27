'use client'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import {
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  LinkExternal,
  classNames,
} from '@sushiswap/ui'
import { Button, ButtonProps } from '@sushiswap/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPrimitive,
} from '@sushiswap/ui/components/select'
import { FC, useState } from 'react'
import { Amount, Type } from 'sushi/currency'

import { Address } from 'viem'
import { ApprovalState, useTokenApproval } from '../../hooks'

interface ApproveERC20Props extends ButtonProps {
  id: string
  amount: Amount<Type> | undefined
  contract: Address | undefined
  enabled?: boolean
}

const ApproveERC20: FC<ApproveERC20Props> = ({
  id,
  amount,
  contract,
  children,
  className,
  fullWidth = true,
  size = 'xl',
  enabled = true,
  ...props
}) => {
  const [max, setMax] = useState(false)
  const [state, { write }] = useTokenApproval({
    amount,
    spender: contract,
    enabled,
    approveMax: max,
  })

  if (state === ApprovalState.APPROVED || !enabled) {
    return <>{children}</>
  }

  const loading = [
    ApprovalState.UNKNOWN,
    ApprovalState.LOADING,
    ApprovalState.PENDING,
  ].includes(state)

  return (
    <Select value={`${max}`} onValueChange={(val) => setMax(val === 'true')}>
      <HoverCard openDelay={0} closeDelay={0}>
        <Button
          disabled={state !== ApprovalState.NOT_APPROVED || !write}
          className={classNames(className, 'group relative')}
          loading={loading}
          onClick={() => write?.()}
          fullWidth={fullWidth}
          size={size}
          testId={id}
          {...props}
        >
          Approve {amount?.currency.symbol} {max ? 'Permanently' : ''}
          <HoverCardTrigger>
            <InformationCircleIcon width={16} height={16} />
          </HoverCardTrigger>
          <div
            className={classNames(
              fullWidth ? 'absolute' : '',
              'right-1 top-1 bottom-1',
            )}
          >
            <SelectPrimitive.Trigger asChild>
              <Button
                asChild
                size="xs"
                variant="ghost"
                name="Select"
                className="!h-full !w-full"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </SelectPrimitive.Trigger>
          </div>
        </Button>
        <HoverCardContent className="!p-0 max-w-[320px]">
          <CardHeader>
            <CardTitle>Approve ERC20</CardTitle>
            <CardDescription>
              We need your approval to execute this transaction on your behalf.{' '}
              <LinkExternal
                target="_blank"
                className="text-blue hover:underline"
                href="https://www.sushi.com/academy/articles/what-is-token-approval"
                rel="noreferrer"
              >
                Learn more
              </LinkExternal>
            </CardDescription>
          </CardHeader>
        </HoverCardContent>
      </HoverCard>
      <SelectContent className="w-80">
        <SelectItem value="false">
          <div className="flex flex-col">
            <span className="font-semibold">Approve one-time only</span>
            <span className="text-sm">
              You'll give your approval to spend {amount?.toSignificant(6)}{' '}
              {amount?.currency?.symbol} on your behalf
            </span>
          </div>
        </SelectItem>
        <SelectItem value="true">
          <div className="flex flex-col">
            <span className="font-semibold">Approve unlimited amount</span>
            <span className="text-sm">
              You won't need to approve again next time you want to spend{' '}
              {amount?.currency?.symbol}.
            </span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export { ApproveERC20, type ApproveERC20Props }
