'use client'

import {
  MinusIcon,
  PlusIcon,
  SwitchHorizontalIcon,
} from '@heroicons/react-v1/solid'
import { tryParseAmount, Type } from 'sushi/currency'
import { useIsMounted } from '@sushiswap/hooks'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  classNames,
  FormSection,
  Label,
  LinkExternal,
  Message,
  TextField,
  TextFieldDescription,
} from '@sushiswap/ui'
import { SkeletonText } from '@sushiswap/ui/components/skeleton'
import { Toggle } from '@sushiswap/ui/components/toggle'
import { FeeAmount, SushiSwapV3ChainId } from '@sushiswap/v3-sdk'
import { useAccount } from '@sushiswap/wagmi'
import { useConcentratedLiquidityPositionsFromTokenId } from '@sushiswap/wagmi/future/hooks'
import { Bound } from 'lib/constants'
import { useTokenAmountDollarValues } from 'lib/hooks'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useConcentratedDerivedMintInfo,
  useConcentratedMintActionHandlers,
  useConcentratedMintState,
  useRangeHopCallbacks,
} from './ConcentratedLiquidityProvider'
import LiquidityChartRangeInput from './LiquidityChartRangeInput'

interface SelectPricesWidget {
  chainId: SushiSwapV3ChainId
  token0: Type | undefined
  token1: Type | undefined
  feeAmount: FeeAmount | undefined
  switchTokens?(): void
  tokenId: string | undefined
  children?: ReactNode
  showStartPrice?: boolean
}

