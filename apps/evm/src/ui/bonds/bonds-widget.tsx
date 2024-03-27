'use client'

import { ArrowDownIcon } from '@heroicons/react/24/solid'
import { getCliffTimestamp } from '@sushiswap/bonds-sdk'
import { Bond } from '@sushiswap/client'
import { useIsMounted } from '@sushiswap/hooks'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  DialogTrigger,
  Explainer,
  LinkInternal,
  SkeletonText,
  classNames,
} from '@sushiswap/ui'
import {
  Checker,
  Web3Input,
  useAccount,
  useBondMarketDetails,
} from '@sushiswap/wagmi'
import { CheckerProvider } from '@sushiswap/wagmi/systems/Checker/Provider'
import format from 'date-fns/format'
import formatDistance from 'date-fns/formatDistance'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { APPROVE_TAG_BONDS } from 'src/lib/constants'
import { Amount, Token, tryParseAmount } from 'sushi/currency'
import { formatPercent } from 'sushi/format'
import { BondsBuyReviewModal } from './bonds-buy-review-modal'

const GetTokens = ({ bond }: { bond: Bond }) => {
  if (!bond.quoteToken.pool && !bond.quoteToken.vault) return null

  let text = ''
  let link: React.JSX.Element = <></>

  if (bond.quoteToken.pool) {
    const pool = bond.quoteToken.pool
    text = `Get ${pool.token0.symbol}/${pool.token1.symbol} SLP tokens`
    link = (
      <LinkInternal
        href={`/pool/${bond.quoteToken.pool.poolId}`}
        target="_blank"
      >
        Go to pool
      </LinkInternal>
    )
  } else if (bond.quoteToken.vault) {
    const vault = bond.quoteToken.vault

    text = `Get ${vault.token0.symbol}/${vault.token1.symbol} LP tokens`
    link = (
      <LinkInternal
        href={`/pool/${bond.quoteToken.vault.poolId}/smart/${bond.quoteToken.vault.id}`}
        target="_blank"
      >
        Go to Smart Pool
      </LinkInternal>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-r from-[rgba(9,147,236,0.1)] to-[rgba(243,56,195,0.1)] rounded-xl px-3 py-1">
      <div className="flex w-full justify-between text-[13px] flex-wrap">
        <div className="dark:text-gray-400 flex flex-row items-center space-x-1 whitespace-nowrap">
          <span>{text}</span>
          <Explainer>
            Liquidity Provider (LP) tokens represent proportional ownership of
            the liquidity pool when you provide liquidity to the corresponding
            pool on Sushi, they are redeemable for the originally deposited
            assets and accrued trading fee. By spending your LP tokens to
            acquire the bond, you will be trading them with the vested tokens at
            a discount instead.
          </Explainer>
        </div>
        <div className="text-blue whitespace-nowrap">{link}</div>
      </div>
    </div>
  )
}

export const BondsWidget = ({ bond: staleBond }: { bond: Bond }) => {
  const [quoteToken, payoutToken] = useMemo(() => {
    return [new Token(staleBond.quoteToken), new Token(staleBond.payoutToken)]
  }, [staleBond.quoteToken, staleBond.payoutToken])

  const { chain } = useAccount()

  const { maxAmountAccepted, availableCapacity, marketPrice, discount } =
    useBondMarketDetails({
      bond: staleBond,
    })

  // Amount handling
  const [independentField, setIndependentField] = useState<'quote' | 'payout'>(
    'quote',
  )

  const [quoteInputField, setQuoteInput] = useState('')
  const [payoutInputField, setPayoutInput] = useState('')

  const [quoteAmount, setQuoteAmount] = useState(
    Amount.fromRawAmount(quoteToken, 0),
  )
  const [payoutAmount, setPayoutAmount] = useState(
    Amount.fromRawAmount(payoutToken, 0),
  )

  const onQuoteInput = useCallback(
    (value: string) => {
      if (!maxAmountAccepted || !marketPrice) {
        return
      }

      let quoteAmount = tryParseAmount(value, quoteToken)

      if (quoteAmount === undefined) {
        quoteAmount = Amount.fromRawAmount(quoteToken, 0)
      }

      if (quoteAmount.greaterThan(maxAmountAccepted)) {
        quoteAmount = maxAmountAccepted
        value = quoteAmount.toSignificant(8)
      }

      setIndependentField('quote')
      setQuoteInput(value)
      setQuoteAmount(quoteAmount)

      let payoutAmount = quoteAmount
        .multiply(staleBond.marketScale)
        .divide(marketPrice)
      payoutAmount = Amount.fromFractionalAmount(
        payoutToken,
        payoutAmount.numerator,
        payoutAmount.denominator,
      )

      setPayoutAmount(payoutAmount)
      setPayoutInput(value === '' ? '' : payoutAmount.toSignificant(8))
    },
    [
      maxAmountAccepted,
      marketPrice,
      quoteToken,
      staleBond.marketScale,
      payoutToken,
    ],
  )

  const onPayoutInput = useCallback(
    (value: string) => {
      if (!availableCapacity || !marketPrice) {
        return
      }

      let payoutAmount = tryParseAmount(value, payoutToken)

      if (payoutAmount === undefined) {
        payoutAmount = Amount.fromRawAmount(payoutToken, 0)
      }

      if (payoutAmount.greaterThan(availableCapacity)) {
        payoutAmount = availableCapacity
        value = payoutAmount.toSignificant(8)
      }

      setIndependentField('payout')
      setPayoutInput(value)
      setPayoutAmount(payoutAmount)

      let quoteAmount = payoutAmount
        .multiply(marketPrice)
        .divide(staleBond.marketScale)
      quoteAmount = Amount.fromFractionalAmount(
        quoteToken,
        quoteAmount.numerator,
        quoteAmount.denominator,
      )

      setQuoteAmount(quoteAmount)
      setQuoteInput(value === '' ? '' : quoteAmount.toSignificant(8))
    },
    [
      availableCapacity,
      marketPrice,
      payoutToken,
      quoteToken,
      staleBond.marketScale,
    ],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to update quote/payout input fields when market price changes
  useEffect(() => {
    if (independentField === 'quote') {
      onQuoteInput(quoteInputField)
    } else {
      onPayoutInput(payoutInputField)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketPrice])

  // Negative discount warning
  const [noDiscountConfirmed, setNoDiscountConfirmed] = useState(false)

  const isMounted = useIsMounted()

  const hasEnded = staleBond.end * 1000 < Date.now() || staleBond.isClosed
  const isNegativeDiscount = Boolean(discount && discount < 0)
  const buttonVariant = isNegativeDiscount ? 'destructive' : 'default'
  const buttonText = isNegativeDiscount ? 'Bond Anyways' : 'Bond'

  return (
    <CheckerProvider>
      <Card>
        <CardHeader>
          <CardTitle>Bond</CardTitle>
          <CardDescription>
            <div>
              Acquire vested tokens at a discount using the widget below.
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GetTokens bond={staleBond} />
          <div className="flex flex-col gap-4">
            <Web3Input.Currency
              type="INPUT"
              className="border border-accent px-3 py-1.5 !rounded-xl"
              loading={false}
              value={quoteInputField}
              onChange={onQuoteInput}
              currency={quoteToken}
              chainId={staleBond.chainId}
              hideIcon={Boolean(
                staleBond.quoteToken.pool || staleBond.quoteToken.vault,
              )}
              hidePricing={Boolean(
                staleBond.quoteToken.pool || staleBond.quoteToken.vault,
              )}
            />
            <div className="flex items-center justify-center mt-[-24px] mb-[-24px] z-10">
              <div className="p-1 bg-white dark:bg-slate-900 border border-accent rounded-full">
                <ArrowDownIcon
                  width={16}
                  height={16}
                  className="text-muted-foreground"
                />
              </div>
            </div>
            <Web3Input.Currency
              type="OUTPUT"
              className="border border-accent px-3 py-1.5 !rounded-xl"
              value={payoutInputField}
              onChange={onPayoutInput}
              currency={payoutToken}
              chainId={staleBond.chainId}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full">
            {isMounted ? (
              <Checker.Guard
                guardText="Market Closed"
                guardWhen={hasEnded}
                fullWidth
              >
                <Checker.Connect fullWidth>
                  <Checker.Network chainId={staleBond.chainId} fullWidth>
                    <Checker.Amounts
                      chainId={staleBond.chainId}
                      amounts={[quoteAmount]}
                      fullWidth
                    >
                      <Checker.ApproveERC20
                        id="approve-erc20"
                        amount={quoteAmount}
                        contract={staleBond.tellerAddress}
                        fullWidth
                      >
                        <Checker.Success tag={APPROVE_TAG_BONDS}>
                          <Checker.Guard
                            guardText={buttonText}
                            guardWhen={Boolean(
                              (discount || -1) <= 0 && !noDiscountConfirmed,
                            )}
                            variant={buttonVariant}
                            fullWidth
                          >
                            <BondsBuyReviewModal
                              bond={staleBond}
                              discount={discount}
                              quoteAmount={quoteAmount}
                              payoutAmount={payoutAmount}
                              onSuccess={() => onQuoteInput('')}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant={buttonVariant}
                                  size="xl"
                                  fullWidth
                                >
                                  {buttonText}
                                </Button>
                              </DialogTrigger>
                            </BondsBuyReviewModal>
                          </Checker.Guard>
                        </Checker.Success>
                      </Checker.ApproveERC20>
                    </Checker.Amounts>
                  </Checker.Network>
                </Checker.Connect>
              </Checker.Guard>
            ) : (
              <Button size="xl" fullWidth disabled>
                Enter Amount
              </Button>
            )}
            <Collapsible
              open={
                quoteAmount.greaterThan(0) && chain?.id === staleBond.chainId
              }
              className="flex flex-col"
            >
              {isNegativeDiscount && (
                <div className="mt-4 flex items-start px-4 py-3 rounded-xl bg-red/20">
                  <input
                    id="expert-checkbox"
                    type="checkbox"
                    checked={noDiscountConfirmed}
                    onChange={(e) => setNoDiscountConfirmed(e.target.checked)}
                    className="cursor-pointer mr-1 w-5 h-5 mt-0.5 text-red-500 !ring-red-600 bg-white border-red rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 scale-75"
                  />
                  <label
                    htmlFor="expert-checkbox"
                    className="text-sm ml-2 font-medium text-red-500"
                  >
                    I understand this market is currently priced at a premium,
                    it is cheaper to buy on the market.
                  </label>
                </div>
              )}

              <div className="w-full px-2 flex flex-col gap-2 mt-4">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-slate-400">
                    Discount
                  </span>
                  {discount !== undefined ? (
                    <span
                      className={classNames(
                        isNegativeDiscount ? 'text-red' : 'text-green',
                        'text-sm font-medium text-right',
                      )}
                    >
                      {formatPercent(discount)}
                    </span>
                  ) : (
                    <SkeletonText fontSize="sm" />
                  )}
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-slate-400">
                    Cliff
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-400 text-right">
                    {isMounted &&
                      formatDistance(
                        getCliffTimestamp({
                          vestingLength: staleBond.vesting,
                          vestingType: staleBond.vestingType,
                        }) * 1000,
                        Date.now(),
                      )}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-slate-400">
                    Claimable Date
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-400 text-right">
                    {isMounted &&
                      format(
                        getCliffTimestamp({
                          vestingLength: staleBond.vesting,
                          vestingType: staleBond.vestingType,
                        }) * 1000,
                        'MMM dd, yyyy HH:mm',
                      )}
                  </span>
                </div>
              </div>
            </Collapsible>
          </div>
        </CardFooter>
      </Card>
    </CheckerProvider>
  )
}
