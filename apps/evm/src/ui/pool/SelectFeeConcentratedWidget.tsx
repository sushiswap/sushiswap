import { RadioGroup } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react-v1/solid'
import {
  FeePoolSelectAction,
  LiquidityEventName,
  sendAnalyticsEvent,
  useTrace,
} from '@sushiswap/telemetry'
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  FormSection,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  LinkInternal,
  Toggle,
} from '@sushiswap/ui'
import { Dots } from '@sushiswap/ui'
import React, { FC, memo, useCallback, useMemo } from 'react'
import { usePoolsByTokenPair } from 'src/lib/hooks/usePoolsByTokenPair'
import { SushiSwapV3FeeAmount } from 'sushi/config'
import { Type } from 'sushi/currency'

export const FEE_OPTIONS = [
  {
    value: SushiSwapV3FeeAmount.LOWEST,
    subtitle: 'Best for very stable pairs.',
  },
  {
    value: SushiSwapV3FeeAmount.LOW,
    subtitle: 'Best for less volatile pairs.',
  },
  {
    value: SushiSwapV3FeeAmount.MEDIUM,
    subtitle: 'Best for most pairs.',
  },
  {
    value: SushiSwapV3FeeAmount.HIGH,
    subtitle: 'Best for volatile pairs.',
  },
]

interface SelectFeeConcentratedWidget {
  feeAmount: SushiSwapV3FeeAmount | undefined
  setFeeAmount: (fee: SushiSwapV3FeeAmount) => void
  token0: Type | undefined
  token1: Type | undefined
  title?: string
  disableIfNotExists?: boolean
}

export const SelectFeeConcentratedWidget: FC<SelectFeeConcentratedWidget> =
  memo(function SelectFeeWidget({
    feeAmount,
    setFeeAmount: _setFeeAmount,
    token0,
    token1,
    disableIfNotExists = false,
  }) {
    const trace = useTrace()

    const setFeeAmount = useCallback(
      (fee: SushiSwapV3FeeAmount) => {
        _setFeeAmount(fee)
        sendAnalyticsEvent(LiquidityEventName.SELECT_LIQUIDITY_POOL_FEE_TIER, {
          chain_id: token0?.chainId,
          label: [token0?.symbol, token1?.symbol].join('/'),
          action: FeePoolSelectAction.MANUAL,
          fee,
          ...trace,
        })
      },
      [_setFeeAmount, trace, token0?.chainId, token0?.symbol, token1?.symbol],
    )
    const { data: pools, isLoading } = usePoolsByTokenPair(
      token0?.wrapped.id,
      token1?.wrapped.id,
    )

    const tvlDistribution = useMemo(() => {
      const tvlDistribution = new Map<
        (typeof FEE_OPTIONS)[number]['value'],
        number
      >()

      if (!pools) return tvlDistribution

      const totalTvl = pools?.reduce(
        (acc, pool) => acc + Number(pool.liquidityUSD),
        0,
      )

      pools?.forEach((pool) => {
        const feeOption = FEE_OPTIONS.find(
          (option) => option.value / 1_000_000 === pool.swapFee,
        )
        if (!feeOption) return

        const tvlShare = pool.liquidityUSD / totalTvl
        if (Number.isNaN(tvlShare)) return
        tvlDistribution.set(feeOption.value, tvlShare)
      })

      return tvlDistribution
    }, [pools])

    return (
      <FormSection
        title="Fee tier"
        description="Some fee tiers work better than others depending on the volatility of your pair. Lower fee tiers generally work better when pairing stable coins. Higher fee tiers generally work better when pairing exotic coins."
      >
        <div className={!token0 || !token1 ? 'opacity-40' : ''}>
          <RadioGroup
            value={feeAmount}
            onChange={setFeeAmount}
            className="grid grid-cols-2 gap-4"
            disabled={!token0 || !token1}
          >
            {FEE_OPTIONS.map((option, i) =>
              disableIfNotExists && !tvlDistribution.get(option.value) ? (
                <HoverCard key={i} openDelay={0} closeDelay={0}>
                  <HoverCardTrigger>
                    <Card className="opacity-40">
                      <CardHeader>
                        <CardTitle>
                          <span className="flex items-center gap-2">
                            <span>{option.value / 10000}% Fees </span>
                            {tvlDistribution.get(option.value) && (
                              <Chip variant="secondary">
                                {isLoading ? (
                                  <Dots />
                                ) : (
                                  `${(
                                    tvlDistribution.get(option.value)! * 100
                                  )?.toFixed(0)}% Selected`
                                )}
                              </Chip>
                            )}
                          </span>
                        </CardTitle>
                        <CardDescription>{option.subtitle}</CardDescription>
                      </CardHeader>
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent className="!p-0">
                    <CardHeader>
                      <CardTitle>Pool doesnt exist yet.</CardTitle>
                      <CardDescription>
                        A pool for this fee tier {`doesn't`} exist yet. <br />{' '}
                        Anyone can create a pool. Want to
                        <br />
                        create this pool first?
                      </CardDescription>
                    </CardHeader>
                    {token0 && token1 ? (
                      <CardFooter>
                        <Button
                          asChild
                          icon={ChevronRightIcon}
                          size="sm"
                          variant="secondary"
                        >
                          <LinkInternal
                            href={`/pool/add?chainId=${
                              token0.chainId
                            }&feeAmount=${option.value}&fromCurrency=${
                              token0.isNative
                                ? 'NATIVE'
                                : token0.wrapped.address
                            }&toCurrency=${
                              token1.isNative
                                ? 'NATIVE'
                                : token1.wrapped.address
                            }`}
                          >
                            Create Pool
                          </LinkInternal>
                        </Button>
                      </CardFooter>
                    ) : null}
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <Toggle
                  pressed={feeAmount === option.value}
                  onClick={() => setFeeAmount(option.value)}
                  asChild
                  key={i}
                  testdata-id={`fee-option-${option.value}`}
                  className="!h-[unset] !w-[unset] !p-0 !text-left !justify-start cursor-pointer dark:data-[state=on]:bg-secondary"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <span className="flex items-center gap-2">
                          <span>{option.value / 10000}% Fees </span>
                          {tvlDistribution.get(option.value) && (
                            <Chip variant="secondary">
                              {isLoading ? (
                                <Dots />
                              ) : (
                                `${(
                                  tvlDistribution.get(option.value)! * 100
                                )?.toFixed(0)}% Selected`
                              )}
                            </Chip>
                          )}
                        </span>
                      </CardTitle>
                      <CardDescription>{option.subtitle}</CardDescription>
                    </CardHeader>
                  </Card>
                </Toggle>
              ),
            )}
          </RadioGroup>
        </div>
      </FormSection>
    )
  })