export const SelectPricesWidget: FC<SelectPricesWidget> = ({
  chainId,
  token0,
  token1,
  feeAmount,
  switchTokens,
  tokenId,
  children,
  showStartPrice = true,
}) => {
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const [invert, setInvert] = useState(false)
  const {
    price,
    invertPrice,
    pricesAtTicks,
    ticks,
    ticksAtLimit,
    pool,
    noLiquidity,
    isLoading,
  } = useConcentratedDerivedMintInfo({
    chainId,
    account: address,
    token0,
    token1,
    baseToken: token0,
    feeAmount,
    existingPosition: undefined,
  })

  const { onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useConcentratedMintActionHandlers()
  const { startPriceTypedValue } = useConcentratedMintState()
  const { data: existingPosition, isLoading: positionLoading } =
    useConcentratedLiquidityPositionsFromTokenId({
      chainId,
      tokenId,
    })
  const hasExistingPosition = !!existingPosition && !positionLoading

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    getSetFullRange,
    resetMintState,
  } = useRangeHopCallbacks(
    token0,
    token1,
    feeAmount,
    tickLower,
    tickUpper,
    pool,
  )

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

  const fiatAmounts = useMemo(
    () => [tryParseAmount('1', token0), tryParseAmount('1', token1)],
    [token0, token1],
  )
  const fiatAmountsAsNumber = useTokenAmountDollarValues({
    chainId,
    amounts: fiatAmounts,
  })
  const isFullRange = Boolean(
    ticksAtLimit[Bound.LOWER] && ticksAtLimit[Bound.UPPER],
  )

  const poolFish = new URL('https://poolfish.xyz/calculators/sushi')
  poolFish.searchParams.append('network', `${chainId}`)
  if (token0) poolFish.searchParams.append('token0', token0.wrapped.address)
  if (token1) poolFish.searchParams.append('token1', token1.wrapped.address)
  if (feeAmount) poolFish.searchParams.append('feeTier', `${feeAmount}`)

  return (
    <FormSection
      title="Range"
      description={
        <>
          Select a price range to provide liquidity. You will not earn any fees
          when prices move outside of this range.{' '}
          <a
            target="_blank"
            className="text-blue"
            rel="noopener noreferrer"
            href="https://docs.uniswap.org/concepts/protocol/concentrated-liquidity"
          >
            Learn more.
          </a>
        </>
      }
    >
      <div
        className={classNames(
          'flex flex-col gap-6',
          !token0 || !token1 ? 'opacity-40' : '',
        )}
      >
        {noLiquidity ? (
          <Message size="sm" variant="muted" className="text-center">
            This pool must be initialized before you can add liquidity.{' '}
            {showStartPrice
              ? 'To initialize, select a starting price for the pool. Then, enter your liquidity price range and deposit amount. '
              : ''}
            Gas fees will be higher than usual due to the initialization
            transaction.
          </Message>
        ) : null}
        {children ? children : null}
        <div className="rounded-xl flex flex-col gap-8">
          {isMounted && showStartPrice && (
            <div className="flex flex-col gap-3">
              {noLiquidity && (
                <div className="flex flex-col gap-2">
                  <Label>Start price</Label>
                  <TextField
                    variant="outline"
                    value={startPriceTypedValue}
                    onValueChange={onStartPriceInput}
                    testdata-id="start-price-input"
                    type="number"
                    unit={`${token1?.symbol} per ${token0?.symbol}`}
                  />
                  <TextFieldDescription>
                    Your pool needs a starting price somewhere between the min.
                    and max. price
                  </TextFieldDescription>
                </div>
              )}
              {!noLiquidity && (
                <>
                  <LiquidityChartRangeInput
                    chainId={chainId}
                    currencyA={token0}
                    currencyB={token1}
                    feeAmount={feeAmount}
                    ticksAtLimit={ticksAtLimit}
                    price={
                      price
                        ? parseFloat(
                            (invertPrice
                              ? price.invert()
                              : price
                            ).toSignificant(8),
                          )
                        : undefined
                    }
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    onLeftRangeInput={onLeftRangeInput}
                    onRightRangeInput={onRightRangeInput}
                    interactive={!hasExistingPosition}
                  />
                </>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex justify-end lg:hidden">
                {isLoading || !pool || !token0 || !token1 ? (
                  <SkeletonText fontSize="xs" />
                ) : (
                  <div
                    onClick={() => setInvert((prev) => !prev)}
                    role="button"
                    className="text-xs flex items-center font-semibold gap-1.5 rounded-xl text-blue hover:text-blue-600"
                  >
                    <SwitchHorizontalIcon width={16} height={16} />
                    <div className="flex items-baseline gap-1.5">
                      {invert ? token1.symbol : token0.symbol} ={' '}
                      {pool
                        .priceOf(invert ? token1.wrapped : token0.wrapped)
                        ?.toSignificant(4)}{' '}
                      {invert ? token0.symbol : token1.symbol}
                      <span className="text-xs font-normal">
                        ${fiatAmountsAsNumber[invert ? 1 : 0].toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-1 justify-between">
                <Toggle
                  variant="outline"
                  size="sm"
                  disabled={!feeAmount}
                  pressed={isFullRange}
                  onClick={() =>
                    isFullRange ? resetMintState() : getSetFullRange()
                  }
                >
                  Full Range
                </Toggle>
                {switchTokens ? (
                  <div className="flex justify-end gap-1">
                    <Toggle
                      variant="outline"
                      onPressedChange={switchTokens}
                      pressed={isSorted}
                      size="sm"
                    >
                      {isSorted ? token0?.symbol : token1?.symbol}
                    </Toggle>
                    <Toggle
                      variant="outline"
                      onPressedChange={switchTokens}
                      pressed={!isSorted}
                      size="sm"
                    >
                      {isSorted ? token1?.symbol : token0?.symbol}
                    </Toggle>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <PriceBlock
                id={'min-price'}
                token0={token0}
                token1={token1}
                label="Min Price"
                value={
                  ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
                    ? '0'
                    : leftPrice?.toSignificant(5) ?? ''
                }
                onUserInput={onLeftRangeInput}
                decrement={isSorted ? getDecrementLower : getIncrementUpper}
                increment={isSorted ? getIncrementLower : getDecrementUpper}
                decrementDisabled={
                  ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
                }
                incrementDisabled={
                  ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
                }
                focus={true}
              />
              <PriceBlock
                id={'max-price'}
                token0={token0}
                token1={token1}
                label="Max Price"
                value={
                  ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
                    ? '∞'
                    : rightPrice?.toSignificant(5) ?? ''
                }
                onUserInput={onRightRangeInput}
                decrement={isSorted ? getDecrementUpper : getIncrementLower}
                increment={isSorted ? getIncrementUpper : getDecrementLower}
                incrementDisabled={
                  ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
                }
                decrementDisabled={
                  ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
                }
              />
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  We{`'`}re excited to share that Sushi integration is now live
                  on{' '}
                  <LinkExternal href="https://poolfish.xyz/calculators/sushi">
                    Poolfish.xyz
                  </LinkExternal>
                  ! To get an estimate of the fees you could earn based on your
                  chosen parameters, please visit our platform by clicking here.
                  We look forward to assisting you with your earnings
                  calculations.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <LinkExternal href={poolFish.toString()}>
                  <Button variant="link" size="sm">
                    View position on Poolfish.xyz
                  </Button>
                </LinkExternal>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

interface PriceBlockProps {
  id?: string
  token0: Type | undefined
  token1: Type | undefined
  label: string
  value: string
  decrement(): string
  increment(): string
  onUserInput(val: string): void
  decrementDisabled?: boolean
  incrementDisabled?: boolean
  locked?: boolean
  focus?: boolean
}

export const PriceBlock: FC<PriceBlockProps> = ({
  id,
  locked,
  onUserInput,
  decrement,
  increment,
  decrementDisabled,
  incrementDisabled,
  token0,
  token1,
  label,
  value,
  focus = false,
}) => {
  // let user type value and only update parent value on blur
  const [localValue, setLocalValue] = useState('')
  const [useLocalValue, setUseLocalValue] = useState(false)

  const handleOnFocus = () => {
    setUseLocalValue(true)
  }

  const handleOnBlur = useCallback(() => {
    setUseLocalValue(false)
    onUserInput(localValue) // trigger update on parent value
  }, [localValue, onUserInput])

  // for button clicks
  const handleDecrement = useCallback(() => {
    setUseLocalValue(false)
    onUserInput(decrement())
  }, [decrement, onUserInput])

  const handleIncrement = useCallback(() => {
    setUseLocalValue(false)
    onUserInput(increment())
  }, [increment, onUserInput])

  useEffect(() => {
    if (localValue !== value && !useLocalValue) {
      setTimeout(() => {
        setLocalValue(value) // reset local value to match parent
      }, 0)
    }
  }, [localValue, useLocalValue, value])

  return (
    <Card
      className="bg-transparent shadow-none"
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
    >
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          {token1?.symbol} per {token0?.symbol}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <TextField
            autoFocus={focus}
            variant="naked"
            testdata-id={`${id}-input`}
            type="number"
            value={localValue}
            onValueChange={setLocalValue}
            disabled={locked}
            tabIndex={0}
            className="text-3xl font-medium pt-1 pb-2"
          />
          <div className="flex gap-1">
            <button
              disabled={decrementDisabled}
              onClick={handleDecrement}
              className={classNames(
                decrementDisabled
                  ? 'opacity-40'
                  : 'hover:bg-gray-300 dark:hover:bg-slate-600',
                'flex items-center justify-center w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded-full',
              )}
              tabIndex={-1}
            >
              <MinusIcon width={12} height={12} />
            </button>
            <button
              disabled={incrementDisabled}
              onClick={handleIncrement}
              className={classNames(
                incrementDisabled
                  ? 'opacity-40'
                  : 'hover:bg-gray-300 dark:hover:bg-slate-600',
                'flex items-center justify-center w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded-full',
              )}
              tabIndex={-1}
            >
              <PlusIcon width={12} height={12} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
