'use client'

import {
  Button,
  ChipInput,
  Currency,
  DateField,
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
  FormError,
  FormSection,
  LinkExternal,
  List,
  Separator,
  Slider,
  Switch,
  TextField,
  classNames,
  typographyVariants,
} from '@sushiswap/ui'
import format from 'date-fns/format'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useAngleRewardTokens } from 'src/lib/hooks/react-query'
import { Web3Input } from 'src/lib/wagmi/components/web3-input'
import { useConcentratedLiquidityPool } from 'src/lib/wagmi/hooks/pools/hooks/useConcentratedLiquidityPool'
import {
  AngleConditionsState,
  useAcceptAngleConditions,
} from 'src/lib/wagmi/hooks/rewards/hooks/useAcceptAngleConditions'
import { useIncentivizePoolWithRewards } from 'src/lib/wagmi/hooks/rewards/hooks/useIncentivizePoolWithRewards'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import {
  useApproved,
  withCheckerRoot,
} from 'src/lib/wagmi/systems/Checker/Provider'
import { ConcentratedLiquidityProvider } from 'src/ui/pool/ConcentratedLiquidityProvider'
import {
  ConcentratedLiquidityURLStateProvider,
  useConcentratedLiquidityURLState,
} from 'src/ui/pool/ConcentratedLiquidityURLStateProvider'
import { SelectFeeConcentratedWidget } from 'src/ui/pool/SelectFeeConcentratedWidget'
import { SelectNetworkWidget } from 'src/ui/pool/SelectNetworkWidget'
import { SelectTokensWidget } from 'src/ui/pool/SelectTokensWidget'
import { Chain, ChainId, ChainKey } from 'sushi/chain'
import {
  MERKL_SUPPORTED_CHAIN_IDS,
  SushiSwapV3ChainId,
  isMerklChainId,
  isWNativeSupported,
} from 'sushi/config'
import { Token, Type, tryParseAmount } from 'sushi/currency'
import { SushiSwapV3Pool } from 'sushi/pool/sushiswap-v3'
import { Address, zeroAddress } from 'viem'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'

const APPROVE_TAG = 'approve-incentivize'

