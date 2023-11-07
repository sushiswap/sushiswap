'use client'

import {
  FeeAmount,
  Position,
  SushiSwapV3ChainId,
  SushiSwapV3Pool,
  TICK_SPACINGS,
  TickMath,
  encodeSqrtRatioX96,
  nearestUsableTick,
  priceToClosestTick,
  tickToPrice,
} from '@sushiswap/v3-sdk'
import { useConcentratedLiquidityPool } from '@sushiswap/wagmi'
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import { Bound, Field } from 'src/lib/constants'
import { getTickToPrice, tryParseTick } from 'src/lib/functions'
import {
  Amount,
  Currency,
  Price,
  Token,
  Type,
  tryParseAmount,
} from 'sushi/currency'
import { Rounding } from 'sushi/math'

type FullRange = true

interface State {
  independentField: Field
  typedValue: string
  startPriceTypedValue: string // for the case when there's no liquidity
  leftRangeTypedValue: string | FullRange
  rightRangeTypedValue: string | FullRange
}

type Api = {
  onFieldAInput(typedValue: string, noLiquidity: boolean | undefined): void
  onFieldBInput(typedValue: string, noLiquidity: boolean | undefined): void
  onLeftRangeInput(typedValue: string): void
  onRightRangeInput(typedValue: string): void
  onStartPriceInput(typedValue: string): void
  resetMintState(): void
  setFullRange(): void
}

const initialState: State = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  startPriceTypedValue: '',
  leftRangeTypedValue: '',
  rightRangeTypedValue: '',
}

type Actions =
  | { type: 'resetMintState' }
  | { type: 'typeLeftRangeInput'; typedValue: string }
  | {
      type: 'typeInput'
      field: Field
      typedValue: string
      noLiquidity: boolean
    }
  | { type: 'typeRightRangeInput'; typedValue: string }
  | { type: 'setFullRange' }
  | { type: 'typeStartPriceInput'; typedValue: string }

const ConcentratedLiquidityStateContext = createContext<State>(initialState)
const ConcentratedLiquidityActionsContext = createContext<Api>({} as Api)

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'resetMintState':
      return initialState
    case 'setFullRange':
      return { ...state, leftRangeTypedValue: true, rightRangeTypedValue: true }
    case 'typeStartPriceInput':
      return { ...state, startPriceTypedValue: action.typedValue }
    case 'typeLeftRangeInput':
      return { ...state, leftRangeTypedValue: action.typedValue }
    case 'typeRightRangeInput':
      return { ...state, rightRangeTypedValue: action.typedValue }
    case 'typeInput': {
      return {
        ...state,
        independentField: action.field,
        typedValue: action.typedValue,
      }
    }
  }
}

/*
  Provider only used whenever a user selects Concentrated Liquidity
 */
export const ConcentratedLiquidityProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const api = useMemo(() => {
    const onFieldAInput = (
      typedValue: string,
      noLiquidity: boolean | undefined,
    ) =>
      dispatch({
        type: 'typeInput',
        field: Field.CURRENCY_A,
        typedValue,
        noLiquidity: noLiquidity === true,
      })

    const onFieldBInput = (
      typedValue: string,
      noLiquidity: boolean | undefined,
    ) =>
      dispatch({
        type: 'typeInput',
        field: Field.CURRENCY_B,
        typedValue,
        noLiquidity: noLiquidity === true,
      })

    const onLeftRangeInput = (typedValue: string) => {
      dispatch({ type: 'typeLeftRangeInput', typedValue })
      // TODO searchParams
      // const paramMinPrice = searchParams.get('minPrice')
      // if (!paramMinPrice || (paramMinPrice && paramMinPrice !== typedValue)) {
      //   searchParams.set('minPrice', typedValue)
      //   setSearchParams(searchParams)
      // }
    }

    const onRightRangeInput = (typedValue: string) => {
      dispatch({ type: 'typeRightRangeInput', typedValue })
      // TODO searchParams
      // const paramMaxPrice = searchParams.get('maxPrice')
      // if (!paramMaxPrice || (paramMaxPrice && paramMaxPrice !== typedValue)) {
      //   searchParams.set('maxPrice', typedValue)
      //   setSearchParams(searchParams)
      // }
    }

    const onStartPriceInput = (typedValue: string) =>
      dispatch({ type: 'typeStartPriceInput', typedValue })
    const resetMintState = () => dispatch({ type: 'resetMintState' })
    const setFullRange = () => dispatch({ type: 'setFullRange' })

    return {
      resetMintState,
      setFullRange,
      onFieldAInput,
      onFieldBInput,
      onLeftRangeInput,
      onRightRangeInput,
      onStartPriceInput,
    }
  }, [])

  return (
    <ConcentratedLiquidityActionsContext.Provider value={api}>
      <ConcentratedLiquidityStateContext.Provider value={state}>
        {children}
      </ConcentratedLiquidityStateContext.Provider>
    </ConcentratedLiquidityActionsContext.Provider>
  )
}

