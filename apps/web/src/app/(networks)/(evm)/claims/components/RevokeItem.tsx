import { CheckIcon } from '@heroicons/react-v1/solid'
import { Badge } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui'
import { List } from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import React, { FC } from 'react'
import { useTokenAllowance } from 'src/lib/wagmi/hooks/approvals/hooks/useTokenAllowance'
import { useTokenRevokeApproval } from 'src/lib/wagmi/hooks/approvals/hooks/useTokenRevokeApproval'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import { ROUTE_PROCESSOR_2_ADDRESS, RouteProcessor2ChainId } from 'sushi/config'
import { Token } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { Address } from 'viem'

export const RevokeItem: FC<{ token: Token; account: Address }> = ({
  account,
  token,
}) => {
  const { data: allowance, isLoading } = useTokenAllowance({
    chainId: token.chainId,
    token,
    owner: account,
    spender: ROUTE_PROCESSOR_2_ADDRESS[token.chainId as RouteProcessor2ChainId],
  })

  const { write, isPending } = useTokenRevokeApproval({
    account,
    token,
    spender: ROUTE_PROCESSOR_2_ADDRESS[token.chainId as RouteProcessor2ChainId],
  })

  if (isLoading) return <List.KeyValue skeleton />

  if (allowance?.greaterThan(ZERO)) {
    return (
      <List.KeyValue
        flex
        title={
          <div className="flex items-center gap-3">
            <Badge
              position="bottom-right"
              badgeContent={
                <NetworkIcon chainId={token.chainId} width={16} height={16} />
              }
            >
              <Currency.Icon currency={token} width={24} height={24} />
            </Badge>
            {token.name} ({token.symbol})
          </div>
        }
      >
        <Checker.Connect size="sm">
          <Checker.Network size="sm" chainId={token.chainId}>
            <Button
              size="sm"
              disabled={isPending}
              loading={isPending}
              onClick={() => write?.()}
            >
              Revoke
            </Button>
          </Checker.Network>
        </Checker.Connect>
      </List.KeyValue>
    )
  }

  return (
    <List.KeyValue
      flex
      title={
        <div className="flex items-center gap-3">
          <Badge
            position="bottom-right"
            badgeContent={
              <NetworkIcon chainId={token.chainId} width={16} height={16} />
            }
          >
            <Currency.Icon currency={token} width={24} height={24} />
          </Badge>
          {token.name} ({token.symbol})
        </div>
      }
    >
      <Button size="sm" variant="secondary" className="pointer-events-none">
        <div className="flex gap-1 items-center">
          <CheckIcon
            strokeWidth={2}
            width={16}
            height={16}
            className="text-green"
          />
          Already Revoked
        </div>
      </Button>
    </List.KeyValue>
  )
}
