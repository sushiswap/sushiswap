'use client'

import { ChefType, Pool } from '@sushiswap/client'
import { usePool } from '@sushiswap/client/hooks'
import { useIsMounted } from '@sushiswap/hooks'
import {
  Card,
  CardCurrencyAmountItem,
  CardGroup,
  CardLabel,
  Message,
  Widget,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { Dots } from '@sushiswap/ui/components/dots'
import { useMasterChefWithdraw } from '@sushiswap/wagmi'
import { Checker } from '@sushiswap/wagmi/systems'
import { withCheckerRoot } from '@sushiswap/wagmi/systems/Checker/Provider'
import { FC, useMemo, useState } from 'react'
import { ChainId } from 'sushi/chain'
import { ZERO } from 'sushi/math'
import { useSWRConfig } from 'swr'

import { usePoolPositionStaked } from './PoolPositionStakedProvider'

interface AddSectionStakeProps {
  chainId: ChainId
  pool: Pool
  chefType: ChefType
  farmId: number
}

export const RemoveSectionUnstake: FC<{ poolId: string }> = ({ poolId }) => {
  const isMounted = useIsMounted()
  const { data: pool } = usePool({ args: poolId, swrConfig: useSWRConfig() })

  if (!pool) return <></>

  if (!pool?.incentives || pool.incentives.length === 0 || !isMounted)
    return <></>

  return (
    <_RemoveSectionUnstake
      chainId={pool.chainId as ChainId}
      pool={pool}
      chefType={pool.incentives[0].chefType}
      farmId={Number(pool.incentives[0].pid)}
    />
  )
}

export const _RemoveSectionUnstake: FC<AddSectionStakeProps> = withCheckerRoot(
  ({ chainId, pool, chefType, farmId }) => {
    const [value, setValue] = useState('0')
    const { balance } = usePoolPositionStaked()

    const amount = useMemo(() => {
      return balance?.multiply(value).divide(100)
    }, [balance, value])

    const { write, isLoading: isWritePending } = useMasterChefWithdraw({
      chainId,
      amount,
      pid: farmId,
      chef: chefType,
      enabled: Boolean(chainId && amount?.greaterThan(ZERO)),
    })

    return (
      <Widget id="stakeLiquidity" variant="empty">
        <WidgetHeader>
          <WidgetTitle>Unstake Liquidity</WidgetTitle>
          <WidgetDescription>
            Unstake your liquidity tokens first if you mean to remove your
            liquidity position
          </WidgetDescription>
        </WidgetHeader>
        {balance?.equalTo(ZERO) ? (
          <Message variant="warning" size="sm" className="mb-4">
            We could not find any staked LP tokens for unstaking.
          </Message>
        ) : null}
        <div
          className={
            balance?.equalTo(ZERO) ? 'opacity-40 pointer-events-none' : ''
          }
        >
          <div className="flex flex-col gap-6">
            <Card variant="outline" className="p-6">
              <div className="flex justify-between gap-4">
                <div>
                  <h1 className="py-1 text-3xl text-gray-900 dark:text-slate-50">
                    {value}%
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    fullWidth
                    size="sm"
                    variant={value === '25' ? 'default' : 'secondary'}
                    onClick={() => setValue('25')}
                    testId="unstake-25"
                  >
                    25%
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    variant={value === '50' ? 'default' : 'secondary'}
                    onClick={() => setValue('50')}
                    testId="unstake-50"
                  >
                    50%
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    variant={value === '75' ? 'default' : 'secondary'}
                    onClick={() => setValue('75')}
                    testId="unstake-75"
                  >
                    75%
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    variant={value === '100' ? 'default' : 'secondary'}
                    onClick={() => setValue('100')}
                    testId="unstake-max"
                  >
                    MAX
                  </Button>
                </div>
              </div>
              <div className="px-1 pt-2 pb-3">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  type="range"
                  min="1"
                  max="100"
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
                />
              </div>
            </Card>
            <Card variant="outline" className="p-6">
              <CardGroup>
                <CardLabel>You&apos;ll receive:</CardLabel>
                <CardCurrencyAmountItem amount={amount} />
              </CardGroup>
            </Card>
          </div>
          <WidgetFooter>
            <Checker.Connect size="default" variant="outline" fullWidth>
              <Checker.Network
                size="default"
                variant="outline"
                fullWidth
                chainId={pool.chainId as ChainId}
              >
                <Checker.Guard
                  size="default"
                  variant="outline"
                  guardWhen={Boolean(balance?.equalTo(ZERO))}
                  guardText="No staked tokens"
                >
                  <Checker.Guard
                    size="default"
                    variant="outline"
                    guardWhen={Boolean(
                      amount && balance && amount.greaterThan(balance),
                    )}
                    guardText="Insufficient balance"
                  >
                    <Button
                      onClick={() => write?.()}
                      fullWidth
                      size="default"
                      disabled={isWritePending || !write}
                      testId="unstake-liquidity"
                    >
                      {isWritePending ? (
                        <Dots>Confirm transaction</Dots>
                      ) : (
                        'Unstake Liquidity'
                      )}
                    </Button>
                  </Checker.Guard>
                </Checker.Guard>
              </Checker.Network>
            </Checker.Connect>
          </WidgetFooter>
        </div>
      </Widget>
    )
  },
)