export const useConcentratedMintState = () => {
  const context = useContext(ConcentratedLiquidityStateContext)
  if (!context) {
    throw new Error(
      'Hook can only be used Concentrated Liquidity Provider State Context',
    )
  }

  return context
}

export const useConcentratedMintActionHandlers = () => {
  const context = useContext(ConcentratedLiquidityActionsContext)

  if (!context) {
    throw new Error(
      'Hook can only be used Concentrated Liquidity Provider Actions Context',
    )
  }

  return context
}

export function useConcentratedDerivedMintInfo({
  account,
  token0: currencyA,
  token1: currencyB,
  baseToken: baseCurrency,
  chainId,
  feeAmount,
  existingPosition,
}: {
  account: string | undefined
  token0: Type | undefined
  token1: Type | undefined
  baseToken: Type | undefined
  chainId: SushiSwapV3ChainId
  feeAmount: FeeAmount | undefined
  existingPosition?: Position
}): {
  pool?: SushiSwapV3Pool | null
  ticks: { [_bound in Bound]?: number | undefined }
  price?: Price<Token, Token>
  pricesAtTicks: {
    [_pricesAtTicksBound in Bound]?: Price<Token, Token> | undefined
  }
  pricesAtLimit: {
    [_pricesAtLimitBound in Bound]?: Price<Token, Token> | undefined
  }
  currencies: { [_field in Field]?: Currency }
  dependentField: Field
  parsedAmounts: { [_parsedAmountsField in Field]?: Amount<Currency> }
  position: Position | undefined
  noLiquidity?: boolean
  errorMessage?: ReactNode
  invalidPool: boolean
  outOfRange: boolean
  invalidRange: boolean
  depositADisabled: boolean
  depositBDisabled: boolean
  invertPrice: boolean
  ticksAtLimit: { [_ticksAtLimitBound in Bound]?: boolean | undefined }
  isLoading: boolean
  isInitialLoading: boolean
} {
  const {
    independentField,
    typedValue,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
  } = useConcentratedMintState()

  const dependentField =
    independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // currencies
  const currencies: { [_field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB],
  )

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency],
  )

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB
        ? tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]
        : [undefined, undefined],
    [tokenA, tokenB],
  )

  // pool
  const usePool = useConcentratedLiquidityPool({
    chainId,
    token0: currencies[Field.CURRENCY_A],
    token1: currencies[Field.CURRENCY_B],
    feeAmount,
  })

  console.log(usePool)

  const { data: pool, isInitialLoading, isError } = usePool
  const noLiquidity = !isInitialLoading && !isError && !pool

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseAmount(
        startPriceTypedValue,
        invertPrice ? token0 : token1,
      )
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseAmount('1', invertPrice ? token1 : token0)
        const price =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency,
                parsedQuoteAmount.currency,
                baseAmount.quotient,
                parsedQuoteAmount.quotient,
              )
            : undefined
        return (invertPrice ? price?.invert() : price) ?? undefined
      }
      return undefined
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0) : undefined
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool])

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price
      ? encodeSqrtRatioX96(price.numerator, price.denominator)
      : undefined
    return (
      price &&
      sqrtRatioX96 &&
      !(
        sqrtRatioX96 >= TickMath.MIN_SQRT_RATIO &&
        sqrtRatioX96 < TickMath.MAX_SQRT_RATIO
      )
    )
  }, [price])

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new SushiSwapV3Pool(
        tokenA,
        tokenB,
        feeAmount,
        currentSqrt,
        0n,
        currentTick,
        [],
      )
    } else {
      return undefined
    }
  }, [feeAmount, invalidPrice, price, tokenA, tokenB])

  // if pool exists use it, if not use the mock pool
  const poolForPosition: SushiSwapV3Pool | undefined = pool ?? mockPool

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount
        ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount])
        : undefined,
      [Bound.UPPER]: feeAmount
        ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount])
        : undefined,
    }),
    [feeAmount],
  )

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === 'number'
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseTick(
              token1,
              token0,
              feeAmount,
              rightRangeTypedValue.toString(),
            )
          : tryParseTick(
              token0,
              token1,
              feeAmount,
              leftRangeTypedValue.toString(),
            ),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === 'number'
          ? existingPosition.tickUpper
          : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseTick(
              token1,
              token0,
              feeAmount,
              leftRangeTypedValue.toString(),
            )
          : tryParseTick(
              token0,
              token1,
              feeAmount,
              rightRangeTypedValue.toString(),
            ),
    }
  }, [
    existingPosition,
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
  ])

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount],
  )

  // mark invalid range
  const invalidRange = Boolean(
    typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      tickLower >= tickUpper,
  )

  const pricesAtLimit = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0, token1, tickSpaceLimits.UPPER),
    }
  }, [token0, token1, tickSpaceLimits.LOWER, tickSpaceLimits.UPPER])

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    }
  }, [token0, token1, ticks])
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange &&
      price &&
      lowerPrice &&
      upperPrice &&
      (price.lessThan(lowerPrice) || price.greaterThan(upperPrice)),
  )

  // amounts
  const independentAmount: Amount<Currency> | undefined = tryParseAmount(
    typedValue,
    currencies[independentField],
  )

  const dependentAmount: Amount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped
    const dependentCurrency =
      dependentField === Field.CURRENCY_B ? currencyB : currencyA
    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined
      }

      const position: Position | undefined =
        wrappedIndependentAmount.currency.equals(poolForPosition.token0)
          ? Position.fromAmount0({
              pool: poolForPosition,
              tickLower,
              tickUpper,
              amount0: independentAmount.quotient,
              useFullPrecision: true, // we want full precision for the theoretical position
            })
          : Position.fromAmount1({
              pool: poolForPosition,
              tickLower,
              tickUpper,
              amount1: independentAmount.quotient,
            })

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(
        poolForPosition.token0,
      )
        ? position.amount1
        : position.amount0
      return (
        dependentCurrency &&
        Amount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
      )
    }

    return undefined
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ])

  const parsedAmounts: {
    [_parsedAmountsField in Field]: Amount<Currency> | undefined
  } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A
          ? independentAmount
          : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A
          ? dependentAmount
          : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' &&
      poolForPosition &&
      poolForPosition.tickCurrent >= tickUpper,
  )
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' &&
      poolForPosition &&
      poolForPosition.tickCurrent <= tickLower,
  )

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled &&
        poolForPosition &&
        tokenA &&
        poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled &&
          poolForPosition &&
          tokenA &&
          poolForPosition.token1.equals(tokenA)),
    )
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled &&
        poolForPosition &&
        tokenB &&
        poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled &&
          poolForPosition &&
          tokenB &&
          poolForPosition.token1.equals(tokenB)),
    )

  // create position entity based on users selection
  const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[
          tokenA.equals(poolForPosition.token0)
            ? Field.CURRENCY_A
            : Field.CURRENCY_B
        ]?.quotient
      : 0n
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[
          tokenA.equals(poolForPosition.token0)
            ? Field.CURRENCY_B
            : Field.CURRENCY_A
        ]?.quotient
      : 0n

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      })
    } else {
      return undefined
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ])

  let errorMessage: ReactNode | undefined
  if (!account) {
    errorMessage = 'Connect Wallet'
  }

  if (isError) {
    errorMessage = errorMessage ?? 'Invalid pair'
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? 'Invalid price input'
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? 'Enter an amount'
  }

  const invalidPool = isError

  return useMemo(
    () => ({
      dependentField,
      currencies,
      pool,
      parsedAmounts,
      ticks,
      price,
      pricesAtTicks,
      pricesAtLimit,
      position,
      noLiquidity,
      errorMessage,
      invalidPool,
      invalidRange,
      outOfRange,
      depositADisabled,
      depositBDisabled,
      invertPrice,
      ticksAtLimit,
      ...usePool,
    }),
    [
      currencies,
      dependentField,
      depositADisabled,
      depositBDisabled,
      errorMessage,
      invalidPool,
      invalidRange,
      invertPrice,
      noLiquidity,
      outOfRange,
      parsedAmounts,
      pool,
      position,
      price,
      pricesAtLimit,
      pricesAtTicks,
      ticks,
      ticksAtLimit,
      usePool,
    ],
  )
}

export function useRangeHopCallbacks(
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: SushiSwapV3Pool | undefined | null,
) {
  const { setFullRange, resetMintState } = useConcentratedMintActionHandlers()
  const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
  const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])

  const getDecrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        tickLower - TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickLower === 'number') &&
      baseToken &&
      quoteToken &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent - TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickLower, feeAmount, pool])

  const getIncrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        tickLower + TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickLower === 'number') &&
      baseToken &&
      quoteToken &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent + TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickLower, feeAmount, pool])

  const getDecrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        tickUpper - TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickUpper === 'number') &&
      baseToken &&
      quoteToken &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent - TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

  const getIncrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        tickUpper + TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (
      !(typeof tickUpper === 'number') &&
      baseToken &&
      quoteToken &&
      feeAmount &&
      pool
    ) {
      const newPrice = tickToPrice(
        baseToken,
        quoteToken,
        pool.tickCurrent + TICK_SPACINGS[feeAmount],
      )
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

  return {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    getSetFullRange: setFullRange,
    resetMintState,
  }
}
