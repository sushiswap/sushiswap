'use client'

import { SwitchHorizontalIcon } from '@heroicons/react-v1/solid'
import { Pool } from '@sushiswap/client'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardLabel,
  CardOverlay,
  CardTitle,
  Currency,
  DialogConfirm,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  DialogTrigger,
  Dots,
  List,
  Message,
  Separator,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import {
  V3MigrateChainId,
  V3MigrateContractConfig,
  getMasterChefContractConfig,
  useAccount,
  useMasterChefWithdraw,
  useSushiSwapV2Pool,
  useTotalSupply,
  useTransactionDeadline,
  useV3Migrate,
  useWaitForTransactionReceipt,
} from '@sushiswap/wagmi'
import { Checker } from '@sushiswap/wagmi/systems'
import {
  useApproved,
  withCheckerRoot,
} from '@sushiswap/wagmi/systems/Checker/Provider'
import React, { FC, useMemo, useState } from 'react'
import {
  APPROVE_TAG_MIGRATE,
  APPROVE_TAG_UNSTAKE,
  Bound,
  Field,
} from 'src/lib/constants'
import { unwrapToken } from 'src/lib/functions'
import { useGraphPool, useTokenAmountDollarValues } from 'src/lib/hooks'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { Chain, ChainId } from 'sushi/chain'
import {
  SushiSwapV2ChainId,
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
} from 'sushi/config'
import { Amount, Price, tryParseAmount } from 'sushi/currency'
import { formatUSD } from 'sushi/format'
import { Fraction, ZERO } from 'sushi/math'
import {
  Position,
  SushiSwapV3Pool,
  TickMath,
  priceToClosestTick,
} from 'sushi/pool'
import { Address } from 'viem'
import { useConcentratedDerivedMintInfo } from './ConcentratedLiquidityProvider'
import { usePoolPosition } from './PoolPositionProvider'
import { usePoolPositionStaked } from './PoolPositionStakedProvider'
import { SelectFeeConcentratedWidget } from './SelectFeeConcentratedWidget'
import { SelectPricesWidget } from './SelectPricesWidget'

export const MODAL_MIGRATE_ID = 'migrate-modal'

