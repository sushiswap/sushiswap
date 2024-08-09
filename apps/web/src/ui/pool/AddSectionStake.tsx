'use client'

import { useIsMounted } from '@sushiswap/hooks'
import { Button, Dots } from '@sushiswap/ui'
import { FC, useMemo, useState } from 'react'
import { APPROVE_TAG_STAKE } from 'src/lib/constants'
import { useV2Pool } from 'src/lib/hooks'
import { ChainId } from 'sushi/chain'
import { tryParseAmount } from 'sushi/currency'
import { ZERO } from 'sushi/math'

import { V2Pool } from '@sushiswap/graph-client/data-api'
import { getMasterChefContractConfig } from 'src/lib/wagmi/hooks/master-chef/use-master-chef-contract'
import { useMasterChefDeposit } from 'src/lib/wagmi/hooks/master-chef/use-master-chef-deposit'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import {
  useApproved,
  withCheckerRoot,
} from 'src/lib/wagmi/systems/Checker/Provider'
import { ChefType } from 'sushi'
import { AddSectionStakeWidget } from './AddSectionStakeWidget'

interface AddSectionStakeProps {
  pool: V2Pool
  chefType: ChefType
  title?: string
  farmId: number
}

export const AddSectionStake: FC<{
  pool: V2Pool
  title?: string
}> = ({ pool, title }) => {
  const isMounted = useIsMounted()
  if (!pool) return <></>

  if (!pool?.incentives || pool.incentives.length === 0 || !isMounted)
    return <></>

  return (
    <_AddSectionStake
      pool={pool}
      chefType={pool.incentives[0].chefType}
      title={title}
      farmId={Number(pool.incentives[0].pid)}
    />
  )
}

const _AddSectionStake: FC<AddSectionStakeProps> = withCheckerRoot(
  ({ pool, chefType, title, farmId }) => {
    const { approved } = useApproved(APPROVE_TAG_STAKE)
    const [value, setValue] = useState('')
    const {
      data: { reserve1, reserve0, liquidityToken },
    } = useV2Pool(pool)

    const amounts = useMemo(() => {
      return [tryParseAmount(value, liquidityToken)]
    }, [liquidityToken, value])

    const { write, isPending: isWritePending } = useMasterChefDeposit({
      amount: amounts[0],
      chainId: liquidityToken?.chainId,
      chef: chefType,
      pid: farmId,
      enabled: Boolean(
        approved && amounts[0]?.greaterThan(ZERO) && liquidityToken,
      ),
    })

    return (
      <AddSectionStakeWidget
        title={title}
        chainId={pool.chainId}
        value={value}
        setValue={setValue}
        reserve0={reserve0}
        reserve1={reserve1}
        liquidityToken={liquidityToken}
        isFarm={farmId !== undefined}
        isIncentivized={pool.isIncentivized}
      >
        <Checker.Connect size="default" variant="outline" fullWidth>
          <Checker.Network
            size="default"
            variant="outline"
            fullWidth
            chainId={pool.chainId as ChainId}
          >
            <Checker.Amounts
              size="default"
              variant="outline"
              fullWidth
              chainId={pool.chainId as ChainId}
              amounts={amounts}
            >
              <Checker.ApproveERC20
                size="default"
                variant="outline"
                fullWidth
                id="stake-approve-slp"
                amount={amounts[0]}
                contract={
                  getMasterChefContractConfig(pool.chainId as ChainId, chefType)
                    ?.address
                }
                enabled={Boolean(
                  getMasterChefContractConfig(pool.chainId as ChainId, chefType)
                    ?.address,
                )}
              >
                <Checker.Success tag={APPROVE_TAG_STAKE}>
                  <Button
                    size="default"
                    onClick={write}
                    fullWidth
                    disabled={isWritePending || !approved || !write}
                    testId="stake-liquidity"
                  >
                    {isWritePending ? (
                      <Dots>Confirm transaction</Dots>
                    ) : (
                      'Stake Liquidity'
                    )}
                  </Button>
                </Checker.Success>
              </Checker.ApproveERC20>
            </Checker.Amounts>
          </Checker.Network>
        </Checker.Connect>
      </AddSectionStakeWidget>
    )
  },
)
