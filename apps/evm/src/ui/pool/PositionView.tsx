'use client'

import { CogIcon } from '@heroicons/react-v1/outline'
import { useAngleRewards } from '@sushiswap/react-query'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardFooter,
  CardGroup,
  CardHeader,
  CardItem,
  CardLabel,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  IconButton,
  LinkInternal,
  Separator,
  SettingsModule,
  SettingsOverlay,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  WidgetAction,
  classNames,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { SkeletonText } from '@sushiswap/ui/components/skeleton'
import { useAccount } from '@sushiswap/wagmi'
import {
  useConcentratedLiquidityPositionsFromTokenId,
  useConcentratedPositionInfo,
  useConcentratedPositionOwner,
  useTokenWithCache,
} from '@sushiswap/wagmi'
import { Checker } from '@sushiswap/wagmi/systems'
import React, { FC, useMemo, useState } from 'react'
import { Chain } from 'sushi/chain'
import { SushiSwapV3ChainId } from 'sushi/config'
import { isAngleEnabledChainId } from 'sushi/config'
import { Amount } from 'sushi/currency'
import { formatUSD } from 'sushi/format'
import { getAddress } from 'viem'
import { Bound } from '../../lib/constants'
import {
  formatTickPrice,
  getPriceOrderingFromPositionForUI,
  unwrapToken,
} from '../../lib/functions'
import { usePriceInverter, useTokenAmountDollarValues } from '../../lib/hooks'
import { useIsTickAtLimit } from '../../lib/pool/v3'
import { ConcentratedLiquidityCollectButton } from './ConcentratedLiquidityCollectButton'
import { ConcentratedLiquidityHarvestButton } from './ConcentratedLiquidityHarvestButton'
import {
  ConcentratedLiquidityProvider,
  useConcentratedDerivedMintInfo,
} from './ConcentratedLiquidityProvider'
import { ConcentratedLiquidityRemoveWidget } from './ConcentratedLiquidityRemoveWidget'
import { ConcentratedLiquidityWidget } from './ConcentratedLiquidityWidget'
import { DistributionDataTable } from './DistributionDataTable'