export default function Page({ params }: { params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId
  return (
    <ConcentratedLiquidityURLStateProvider
      chainId={isMerklChainId(chainId) ? chainId : ChainId.ETHEREUM}
      supportedNetworks={MERKL_SUPPORTED_CHAIN_IDS}
    >
      <ConcentratedLiquidityProvider>
        <Incentivize />
      </ConcentratedLiquidityProvider>
    </ConcentratedLiquidityURLStateProvider>
  )
}

const Incentivize = withCheckerRoot(() => {
  const { address } = useAccount()
  const {
    chainId,
    token0,
    token1,
    setToken1,
    setToken0,
    feeAmount,
    setFeeAmount,
  } = useConcentratedLiquidityURLState()

  const router = useRouter()
  const { approved } = useApproved(APPROVE_TAG)
  const [value, setValue] = useState('')
  const [customize, setCustomize] = useState(false)
  const [customizeOOR, setCustomizeOOR] = useState(false)
  const [includeBlacklist, setIncludeBlacklist] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>()
  const [endDate, setEndDate] = useState<Date | null>()
  const [rewardToken, setRewardToken] = useState<Type>()
  const [blacklist, setBlacklist] = useState<string[]>([])
  const [distro1, setDistro1] = useState<number[]>([0])
  const [distro2, setDistro2] = useState<number[]>([0])
  const [distro3, setDistro3] = useState<number[]>([100])
  const totalDistro = distro1[0] + distro2[0] + distro3[0]

  const amount = useMemo(
    () => [tryParseAmount(value, rewardToken)],
    [value, rewardToken],
  )
  const { data: pool } = useConcentratedLiquidityPool({
    chainId,
    token0,
    token1,
    feeAmount,
  })

  const v3Address =
    token0 && token1 && feeAmount
      ? SushiSwapV3Pool.getAddress(token0.wrapped, token1.wrapped, feeAmount)
      : undefined

  const epochs = useMemo(() => {
    return startDate && endDate
      ? Math.floor((endDate.getTime() - startDate.getTime()) / 3600000)
      : undefined
  }, [startDate, endDate])

  const [angleConditionsState, { write }] = useAcceptAngleConditions()

  const { data: angleRewardTokens, isLoading: angleRewardTokensLoading } =
    useAngleRewardTokens({ chainId })

  const minAmount = useMemo(() => {
    if (!angleRewardTokens) return undefined
    const token = angleRewardTokens.find(
      (el) => el.token.wrapped.address === rewardToken?.wrapped.address,
    )
    if (token && epochs) return token.minimumAmountPerEpoch?.multiply(epochs)
  }, [angleRewardTokens, epochs, rewardToken])

  const {
    simulation: { isError, data: simulationData },
    write: { writeContractAsync, isPending: isIncentivizeLoading, data },
  } = useIncentivizePoolWithRewards({
    account: address,
    args:
      amount[0] && v3Address && rewardToken && epochs && startDate
        ? [
            {
              uniV3Pool: v3Address as Address,
              rewardToken: rewardToken.wrapped.address as Address,
              amount: amount[0].quotient,
              positionWrappers:
                blacklist.length > 0 ? (blacklist as Address[]) : [],
              wrapperTypes: blacklist.length > 0 ? [3] : [],
              propToken0: customize ? distro1[0] * 100 : 2000,
              propToken1: customize ? distro2[0] * 100 : 2000,
              propFees: customize ? distro3[0] * 100 : 6000,
              epochStart: Math.floor(startDate.getTime() / 1000) || 0,
              numEpoch: epochs,
              isOutOfRangeIncentivized: customizeOOR ? 1 : 0,
              boostedReward: 0,
              boostingAddress: zeroAddress,
              rewardId:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              additionalData:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            },
          ]
        : undefined,
    chainId: chainId as SushiSwapV3ChainId,
    enabled: Boolean(
      amount[0] &&
        v3Address &&
        rewardToken &&
        epochs &&
        startDate &&
        approved &&
        angleConditionsState === AngleConditionsState.ACCEPTED,
    ),
  })

  const { status } = useWaitForTransactionReceipt({ chainId, hash: data })

  const rewardTokens = useMemo(
    () =>
      angleRewardTokens
        ? angleRewardTokens.reduce<Record<string, Token>>((acc, cur) => {
            acc[cur.token.wrapped.address] = cur.token
            return acc
          }, {})
        : {},
    [angleRewardTokens],
  )

  const validStartDate = startDate ? startDate > new Date() : true
  const validEndDate =
    endDate && startDate ? endDate > startDate && endDate > new Date() : true

  return (
    <DialogProvider>
      <div className="flex flex-col gap-10">
        <SelectNetworkWidget
          title="On which network would you like to add rewards?"
          selectedNetwork={chainId}
          onSelect={(chainId) =>
            router.push(`/${ChainKey[chainId]}/pool/incentivize`)
          }
          networks={MERKL_SUPPORTED_CHAIN_IDS}
        />
        <SelectTokensWidget
          title="Which token pair would you like to incentivize?"
          chainId={chainId}
          token0={token0}
          token1={token1}
          setToken0={setToken0}
          setToken1={setToken1}
          includeNative={isWNativeSupported(chainId)}
        />
        <SelectFeeConcentratedWidget
          title="What is the fee tier for this pool?"
          feeAmount={feeAmount}
          setFeeAmount={setFeeAmount}
          token1={token1}
          token0={token0}
          disableIfNotExists={true}
        />
        <Separator />
        <FormSection
          title="Duration"
          description="The time period you want to distribute rewards within"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <DateField
                selected={startDate}
                onChange={setStartDate}
                portalId="root-portal"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                startDate={new Date(Date.now() + 5 * 60 * 1000)}
                minDate={new Date(Date.now() + 5 * 60 * 1000)}
                dateFormat="MMM d, yyyy HH:mm"
                placeholderText="Start date"
                autoComplete="off"
              />
              {!validStartDate ? (
                <FormError>Invalid start date.</FormError>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <DateField
                selected={endDate}
                onChange={setEndDate}
                portalId="root-portal"
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                startDate={
                  startDate ? startDate : new Date(Date.now() + 5 * 60 * 1000)
                }
                minDate={
                  startDate ? startDate : new Date(Date.now() + 5 * 60 * 1000)
                }
                dateFormat="MMM d, yyyy HH:mm"
                placeholderText="End date"
                autoComplete="off"
              />
              {!validEndDate ? <FormError>Invalid end date.</FormError> : null}
            </div>
          </div>
        </FormSection>
        <FormSection
          title="Rewards"
          description="How many rewards in total would you like to distribute?"
        >
          <Web3Input.Currency
            id="swap-from"
            type="INPUT"
            className="p-3 bg-white dark:bg-slate-800 rounded-xl"
            chainId={chainId}
            onSelect={setRewardToken}
            value={value}
            onChange={setValue}
            currency={rewardToken}
            currencies={rewardTokens}
            loading={angleRewardTokensLoading}
            currencyLoading={angleRewardTokensLoading}
            allowNative={false}
            hidePinnedTokens={true}
            hideSearch={true}
            {...(epochs &&
              rewardToken &&
              amount[0] &&
              minAmount &&
              amount[0].lessThan(minAmount) && {
                error: `Min. ${minAmount.toSignificant(4)} ${
                  rewardToken.symbol
                }`,
              })}
          />
          <p
            className={typographyVariants({
              variant: 'muted',
              className: 'text-sm',
            })}
          >
            Rewards are distributed per hour. The minimum reward for this
            distribution is dependent on the selected duration. <br />
            <br /> Looking to get your token added here?{' '}
            <Button variant="link" asChild>
              <LinkExternal href="https://rbieu62gj0f.typeform.com/to/KkrPkOFe">
                Get in touch with us.
              </LinkExternal>
            </Button>
          </p>
          <Separator className="!my-10" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1
                className={typographyVariants({
                  variant: 'p',
                  className: 'text-muted-foreground',
                })}
              >
                Customize the distribution formula?
              </h1>
              <Switch
                testdata-id="customize-distribution-switch"
                checked={customize}
                onCheckedChange={() => setCustomize((prevState) => !prevState)}
              />
            </div>
            <div
              className={classNames(
                'flex flex-col gap-3',
                customize ? 'mt-4' : 'hidden',
              )}
            >
              <div className="flex flex-col gap-10">
                <div className="flex flex-col">
                  {token0 ? (
                    <span className="flex items-center gap-2">
                      <Currency.Icon currency={token0} width={20} height={20} />
                      {token0?.symbol}
                    </span>
                  ) : null}
                  <div className="grid grid-cols-12 items-center gap-x-4">
                    <Slider
                      value={distro1}
                      onValueChange={setDistro1}
                      max={100}
                      step={5}
                      className="col-span-9 w-full"
                    />
                    <div className="col-span-3">
                      <TextField
                        isError={totalDistro !== 100}
                        unit="%"
                        type="number"
                        value={distro1[0]}
                        onValueChange={(val) => setDistro1([+val])}
                      />
                    </div>
                    <span className="col-span-9 text-sm text-muted-foreground">
                      Percentage of rewards that get distributed to{' '}
                      {token0?.symbol} liquidity
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  {token1 ? (
                    <span className="flex items-center gap-2">
                      <Currency.Icon currency={token1} width={20} height={20} />
                      {token1?.symbol}
                    </span>
                  ) : null}
                  <div className="grid grid-cols-12 items-center gap-x-4">
                    <Slider
                      value={distro2}
                      onValueChange={setDistro2}
                      max={100}
                      step={5}
                      className="col-span-9 w-full"
                    />
                    <div className="col-span-3">
                      <TextField
                        isError={totalDistro !== 100}
                        unit="%"
                        type="number"
                        value={distro2[0]}
                        onValueChange={(val) => setDistro2([+val])}
                      />
                    </div>
                    <span className="col-span-9 text-sm text-muted-foreground">
                      Percentage of rewards that get distributed to{' '}
                      {token1?.symbol} liquidity
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-2">Fees</span>
                  <div className="grid grid-cols-12 items-center gap-x-4">
                    <Slider
                      value={distro3}
                      onValueChange={setDistro3}
                      max={100}
                      step={5}
                      className="col-span-9 w-full"
                    />
                    <div className="col-span-3">
                      <TextField
                        isError={totalDistro !== 100}
                        unit="%"
                        type="number"
                        value={distro3[0]}
                        onValueChange={(val) => setDistro3([+val])}
                      />
                    </div>
                    <span className="col-span-9 text-sm text-muted-foreground">
                      Percentage of rewards that get distributed to fee
                      generation
                    </span>
                  </div>
                </div>
              </div>
              <h1
                className={classNames(
                  totalDistro !== 100 ? 'text-red' : 'text-muted-foreground',
                  'text-sm pt-4',
                )}
              >
                You have assigned <b>{totalDistro}%</b> of the available{' '}
                <b>100%</b>.
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1
                className={typographyVariants({
                  variant: 'p',
                  className: 'text-muted-foreground',
                })}
              >
                Exclude any addresses from receiving rewards?
              </h1>
              <Switch
                testdata-id="customize-blacklist-switch"
                checked={includeBlacklist}
                onCheckedChange={() =>
                  setIncludeBlacklist((prevState) => !prevState)
                }
              />
            </div>
            <div
              className={classNames(
                includeBlacklist ? 'flex flex-col gap-2' : 'hidden',
              )}
            >
              <ChipInput
                delimiters={[',', ' ', ';', ':']}
                values={blacklist}
                onValueChange={setBlacklist}
                placeholder="Address"
              />
              <p
                className={typographyVariants({
                  variant: 'muted',
                  className: 'text-sm px-3',
                })}
              >
                {blacklist.length > 0
                  ? `${blacklist.length} address${
                      blacklist.length > 1 ? 'es' : ''
                    } blacklisted.`
                  : 'The addresses to blacklist, use commas to separate addresses.'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h1
              className={typographyVariants({
                variant: 'p',
                className: 'text-muted-foreground',
              })}
            >
              Distribute rewards to positions that are out of range?
            </h1>
            <Switch
              testdata-id="customize-outofrange-switch"
              checked={customizeOOR}
              onCheckedChange={() => setCustomizeOOR((prevState) => !prevState)}
            />
          </div>
          <Separator className="!my-10" />
          <p
            className={typographyVariants({
              variant: 'muted',
              className: 'text-sm',
            })}
          >
            In order to incentivize a pool, you must review and agree to{' '}
            <Button variant="link" asChild>
              <LinkExternal href="https://docs.angle.money/merkl/incentivizor-tc">
                {`Merkl's Terms & Conditions`}
              </LinkExternal>
            </Button>
            .
          </p>
          <Checker.Connect>
            <Checker.Network chainId={chainId}>
              <Checker.Guard guardWhen={!pool} guardText="Pool not found">
                <Checker.Amounts chainId={chainId} amounts={amount}>
                  <Checker.Guard
                    guardWhen={!startDate || !endDate}
                    guardText="Enter duration"
                  >
                    <Checker.Guard
                      guardWhen={totalDistro !== 100}
                      guardText="Invalid distribution"
                    >
                      <Checker.Guard
                        guardWhen={!validEndDate || !validStartDate}
                        guardText="Invalid distribution duration"
                      >
                        <Checker.ApproveERC20
                          id="approve-erc20"
                          amount={amount[0]}
                          contract="0x8BB4C975Ff3c250e0ceEA271728547f3802B36Fd"
                        >
                          <Checker.Custom
                            showChildren={
                              angleConditionsState ===
                              AngleConditionsState.ACCEPTED
                            }
                            onClick={write!}
                            buttonText="Sign the terms & conditions"
                            loading={[
                              AngleConditionsState.PENDING,
                              AngleConditionsState.LOADING,
                              AngleConditionsState.UNKNOWN,
                            ].includes(angleConditionsState)}
                            disabled={
                              angleConditionsState !==
                                AngleConditionsState.NOT_ACCEPTED || !write
                            }
                          >
                            <Checker.Success tag={APPROVE_TAG}>
                              <DialogReview>
                                {({ confirm }) => (
                                  <>
                                    <DialogTrigger asChild>
                                      <Button
                                        fullWidth
                                        size="xl"
                                        testId="incentivize-pool-review"
                                      >
                                        Incentivize pool
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Incentivize Pool
                                        </DialogTitle>
                                        <DialogDescription>
                                          {token0?.symbol}/{token1?.symbol} •
                                          SushiSwap V3 • {feeAmount / 10000}%
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="flex flex-col gap-4">
                                        <List className="!pt-0">
                                          <List.Control>
                                            {pool ? (
                                              <List.KeyValue
                                                flex
                                                title="Network"
                                              >
                                                {Chain.from(pool.chainId)?.name}
                                              </List.KeyValue>
                                            ) : null}
                                            {feeAmount && (
                                              <List.KeyValue title="Fee Tier">{`${
                                                +feeAmount / 10000
                                              }%`}</List.KeyValue>
                                            )}
                                          </List.Control>
                                        </List>
                                        <List className="!pt-0">
                                          <List.Control>
                                            {startDate ? (
                                              <List.KeyValue
                                                flex
                                                title="Start date"
                                              >
                                                {format(
                                                  startDate,
                                                  'dd MMM yyyy hh:mmaaa',
                                                )}
                                              </List.KeyValue>
                                            ) : null}
                                            {endDate ? (
                                              <List.KeyValue
                                                flex
                                                title="End date"
                                              >
                                                {format(
                                                  endDate,
                                                  'dd MMM yyyy hh:mmaaa',
                                                )}
                                              </List.KeyValue>
                                            ) : null}
                                            {amount[0] ? (
                                              <List.KeyValue
                                                title={'Total distributed'}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <Currency.Icon
                                                    currency={
                                                      amount[0].currency
                                                    }
                                                    width={18}
                                                    height={18}
                                                  />
                                                  <span>
                                                    {amount[0].toSignificant(6)}{' '}
                                                    {amount[0].currency.symbol}
                                                  </span>
                                                </div>
                                              </List.KeyValue>
                                            ) : null}
                                            <List.KeyValue
                                              flex
                                              title="Out of range incentivization"
                                              subtitle="Distribute rewards to out of range positions"
                                            >
                                              {customizeOOR ? 'Yes' : 'No'}
                                            </List.KeyValue>
                                            <List.KeyValue
                                              flex
                                              title="Exclude addresses"
                                              subtitle="Excluded addresses from receiving rewards"
                                            >
                                              {blacklist
                                                ? `${blacklist.length} Addresses`
                                                : 'No'}
                                            </List.KeyValue>
                                            {token0 && token1 ? (
                                              <List.KeyValue
                                                flex
                                                title="Customized distribution formula"
                                                subtitle={`${token0.symbol} / ${token1.symbol} / Fees`}
                                              >
                                                {customize
                                                  ? `${distro1[0]}% / ${distro2[0]}% / ${distro3[0]}%`
                                                  : 'No'}
                                              </List.KeyValue>
                                            ) : null}
                                          </List.Control>
                                        </List>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          fullWidth
                                          size="xl"
                                          variant={
                                            isError ? 'destructive' : 'default'
                                          }
                                          loading={
                                            isIncentivizeLoading && !isError
                                          }
                                          onClick={async () => {
                                            // Typecheck speedup
                                            const _simulationData: any =
                                              simulationData

                                            if (
                                              !writeContractAsync ||
                                              !_simulationData
                                            ) {
                                              return
                                            }

                                            try {
                                              await writeContractAsync(
                                                _simulationData.request,
                                              )
                                              confirm()
                                            } catch {}
                                          }}
                                          disabled={
                                            isIncentivizeLoading || isError
                                          }
                                          testId="incentivize-pool-confirm"
                                        >
                                          {isError ? (
                                            'Shoot! Something went wrong :('
                                          ) : isIncentivizeLoading ? (
                                            <Dots>Incentivize Pool</Dots>
                                          ) : (
                                            'Incentivize Pool'
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </>
                                )}
                              </DialogReview>
                            </Checker.Success>
                          </Checker.Custom>
                        </Checker.ApproveERC20>
                      </Checker.Guard>
                    </Checker.Guard>
                  </Checker.Guard>
                </Checker.Amounts>
              </Checker.Guard>
            </Checker.Network>
          </Checker.Connect>
        </FormSection>
      </div>
      {pool && token0 && token1 ? (
        <DialogConfirm
          chainId={chainId}
          status={status}
          testId="incentivize-confirmation-modal"
          successMessage={`Successfully incentivized the ${token0.symbol}/${token1.symbol} V3 pool`}
          buttonText="Go to pool"
          buttonLink={`/${pool.chainId}/pool/v3/${v3Address}`}
          txHash={data}
        />
      ) : null}
    </DialogProvider>
  )
})