export const MigrateTab: FC<{ pool: Pool }> = withCheckerRoot(({ pool }) => {
  const { address } = useAccount()
  const [feeAmount, setFeeAmount] = useState<SushiSwapV3FeeAmount>(
    SushiSwapV3FeeAmount.LOWEST,
  )
  const { approved } = useApproved(APPROVE_TAG_UNSTAKE)
  const [invertPrice, setInvertPrice] = useState(false)
  const [invertTokens, setInvertTokens] = useState(false)
  const [slippageTolerance] = useSlippageTolerance('addLiquidity')

  const {
    data: { token0: _token0, token1: _token1, liquidityToken },
  } = useGraphPool(pool)

  const {
    value0: _value0,
    value1: _value1,
    underlying0: _underlying0,
    underlying1: _underlying1,
    isLoading,
    balance,
  } = usePoolPosition()

  const [token0, token1, value0, value1, underlying0, underlying1] = useMemo(
    () =>
      invertTokens
        ? [_token1, _token0, _value1, _value0, _underlying1, _underlying0]
        : [_token0, _token1, _value0, _value1, _underlying0, _underlying1],
    [
      invertTokens,
      _token0,
      _token1,
      _value0,
      _value1,
      _underlying0,
      _underlying1,
    ],
  )

  const { data: pair } = useSushiSwapV2Pool(
    pool.chainId as SushiSwapV2ChainId,
    token0,
    token1,
  )
  const totalSupply = useTotalSupply(liquidityToken)

  // Harvest & Withdraw
  const {
    value0: stakedValue0,
    value1: stakedValue1,
    balance: stakedBalance,
    underlying0: stakedUnderlying0,
    underlying1: stakedUnderlying1,
    isLoading: isStakedLoading,
  } = usePoolPositionStaked()

  const { write: writeWithdraw, isLoading: isWritePending } =
    useMasterChefWithdraw({
      chainId: pool.chainId as ChainId,
      amount: stakedBalance,
      pid: pool.incentives?.[0]?.pid,
      chef: pool.incentives?.[0]?.chefType,
      enabled: Boolean(
        approved &&
          stakedBalance?.greaterThan(ZERO) &&
          pool.incentives?.[0]?.pid &&
          pool.incentives?.[0]?.chefType,
      ),
    })

  // this is just getLiquidityValue with the fee off, but for the passed pair
  const token0Value = useMemo(
    () =>
      token0 && pair?.[1] && totalSupply && balance
        ? Amount.fromRawAmount(
            token0?.wrapped,
            (balance.quotient *
              (token0.wrapped.equals(pair[1].token0)
                ? pair[1].reserve0.quotient
                : pair[1].reserve1.quotient)) /
              totalSupply.quotient,
          )
        : undefined,
    [token0, pair, totalSupply, balance],
  )

  const token1Value = useMemo(
    () =>
      token1 && pair?.[1]?.reserve1 && totalSupply && balance
        ? Amount.fromRawAmount(
            token1?.wrapped,
            (balance.quotient *
              (token1.wrapped.equals(pair[1].token1)
                ? pair[1].reserve1.quotient
                : pair[1].reserve0.quotient)) /
              totalSupply.quotient,
          )
        : undefined,
    [token1, pair, totalSupply, balance],
  )

  const {
    ticks,
    invalidRange,
    pool: v3Pool,
    parsedAmounts,
    pricesAtTicks,
    ticksAtLimit,
    price,
    noLiquidity,
    outOfRange,
  } = useConcentratedDerivedMintInfo({
    chainId: pool.chainId as SushiSwapV3ChainId,
    account: address,
    token0,
    token1,
    baseToken: token0,
    feeAmount,
    existingPosition: undefined,
  })

  const v3Address =
    token0 && token1 && feeAmount
      ? SushiSwapV3Pool.getAddress(token0.wrapped, token1.wrapped, feeAmount)
      : undefined
  const v3SpotPrice = useMemo(
    () => (v3Pool ? v3Pool?.token0Price : undefined),
    [v3Pool],
  )
  const v2SpotPrice = useMemo(
    () =>
      _token0 && _token1 && pair?.[1]?.reserve0 && pair?.[1]?.reserve1
        ? new Price(
            _token0.wrapped,
            _token1.wrapped,
            pair[1].reserve0.quotient,
            pair[1].reserve1.quotient,
          )
        : undefined,
    [_token0, _token1, pair],
  )

  let priceDifferenceFraction: Fraction | undefined =
    v2SpotPrice && v3SpotPrice
      ? v3SpotPrice.divide(v2SpotPrice).subtract(1).multiply(100)
      : undefined
  if (priceDifferenceFraction?.lessThan(ZERO)) {
    priceDifferenceFraction = priceDifferenceFraction.multiply(-1)
  }

  const largePriceDifference =
    priceDifferenceFraction && !priceDifferenceFraction?.lessThan(2n)

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks

  // the v3 tick is either the pool's tickCurrent, or the tick closest to the v2 spot price
  const tick =
    v3Pool?.tickCurrent ??
    (v2SpotPrice ? priceToClosestTick(v2SpotPrice) : undefined)
  // the price is either the current v3 price, or the price at the tick
  const sqrtPrice =
    v3Pool?.sqrtRatioX96 ??
    (tick ? TickMath.getSqrtRatioAtTick(tick) : undefined)

  const position = useMemo(
    () =>
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      !invalidRange &&
      token0 &&
      token1 &&
      token0Value &&
      token1Value &&
      sqrtPrice &&
      tick
        ? Position.fromAmounts({
            pool:
              v3Pool ??
              new SushiSwapV3Pool(
                token0.wrapped,
                token1.wrapped,
                feeAmount,
                sqrtPrice,
                0,
                tick,
                [],
              ),
            tickLower,
            tickUpper,
            amount0: token0.wrapped.sortsBefore(token1.wrapped)
              ? token0Value.quotient
              : token1Value.quotient,
            amount1: token0.wrapped.sortsBefore(token1.wrapped)
              ? token1Value.quotient
              : token0Value.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : undefined,
    [
      feeAmount,
      invalidRange,
      sqrtPrice,
      tick,
      tickLower,
      tickUpper,
      token0,
      token0Value,
      token1,
      token1Value,
      v3Pool,
    ],
  )

  const { amount0: v3Amount0Min, amount1: v3Amount1Min } = useMemo(
    () =>
      position
        ? position.mintAmountsWithSlippage(slippageTolerance)
        : { amount0: undefined, amount1: undefined },
    [position, slippageTolerance],
  )

  const [positionAmount0, positionAmount1] = useMemo(
    () =>
      invertTokens
        ? [position?.amount1, position?.amount0]
        : [position?.amount0, position?.amount1],
    [invertTokens, position?.amount0, position?.amount1],
  )

  const refund0 = useMemo(
    () =>
      positionAmount0 &&
      token0 &&
      token0Value &&
      Amount.fromRawAmount(
        token0,
        token0Value.quotient - positionAmount0.quotient,
      ),
    [positionAmount0, token0, token0Value],
  )

  const refund1 = useMemo(
    () =>
      positionAmount1 &&
      token1 &&
      token1Value &&
      Amount.fromRawAmount(
        token1,
        token1Value.quotient - positionAmount1.quotient,
      ),
    [positionAmount1, token1, token1Value],
  )

  const [v3FiatValue0, v3FiatValue1, refund0FiatValue, refund1FiatValue] =
    useTokenAmountDollarValues({
      chainId: pool.chainId as SushiSwapV3ChainId,
      amounts: [positionAmount0, positionAmount1, refund0, refund1],
    })

  const { [Field.CURRENCY_A]: input0, [Field.CURRENCY_B]: _input1 } =
    parsedAmounts
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const isSorted =
    token0 && token1 && token0.wrapped.sortsBefore(token1.wrapped)
  const leftPrice = useMemo(
    () => (isSorted ? priceLower : priceUpper?.invert()),
    [isSorted, priceLower, priceUpper],
  )
  const rightPrice = useMemo(
    () => (isSorted ? priceUpper : priceLower?.invert()),
    [isSorted, priceLower, priceUpper],
  )
  const midPrice = useMemo(
    () => (isSorted ? price : price?.invert()),
    [isSorted, price],
  )
  const isFullRange = Boolean(
    ticksAtLimit[Bound.LOWER] && ticksAtLimit[Bound.UPPER],
  )

  const fiatAmounts = useMemo(
    () => [tryParseAmount('1', token0), tryParseAmount('1', token1)],
    [token0, token1],
  )
  const fiatAmountsAsNumber = useTokenAmountDollarValues({
    chainId: pool.chainId,
    amounts: fiatAmounts,
  })

  const { approved: approvedMigrate } = useApproved(APPROVE_TAG_MIGRATE)
  const { data: deadline } = useTransactionDeadline({
    chainId: pool.chainId as ChainId,
  })

  const {
    write: writeMigrate,
    isError,
    isLoading: isMigrateLoading,
    data: hash,
  } = useV3Migrate({
    account: address,
    args: {
      pair: pool.address as Address,
      liquidityToMigrate: balance,
      percentageToMigrate: 100,
      token0: _token0?.wrapped,
      token1: _token1?.wrapped,
      fee: feeAmount,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Min: v3Amount0Min,
      amount1Min: v3Amount1Min,
      recipient: address,
      deadline,
      refundAsETH: true,
      sqrtPrice,
      noLiquidity,
    },
    chainId: pool.chainId as V3MigrateChainId,
    enabled: approvedMigrate,
  })

  const { status } = useWaitForTransactionReceipt({
    chainId: pool.chainId as SushiSwapV3ChainId,
    hash,
  })

  return (
    <DialogProvider>
      <Card>
        <CardOverlay show={Boolean(stakedBalance?.equalTo(ZERO))}>
          Already unstaked. You{`'`}re all set! ✅
        </CardOverlay>
        <CardHeader>
          <CardTitle>Unstake & Claim Rewards</CardTitle>
          <CardDescription>
            Please unstake & claim your rewards first before migrating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardGroup className="max-w-[500px]">
            <CardLabel>Staked position</CardLabel>
            <CardCurrencyAmountItem
              isLoading={isStakedLoading || !stakedUnderlying0}
              amount={stakedUnderlying0}
              fiatValue={formatUSD(stakedValue0)}
            />
            <CardCurrencyAmountItem
              isLoading={isStakedLoading || !stakedUnderlying1}
              amount={stakedUnderlying1}
              fiatValue={formatUSD(stakedValue1)}
            />
          </CardGroup>
        </CardContent>
        <CardFooter>
          <Checker.Guard
            fullWidth={false}
            size="default"
            guardText="No staked balance found"
            guardWhen={Boolean(stakedBalance?.equalTo(ZERO))}
          >
            <Checker.Connect fullWidth={false} size="default">
              <Checker.Network
                fullWidth={false}
                size="default"
                chainId={pool.chainId as ChainId}
              >
                <Checker.ApproveERC20
                  fullWidth={false}
                  size="default"
                  id="approve-token0"
                  amount={stakedBalance}
                  contract={
                    getMasterChefContractConfig(
                      pool.chainId as ChainId,
                      pool.incentives[0]?.chefType,
                    )?.address
                  }
                  enabled={Boolean(
                    getMasterChefContractConfig(
                      pool.chainId as ChainId,
                      pool.incentives[0]?.chefType,
                    )?.address,
                  )}
                >
                  <Checker.Success tag={APPROVE_TAG_UNSTAKE}>
                    <Button
                      fullWidth={false}
                      size="default"
                      onClick={writeMigrate}
                      disabled={!approved || isWritePending}
                      testId="unstake-liquidity"
                    >
                      {isWritePending ? (
                        <Dots>Confirm transaction</Dots>
                      ) : (
                        'Unstake & Claim Rewards'
                      )}
                    </Button>
                  </Checker.Success>
                </Checker.ApproveERC20>
              </Checker.Network>
            </Checker.Connect>
          </Checker.Guard>
        </CardFooter>
      </Card>
      <Card>
        <CardOverlay show={Boolean(stakedBalance?.greaterThan(ZERO))}>
          Please unstake first before migrating!
        </CardOverlay>
        <CardHeader>
          <CardTitle>Migrate position</CardTitle>
          <CardDescription>
            Migrate your V2 position to a concentrated liquidity position to
            improve your capital efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <CardGroup>
              <CardLabel>V2 Price</CardLabel>
              {token0 && token1 && pool ? (
                <div>
                  <Button
                    icon={SwitchHorizontalIcon}
                    variant="link"
                    size="sm"
                    onClick={() => setInvertPrice((prev) => !prev)}
                  >
                    1 {invertPrice ? _token1.symbol : _token0.symbol} ={' '}
                    {invertPrice
                      ? `${v2SpotPrice?.invert()?.toSignificant(6)} ${
                          _token0.symbol
                        }`
                      : `${v2SpotPrice?.toSignificant(6)} ${_token1.symbol}`}
                  </Button>
                </div>
              ) : (
                <></>
              )}
            </CardGroup>
            {v3SpotPrice ? (
              <CardGroup>
                <CardLabel>V3 Price</CardLabel>
                {token0 && token1 && pool ? (
                  <div>
                    <Button
                      icon={SwitchHorizontalIcon}
                      variant="link"
                      size="sm"
                      onClick={() => setInvertPrice((prev) => !prev)}
                    >
                      1 {invertPrice ? _token1.symbol : _token0.symbol} ={' '}
                      {invertPrice
                        ? `${v3SpotPrice?.invert()?.toSignificant(6)} ${
                            _token0.symbol
                          }`
                        : `${v3SpotPrice?.toSignificant(6)} ${_token1.symbol}`}
                    </Button>
                  </div>
                ) : (
                  <></>
                )}
              </CardGroup>
            ) : null}
          </div>
          <CardGroup className="max-w-[500px]">
            <CardLabel>Position</CardLabel>
            <CardCurrencyAmountItem
              isLoading={isLoading || !underlying0}
              amount={underlying0}
              fiatValue={formatUSD(value0)}
            />
            <CardCurrencyAmountItem
              isLoading={isLoading || !underlying1}
              amount={underlying1}
              fiatValue={formatUSD(value1)}
            />
          </CardGroup>
        </CardContent>
        <div className="pb-4">
          <Separator />
        </div>
        <CardContent className="!pb-0">
          <SelectFeeConcentratedWidget
            setFeeAmount={setFeeAmount}
            feeAmount={feeAmount}
            token0={token0}
            token1={token1}
          />
          <Separator />
          <div className="flex flex-col gap-6">
            <SelectPricesWidget
              chainId={pool.chainId as SushiSwapV3ChainId}
              token0={token0}
              token1={token1}
              poolAddress={v3Address}
              feeAmount={feeAmount}
              tokenId={undefined}
              showStartPrice={false}
              switchTokens={() => setInvertTokens((prev) => !prev)}
            >
              {outOfRange ? (
                <Message variant="warning" size="sm">
                  Your position will not earn fees or be used in trades until
                  the market price moves into your range.
                </Message>
              ) : null}
              {invalidRange ? (
                <Message variant="warning" size="sm">
                  Invalid range selected. The minimum price must be lower than
                  the maximum price.
                </Message>
              ) : null}
              {largePriceDifference ? (
                <Message variant="warning" size="sm">
                  You should only deposit liquidity into SushiSwap V3 at a price
                  you believe is correct. <br />
                  If the price seems incorrect, you can either make a swap to
                  move the price or wait for someone else to do so.
                </Message>
              ) : null}
            </SelectPricesWidget>
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-x-10 lg:gap-x-[56px]">
            <div className="col-span-3 md:col-span-1" />
            <div className="col-span-3 md:col-span-2 space-y-6">
              <Separator />
              <Card className="bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle>Migrated value</CardTitle>
                  <CardDescription>
                    Your position after migration will consist of the following
                    tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CardGroup>
                    <CardLabel>Tokens</CardLabel>
                    <CardCurrencyAmountItem
                      amount={positionAmount0}
                      fiatValue={formatUSD(v3FiatValue0)}
                    />
                    <CardCurrencyAmountItem
                      amount={positionAmount1}
                      fiatValue={formatUSD(v3FiatValue1)}
                    />
                  </CardGroup>
                </CardContent>
              </Card>
              <Card className="bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle>Refunded tokens</CardTitle>
                  <CardDescription>
                    Sometimes you get a refund as the token ratio on a V3
                    position is not always 50:50
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CardGroup>
                    <CardLabel>Tokens</CardLabel>
                    <CardCurrencyAmountItem
                      amount={token0Value}
                      fiatValue={formatUSD(refund0FiatValue)}
                    />
                    <CardCurrencyAmountItem
                      amount={token1Value}
                      fiatValue={formatUSD(refund1FiatValue)}
                    />
                  </CardGroup>
                </CardContent>
              </Card>
              <CardFooter className="!px-0 !pb-0">
                <Checker.Connect fullWidth size="default">
                  <Checker.Network
                    fullWidth
                    size="default"
                    chainId={pool.chainId as ChainId}
                  >
                    <Checker.Guard
                      size="default"
                      guardWhen={!balance?.greaterThan(ZERO)}
                      guardText="Not enough balance"
                    >
                      <Checker.Guard
                        size="default"
                        guardWhen={Boolean(
                          !position ||
                            positionAmount0?.equalTo(ZERO) ||
                            positionAmount1?.equalTo(ZERO),
                        )}
                        guardText="Enter valid range"
                      >
                        <Checker.ApproveERC20
                          fullWidth
                          size="default"
                          id="approve-migrate"
                          amount={balance ?? undefined}
                          contract={
                            V3MigrateContractConfig(
                              pool.chainId as V3MigrateChainId,
                            ).address
                          }
                          enabled={Boolean(
                            V3MigrateContractConfig(
                              pool.chainId as V3MigrateChainId,
                            ).address,
                          )}
                        >
                          <Checker.Success tag={APPROVE_TAG_MIGRATE}>
                            <DialogReview>
                              {({ confirm }) => (
                                <>
                                  <DialogTrigger asChild>
                                    <Button
                                      fullWidth
                                      size="default"
                                      testId="migrate"
                                    >
                                      Migrate Liquidity
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Migrate Liquidity
                                      </DialogTitle>
                                      <DialogDescription>
                                        {token0?.symbol}/{token1?.symbol} •
                                        SushiSwap V3 • {feeAmount / 10000}%
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4">
                                      <List className="!pt-0">
                                        <List.Control>
                                          <List.KeyValue flex title="Network">
                                            {Chain.from(pool.chainId)?.name}
                                          </List.KeyValue>
                                          {feeAmount && (
                                            <List.KeyValue title="Fee Tier">{`${
                                              +feeAmount / 10000
                                            }%`}</List.KeyValue>
                                          )}
                                        </List.Control>
                                      </List>
                                      <List className="!pt-0">
                                        <List.Control>
                                          <List.KeyValue
                                            flex
                                            title={'Minimum Price'}
                                            subtitle={`Your position will be 100% composed of ${input0?.currency.symbol} at this price`}
                                          >
                                            <div className="flex flex-col gap-1">
                                              {isFullRange
                                                ? '0'
                                                : leftPrice?.toSignificant(
                                                    6,
                                                  )}{' '}
                                              {token1?.symbol}
                                            </div>
                                          </List.KeyValue>
                                          <List.KeyValue
                                            flex
                                            title={
                                              noLiquidity
                                                ? 'Starting Price'
                                                : 'Market Price'
                                            }
                                            subtitle={
                                              noLiquidity
                                                ? 'Starting price as determined by you'
                                                : 'Current price as determined by the ratio of the pool'
                                            }
                                          >
                                            <div className="flex flex-col gap-1">
                                              {midPrice?.toSignificant(6)}{' '}
                                              {token1?.symbol}
                                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                                $
                                                {fiatAmountsAsNumber[0].toFixed(
                                                  2,
                                                )}
                                              </span>
                                            </div>
                                          </List.KeyValue>
                                          <List.KeyValue
                                            flex
                                            title="Maximum Price"
                                            subtitle={`Your position will be 100% composed of ${token1?.symbol} at this price`}
                                          >
                                            <div className="flex flex-col gap-1">
                                              {isFullRange
                                                ? '∞'
                                                : rightPrice?.toSignificant(
                                                    6,
                                                  )}{' '}
                                              {token1?.symbol}
                                            </div>
                                          </List.KeyValue>{' '}
                                        </List.Control>
                                      </List>
                                      <List className="!pt-0">
                                        <List.Control>
                                          {positionAmount0 && (
                                            <List.KeyValue
                                              flex
                                              title={'Migration'}
                                              subtitle="The value of your position after migration"
                                              className="!items-start"
                                            >
                                              <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                  <Currency.Icon
                                                    currency={unwrapToken(
                                                      positionAmount0.currency,
                                                    )}
                                                    width={18}
                                                    height={18}
                                                  />
                                                  {positionAmount0.toSignificant(
                                                    6,
                                                  )}{' '}
                                                  {
                                                    unwrapToken(
                                                      positionAmount0.currency,
                                                    ).symbol
                                                  }
                                                </div>
                                                <span className="text-gray-600 dark:text-slate-400 text-xs font-normal">
                                                  {formatUSD(v3FiatValue0)}
                                                </span>
                                              </div>
                                            </List.KeyValue>
                                          )}
                                          {positionAmount1 && (
                                            <List.KeyValue
                                              flex
                                              title={''}
                                              className="!items-start"
                                            >
                                              <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                  <Currency.Icon
                                                    currency={unwrapToken(
                                                      positionAmount1.currency,
                                                    )}
                                                    width={18}
                                                    height={18}
                                                  />
                                                  {positionAmount1.toSignificant(
                                                    6,
                                                  )}{' '}
                                                  {
                                                    unwrapToken(
                                                      positionAmount1.currency,
                                                    ).symbol
                                                  }
                                                </div>
                                                <span className="text-gray-600 dark:text-slate-400 text-xs font-normal">
                                                  {formatUSD(v3FiatValue1)}
                                                </span>
                                              </div>
                                            </List.KeyValue>
                                          )}
                                          <div className="p-4">
                                            <div className="h-0.5 w-full bg-gray-100 dark:bg-slate-200/5" />
                                          </div>
                                          {token0Value && (
                                            <List.KeyValue
                                              flex
                                              title={'Refund'}
                                              subtitle="The refund you receive after migration"
                                              className="!items-start"
                                            >
                                              <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                  <Currency.Icon
                                                    currency={unwrapToken(
                                                      token0Value.currency,
                                                    )}
                                                    width={18}
                                                    height={18}
                                                  />
                                                  {refund0?.toSignificant(6) ??
                                                    '0.00'}{' '}
                                                  {
                                                    unwrapToken(
                                                      token0Value.currency,
                                                    ).symbol
                                                  }
                                                </div>
                                                <span className="text-gray-600 dark:text-slate-400 text-xs font-normal">
                                                  {formatUSD(refund0FiatValue)}
                                                </span>
                                              </div>
                                            </List.KeyValue>
                                          )}
                                          {token1Value && (
                                            <List.KeyValue
                                              flex
                                              title={''}
                                              className="!items-start"
                                            >
                                              <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                  <Currency.Icon
                                                    currency={unwrapToken(
                                                      token1Value.currency,
                                                    )}
                                                    width={18}
                                                    height={18}
                                                  />
                                                  {refund1?.toSignificant(6) ??
                                                    '0.00'}{' '}
                                                  {
                                                    unwrapToken(
                                                      token1Value.currency,
                                                    ).symbol
                                                  }
                                                </div>
                                                <span className="text-gray-600 dark:text-slate-400 text-xs font-normal">
                                                  {formatUSD(refund1FiatValue)}
                                                </span>
                                              </div>
                                            </List.KeyValue>
                                          )}
                                        </List.Control>
                                      </List>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        fullWidth
                                        size="xl"
                                        loading={isLoading && !isError}
                                        onClick={() => writeWithdraw?.(confirm)}
                                        disabled={isMigrateLoading || isError}
                                        color={isError ? 'red' : 'blue'}
                                        testId="migrate-confirm"
                                      >
                                        {isError ? (
                                          'Shoot! Something went wrong :('
                                        ) : isMigrateLoading ? (
                                          <Dots>Confirm Migrate</Dots>
                                        ) : (
                                          'Confirm Migrate'
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </>
                              )}
                            </DialogReview>
                          </Checker.Success>
                        </Checker.ApproveERC20>
                      </Checker.Guard>
                    </Checker.Guard>
                  </Checker.Network>
                </Checker.Connect>
              </CardFooter>
            </div>
          </div>
        </CardContent>
      </Card>
      {pool && token0 && token1 ? (
        <DialogConfirm
          chainId={pool.chainId as SushiSwapV3ChainId}
          status={status}
          testId="migrate-confirmation-modal"
          successMessage={`Successfully migrated your ${token0.symbol}/${token1.symbol} position`}
          buttonText="Go to pool"
          buttonLink={`/pools/${pool.chainId}:${v3Address}?activeTab=myPositions`}
          txHash={hash}
        />
      ) : null}
    </DialogProvider>
  )
})
