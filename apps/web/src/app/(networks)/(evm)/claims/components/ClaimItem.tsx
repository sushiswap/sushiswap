'use client'

import { CheckIcon } from '@heroicons/react-v1/solid'
import { classNames } from '@sushiswap/ui'
import { Badge } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui'
import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import React, { FC, useMemo } from 'react'
import { useTokenAllowance } from 'src/lib/wagmi/hooks/approvals/hooks/useTokenAllowance'
import { useTokenRevokeApproval } from 'src/lib/wagmi/hooks/approvals/hooks/useTokenRevokeApproval'
import { RP2MerkleTreeClaimSchema } from 'src/lib/wagmi/hooks/exploits/constants'
import { useRP2ExploitClaim } from 'src/lib/wagmi/hooks/exploits/hooks/useRP2ExploitClaim'
import { useRP2ExploitIsClaimed } from 'src/lib/wagmi/hooks/exploits/hooks/useRP2ExploitIsClaimed'
import { type RP2ClaimChainId } from 'src/lib/wagmi/hooks/exploits/types'
import { useTokenWithCache } from 'src/lib/wagmi/hooks/tokens/useTokenWithCache'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import { ROUTE_PROCESSOR_2_ADDRESS } from 'sushi/config'
import { Amount } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import type { Address } from 'viem'
import { z } from 'zod'

interface ClaimItem {
  account: Address
  chainId: RP2ClaimChainId
  claim: z.TypeOf<typeof RP2MerkleTreeClaimSchema>
}

export const ClaimItem: FC<ClaimItem> = ({ chainId, account, claim }) => {
  const { data: token, isLoading: tokenLoading } = useTokenWithCache({
    chainId,
    address: claim.token,
  })
  const { data: isClaimed, isLoading: checkIsClaimedLoading } =
    useRP2ExploitIsClaimed({ index: claim.index, chainId })

  const { write, isPending: isClaimPending } = useRP2ExploitClaim({
    claim,
    chainId,
    account,
    token,
  })
  const { data: allowance, isLoading: isAllowanceLoading } = useTokenAllowance({
    token,
    chainId,
    owner: account,
    spender: ROUTE_PROCESSOR_2_ADDRESS[chainId],
  })

  const { write: revoke, isPending: isRevokePending } = useTokenRevokeApproval({
    account,
    token,
    spender: ROUTE_PROCESSOR_2_ADDRESS[chainId],
  })

  const amount = useMemo(
    () =>
      token
        ? Amount.fromRawAmount(token, claim.amount.hex.toString())
        : undefined,
    [claim.amount, token],
  )

  const isLoading = isAllowanceLoading || checkIsClaimedLoading || tokenLoading

  return (
    <div
      className={classNames(
        'grid grid-cols-3 items-center',
        'gap-2 py-3 px-4 h-[52px]',
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-gray-600 dark:text-white">
          {isLoading ? (
            <div className="flex gap-3 items-center">
              <SkeletonCircle radius={24} />
              <SkeletonText fontSize="sm" className="max-w-[100px]" />
            </div>
          ) : token ? (
            <div className="flex gap-3 items-center">
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
          ) : (
            <></>
          )}
        </span>
      </div>
      <div className="flex justify-end">
        <span className="w-full text-right flex justify-end text-sm font-semibold text-gray-900 dark:text-white">
          {isLoading ? (
            <SkeletonText className="max-w-[75px]" align="right" />
          ) : token ? (
            <>
              {amount?.toSignificant(6)} {token.symbol}
            </>
          ) : (
            <></>
          )}
        </span>
      </div>
      {!allowance || isLoading ? (
        <SkeletonText className="max-w-[100px]" align="right" />
      ) : (
        <div className="flex justify-end">
          {!isClaimed ? (
            <Checker.Connect size="sm">
              <Checker.Network size="sm" chainId={chainId}>
                {allowance.greaterThan(ZERO) ? (
                  <Button
                    size="sm"
                    loading={isRevokePending}
                    disabled={isRevokePending}
                    onClick={() => revoke?.()}
                  >
                    Revoke Approval
                  </Button>
                ) : (
                  <Button
                    onClick={() => write?.()}
                    size="sm"
                    disabled={isClaimPending}
                    loading={isClaimPending}
                  >
                    <div className="flex gap-1 items-center">Claim</div>
                  </Button>
                )}
              </Checker.Network>
            </Checker.Connect>
          ) : (
            <Button
              icon={CheckIcon}
              size="sm"
              variant="secondary"
              className="pointer-events-none"
            >
              Claimed
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