const Component: FC<{ id: string }> = ({ id }) => {
  const { address } = useAccount()
  const [_chainId, poolId, tokenId] = id.split('%3A') as [
    SushiSwapV3ChainId,
    string,
    string,
  ]
  const chainId = Number(_chainId) as SushiSwapV3ChainId
  const [invert, setInvert] = useState(false)

  const { data: positionDetails, isLoading: _isPositionDetailsLoading } =
    useConcentratedLiquidityPositionsFromTokenId({
      chainId,
      tokenId,
    })

  const { data: token0, isLoading: token0Loading } = useTokenWithCache({
    chainId,
    address: positionDetails?.token0,
  })
  const { data: token1, isLoading: token1Loading } = useTokenWithCache({
    chainId,
    address: positionDetails?.token1,
  })

  const { data: position, isLoading: isPositionLoading } =
    useConcentratedPositionInfo({
      chainId,
      token0,
      tokenId,
      token1,
    })

  const pricesFromPosition = position
    ? getPriceOrderingFromPositionForUI(position)
    : undefined

  const { pool, outOfRange } = useConcentratedDerivedMintInfo({
    chainId,
    account: address,
    token0,
    token1,
    baseToken: token0,
    feeAmount: positionDetails?.fee,
    existingPosition: position ?? undefined,
  })

  const [_token0, _token1] = useMemo(
    () => [
      token0 ? unwrapToken(token0) : undefined,
      token1 ? unwrapToken(token1) : undefined,
    ],
    [token0, token1],
  )

  const amounts = useMemo(() => {
    if (positionDetails?.fees && _token0 && _token1)
      return [
        Amount.fromRawAmount(_token0, BigInt(positionDetails.fees[0])),
        Amount.fromRawAmount(_token1, BigInt(positionDetails.fees[1])),
      ]

    return [undefined, undefined]
  }, [_token0, _token1, positionDetails])

  const { priceLower, priceUpper, base } = usePriceInverter({
    priceLower: pricesFromPosition?.priceLower,
    priceUpper: pricesFromPosition?.priceUpper,
    quote: pricesFromPosition?.quote,
    base: pricesFromPosition?.base,
    invert,
  })

  const tickAtLimit = useIsTickAtLimit(
    positionDetails?.fee,
    position?.tickLower,
    position?.tickUpper,
  )

  const inverted = token1 ? base?.equals(token1) : undefined
  const currencyQuote = inverted ? token0 : token1
  const currencyBase = inverted ? token1 : token0
  const below =
    pool && position && true ? pool.tickCurrent < position.tickLower : undefined
  const above =
    pool && position && true
      ? pool.tickCurrent >= position.tickUpper
      : undefined
  const inRange =
    typeof below === 'boolean' && typeof above === 'boolean'
      ? !below && !above
      : false
  const fullRange = Boolean(
    tickAtLimit[Bound.LOWER] && tickAtLimit[Bound.UPPER],
  )

  const { data: owner } = useConcentratedPositionOwner({ chainId, tokenId })
  const { data: rewardsData, isLoading: rewardsLoading } = useAngleRewards({
    chainId,
    account: owner,
  })

  const fiatValuesAmounts = useTokenAmountDollarValues({ chainId, amounts })
  const positionAmounts = useMemo(
    () => [position?.amount0, position?.amount1],
    [position],
  )
  const fiatValuesPosition = useTokenAmountDollarValues({
    chainId,
    amounts: positionAmounts,
  })
  const currentAngleRewardsPool = rewardsData?.pools[getAddress(poolId)]

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Manage</CardTitle>
                <CardDescription>
                  Manage your concentrated liquidity position.
                </CardDescription>
              </CardHeader>
              <Tabs className="w-full" defaultValue="add">
                <CardContent>
                  <TabsList className="!flex">
                    <TabsTrigger
                      testdata-id="add-tab"
                      value="add"
                      className="flex flex-1"
                    >
                      Add
                    </TabsTrigger>
                    <TabsTrigger
                      testdata-id="remove-tab"
                      value="remove"
                      className="flex flex-1"
                    >
                      Remove
                    </TabsTrigger>
                    <TabsTrigger
                      testdata-id="fees-tab"
                      value="fees"
                      className="flex flex-1"
                    >
                      Fees
                    </TabsTrigger>
                    {isAngleEnabledChainId(chainId) ? (
                      <TabsTrigger
                        testdata-id="rewards-tab"
                        value="rewards"
                        className="flex flex-1"
                      >
                        Rewards
                      </TabsTrigger>
                    ) : null}
                  </TabsList>
                </CardContent>
                <div className="px-6">
                  <Separator />
                </div>
                <TabsContent value="add">
                  <CardContent className="relative">
                    <CardHeader className="px-0 pb-0">
                      <CardTitle>Add liquidity</CardTitle>
                      <CardDescription>
                        Provide liquidity to earn fees & rewards.
                      </CardDescription>
                      <WidgetAction>
                        <SettingsOverlay
                          options={{
                            slippageTolerance: {
                              storageKey: 'addLiquidity',
                              defaultValue: '0.5',
                              title: 'Add Liquidity Slippage',
                            },
                          }}
                          modules={[
                            SettingsModule.CustomTokens,
                            SettingsModule.SlippageTolerance,
                          ]}
                        >
                          <IconButton
                            size="sm"
                            name="Settings"
                            icon={CogIcon}
                            variant="secondary"
                          />
                        </SettingsOverlay>
                      </WidgetAction>
                    </CardHeader>
                    <ConcentratedLiquidityWidget
                      withTitleAndDescription={false}
                      chainId={chainId}
                      account={address}
                      token0={_token0}
                      token1={_token1}
                      feeAmount={positionDetails?.fee}
                      tokensLoading={token0Loading || token1Loading}
                      existingPosition={position ?? undefined}
                      tokenId={tokenId}
                    />
                  </CardContent>
                </TabsContent>
                <TabsContent value="remove">
                  <CardHeader>
                    <CardTitle>Remove liquidity</CardTitle>
                    <CardDescription>
                      Please enter how much of the position you want to remove.
                    </CardDescription>
                  </CardHeader>
                  <ConcentratedLiquidityRemoveWidget
                    token0={_token0}
                    token1={_token1}
                    account={address}
                    chainId={chainId}
                    position={position ?? undefined}
                    positionDetails={positionDetails}
                  />
                </TabsContent>
                <TabsContent value="fees">
                  <CardHeader>
                    <CardTitle>Unclaimed fees</CardTitle>
                    <CardDescription>
                      {formatUSD(fiatValuesAmounts[0] + fiatValuesAmounts[1])}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardGroup>
                      <CardLabel>Tokens</CardLabel>
                      <CardCurrencyAmountItem
                        amount={amounts[0]}
                        isLoading={isPositionLoading}
                        fiatValue={formatUSD(fiatValuesAmounts[0])}
                      />
                      <CardCurrencyAmountItem
                        amount={amounts[1]}
                        isLoading={isPositionLoading}
                        fiatValue={formatUSD(fiatValuesAmounts[1])}
                      />
                    </CardGroup>
                  </CardContent>
                  <CardFooter>
                    <ConcentratedLiquidityCollectButton
                      position={position ?? undefined}
                      positionDetails={positionDetails}
                      token0={token0}
                      token1={token1}
                      account={address}
                      chainId={chainId}
                    >
                      {({ send, isLoading }) => (
                        <Checker.Connect
                          variant="outline"
                          fullWidth
                          size="default"
                        >
                          <Checker.Network
                            variant="outline"
                            fullWidth
                            size="default"
                            chainId={chainId}
                          >
                            <Button
                              fullWidth
                              disabled={isLoading}
                              onClick={send}
                              size="default"
                            >
                              Collect
                            </Button>
                          </Checker.Network>
                        </Checker.Connect>
                      )}
                    </ConcentratedLiquidityCollectButton>
                  </CardFooter>
                </TabsContent>
                {isAngleEnabledChainId(chainId) ? (
                  <TabsContent value="rewards">
                    <CardHeader>
                      <CardTitle>Unclaimed rewards</CardTitle>
                      <CardDescription>
                        This will claim your rewards for <b>every</b> V3
                        liquidity position on {Chain.from(chainId)?.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CardGroup>
                        <CardLabel>
                          Tokens (accrued over all positions)
                        </CardLabel>
                        {rewardsLoading || isPositionLoading ? (
                          <CardItem skeleton />
                        ) : rewardsData &&
                          positionDetails &&
                          rewardsData.pools[positionDetails.address] &&
                          Object.values(
                            rewardsData.pools[positionDetails.address]
                              .rewardsPerToken,
                          ).length > 0 ? (
                          Object.values(
                            rewardsData.pools[positionDetails.address]
                              .rewardsPerToken,
                          ).map((el) => (
                            <CardCurrencyAmountItem
                              key={el.unclaimed.currency.address}
                              amount={el.unclaimed}
                            />
                          ))
                        ) : (
                          <CardItem title="No rewards found" />
                        )}
                      </CardGroup>
                    </CardContent>
                    <CardFooter>
                      <ConcentratedLiquidityHarvestButton
                        account={address}
                        chainId={chainId}
                      >
                        {({ write, isLoading }) => (
                          <Checker.Connect
                            fullWidth
                            variant="outline"
                            size="default"
                          >
                            <Checker.Network
                              fullWidth
                              variant="outline"
                              size="default"
                              chainId={chainId}
                            >
                              <Button
                                fullWidth
                                disabled={isLoading}
                                onClick={() => write?.()}
                                size="default"
                              >
                                Harvest
                              </Button>
                            </Checker.Network>
                          </Checker.Connect>
                        )}
                      </ConcentratedLiquidityHarvestButton>
                    </CardFooter>
                  </TabsContent>
                ) : null}
              </Tabs>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Position Details
                  <div
                    className={classNames(
                      !inRange ? 'bg-yellow/10' : 'bg-green/10',
                      'px-2 py-1 flex items-center gap-1 rounded-full',
                    )}
                  >
                    <div
                      className={classNames(
                        outOfRange ? 'bg-yellow' : 'bg-green',
                        'w-3 h-3 rounded-full',
                      )}
                    />
                    {outOfRange ? (
                      <span className="text-xs font-medium text-yellow-900 dark:text-yellow">
                        Out of Range
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green">
                        In Range
                      </span>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {formatUSD(
                    fiatValuesPosition.reduce((acc, cur) => acc + cur, 0),
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardGroup>
                  <CardLabel>Tokens</CardLabel>
                  <CardCurrencyAmountItem
                    isLoading={isPositionLoading}
                    amount={position?.amount0}
                    fiatValue={formatUSD(fiatValuesPosition[0])}
                  />
                  <CardCurrencyAmountItem
                    isLoading={isPositionLoading}
                    amount={position?.amount1}
                    fiatValue={formatUSD(fiatValuesPosition[1])}
                  />
                </CardGroup>
                <CardGroup>
                  <CardLabel>Current price</CardLabel>
                  {pool && currencyBase && currencyQuote ? (
                    <CardItem
                      title={
                        <>
                          1 {unwrapToken(currencyBase)?.symbol} ={' '}
                          {(inverted
                            ? pool?.token1Price
                            : pool?.token0Price
                          )?.toSignificant(6)}{' '}
                          {unwrapToken(currencyQuote)?.symbol}
                        </>
                      }
                    >
                      <div className="flex items-center gap-1">
                        <Toggle
                          pressed={invert}
                          onClick={() => setInvert(true)}
                          size="xs"
                          variant="outline"
                        >
                          {_token0?.symbol}
                        </Toggle>
                        <Toggle
                          pressed={!invert}
                          onClick={() => setInvert(false)}
                          size="xs"
                          variant="outline"
                        >
                          {_token1?.symbol}
                        </Toggle>
                      </div>
                    </CardItem>
                  ) : (
                    <SkeletonText fontSize="sm" />
                  )}
                </CardGroup>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-accent p-4 flex flex-col gap-3 rounded-xl">
                    <div className="flex">
                      <div className="gap-1 px-2 py-1 text-xs font-medium rounded-full bg-pink/10 text-pink">
                        Min Price
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {pool && currencyBase && currencyQuote ? (
                        <span className="font-medium">
                          {fullRange ? (
                            '0'
                          ) : (
                            <>
                              {formatTickPrice({
                                price: priceLower,
                                atLimit: tickAtLimit,
                                direction: Bound.UPPER,
                              })}{' '}
                              {unwrapToken(currencyQuote)?.symbol}{' '}
                              <HoverCard closeDelay={0} openDelay={0}>
                                <HoverCardTrigger asChild>
                                  <span className="text-sm underline decoration-dotted underline-offset-2 underline-offset-2 text-muted-foreground font-normal">
                                    (
                                    {priceLower
                                      ?.subtract(
                                        invert
                                          ? pool.token0Price
                                          : pool.token1Price,
                                      )
                                      .divide(
                                        invert
                                          ? pool.token0Price
                                          : pool.token1Price,
                                      )
                                      .multiply(100)
                                      .toSignificant(2)}
                                    %)
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent className="!p-0 max-w-[320px]">
                                  <CardHeader>
                                    <CardTitle>Min. Price</CardTitle>
                                    <CardDescription>
                                      If the current price moves down{' '}
                                      {priceLower
                                        ?.subtract(
                                          invert
                                            ? pool.token0Price
                                            : pool.token1Price,
                                        )
                                        .divide(
                                          invert
                                            ? pool.token0Price
                                            : pool.token1Price,
                                        )
                                        .multiply(100)
                                        .toSignificant(2)}
                                      % from the current price, your position
                                      will be 100%{' '}
                                      {unwrapToken(currencyBase).symbol}
                                    </CardDescription>
                                  </CardHeader>
                                </HoverCardContent>
                              </HoverCard>
                            </>
                          )}
                        </span>
                      ) : (
                        <SkeletonText />
                      )}
                    </div>
                    {currencyBase && (
                      <span className="text-xs text-slate-500">
                        Your position will be 100%{' '}
                        {unwrapToken(currencyBase).symbol} at this price.
                      </span>
                    )}
                  </div>
                  <div className="border border-accent p-4 flex flex-col gap-3 rounded-xl">
                    <div className="flex">
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue/10 text-blue">
                        Max Price
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {priceUpper && pool && currencyQuote && currencyBase ? (
                        <span className="font-medium">
                          {fullRange ? (
                            '∞'
                          ) : (
                            <>
                              {formatTickPrice({
                                price: priceUpper,
                                atLimit: tickAtLimit,
                                direction: Bound.UPPER,
                              })}{' '}
                              {unwrapToken(currencyQuote)?.symbol}{' '}
                              <HoverCard closeDelay={0} openDelay={0}>
                                <HoverCardTrigger asChild>
                                  <span className="text-sm underline decoration-dotted underline-offset-2 underline-offset-2 text-muted-foreground font-normal">
                                    ( +
                                    {priceUpper
                                      ?.subtract(
                                        invert
                                          ? pool.token0Price
                                          : pool.token1Price,
                                      )
                                      .divide(
                                        invert
                                          ? pool.token0Price
                                          : pool.token1Price,
                                      )
                                      .multiply(100)
                                      .toSignificant(2)}
                                    %)
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent className="!p-0 max-w-[320px]">
                                  <CardHeader>
                                    <CardTitle>Max. Price</CardTitle>
                                    <CardDescription>
                                      If the current price moves up +
                                      {priceUpper
                                        ?.subtract(
                                          invert
                                            ? pool.token0Price
                                            : pool.token1Price,
                                        )
                                        .divide(
                                          invert
                                            ? pool.token0Price
                                            : pool.token1Price,
                                        )
                                        .multiply(100)
                                        .toSignificant(2)}
                                      % from the current price, your position
                                      will be 100%{' '}
                                      {unwrapToken(currencyQuote).symbol}
                                    </CardDescription>
                                  </CardHeader>
                                </HoverCardContent>
                              </HoverCard>
                            </>
                          )}
                        </span>
                      ) : (
                        <SkeletonText />
                      )}
                    </div>
                    {currencyQuote && (
                      <span className="text-xs text-slate-500">
                        Your position will be 100%{' '}
                        {unwrapToken(currencyQuote).symbol} at this price.
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {isAngleEnabledChainId(chainId) ? (
          <>
            <div className="py-4">
              <Separator />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Reward distributions</CardTitle>
                <CardDescription>
                  Anyone can add distributions to this pool.{' '}
                  {_token0 && _token1 ? (
                    <LinkInternal
                      href={`/pool/incentivize?chainId=${chainId}&fromCurrency=${
                        _token0.isNative ? 'NATIVE' : _token0.address
                      }&toCurrency=${
                        _token1.isNative ? 'NATIVE' : _token1.address
                      }&feeAmount=${positionDetails?.fee}`}
                    >
                      <Button asChild variant="link">
                        Want to add one?
                      </Button>
                    </LinkInternal>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <Tabs className="w-full" defaultValue="active">
                <CardContent>
                  <TabsList className="!flex">
                    <TabsTrigger value="active" className="flex flex-1">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="flex flex-1">
                      Upcoming & Expired
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
                <TabsContent value="active">
                  <DistributionDataTable
                    isLoading={rewardsLoading}
                    data={currentAngleRewardsPool?.distributionData.filter(
                      (el) => el.isLive,
                    )}
                  />
                </TabsContent>
                <TabsContent value="inactive">
                  <DistributionDataTable
                    isLoading={rewardsLoading}
                    data={currentAngleRewardsPool?.distributionData.filter(
                      (el) => !el.isLive,
                    )}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </>
        ) : null}
      </div>
    </>
  )
}

export const PositionView = ({ params }: { params: { id: string } }) => {
  return (
    <ConcentratedLiquidityProvider>
      <Component id={params.id} />
    </ConcentratedLiquidityProvider>
  )
}
