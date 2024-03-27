import { RefreshIcon } from '@heroicons/react-v1/solid'
import { REFERRER_ADDRESS, getCliffTimestamp } from '@sushiswap/bonds-sdk'
import { bondFixedTermTellerAbi } from '@sushiswap/bonds-sdk/abi'
import { Bond } from '@sushiswap/client'
import {
  Button,
  DialogConfirm,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  Dots,
  List,
  SkeletonText,
  classNames,
  createErrorToast,
  createToast,
} from '@sushiswap/ui'
import {
  UseSimulateContractParameters,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from '@sushiswap/wagmi'
import { useAccount, useWaitForTransactionReceipt } from '@sushiswap/wagmi'
import { useApproved } from '@sushiswap/wagmi/systems/Checker/Provider'
import { SendTransactionReturnType } from '@wagmi/core'
import format from 'date-fns/format'
import formatDistance from 'date-fns/formatDistance'
import { FC, ReactNode, useCallback, useMemo } from 'react'
import { APPROVE_TAG_BONDS } from 'src/lib/constants'
import {
  Percent,
  formatPercent,
  formatUSD,
  shortenAddress,
  slippageAmount,
} from 'sushi'
import { Chain } from 'sushi/chain'
import { Amount, Token } from 'sushi/currency'
import { UserRejectedRequestError } from 'viem'

interface BondsBuyReviewModal {
  bond: Bond
  discount: number | undefined
  quoteAmount: Amount<Token>
  payoutAmount: Amount<Token>
  onSuccess: () => void
  successLink?: string
  children: ReactNode
}

export const BondsBuyReviewModal: FC<BondsBuyReviewModal> = ({
  bond,
  discount,
  quoteAmount,
  payoutAmount,
  onSuccess: _onSuccess,
  successLink,
  children,
}) => {
  const { address, chain } = useAccount()
  const client = usePublicClient()

  const { approved } = useApproved(APPROVE_TAG_BONDS)

  const cliffTimestamp =
    getCliffTimestamp({
      vestingLength: bond.vesting,
      vestingType: bond.vestingType,
    }) * 1000

  const isNegativeDiscount = discount && discount < 0
  const buttonVariant = isNegativeDiscount ? 'destructive' : 'default'
  const buttonText = isNegativeDiscount ? 'Bond Anyways' : 'Bond'

  const slippagePercent = useMemo(() => {
    return new Percent(5, 1000)
  }, [])

  const onSuccess = useCallback(
    (hash: SendTransactionReturnType) => {
      _onSuccess()

      const ts = new Date().getTime()
      void createToast({
        account: address,
        type: 'mint',
        chainId: bond.chainId,
        txHash: hash,
        promise: client.waitForTransactionReceipt({ hash: hash }),
        summary: {
          pending: `Purchasing bond (${payoutAmount.toSignificant(6)} ${
            payoutAmount.currency.symbol
          }) with ${quoteAmount.toSignificant(6)} ${
            quoteAmount.currency.symbol
          }`,
          completed: `Purchased bond (${payoutAmount.toSignificant(6)} ${
            payoutAmount.currency.symbol
          }) with ${quoteAmount.toSignificant(6)} ${
            quoteAmount.currency.symbol
          }`,
          failed: `Failed to purchase bond (${payoutAmount.toSignificant(6)} ${
            payoutAmount.currency.symbol
          }) with ${quoteAmount.toSignificant(6)} ${
            quoteAmount.currency.symbol
          }`,
        },
        timestamp: ts,
        groupTimestamp: ts,
      })
    },
    [client, address, bond.chainId, payoutAmount, quoteAmount, _onSuccess],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof UserRejectedRequestError) {
      createErrorToast(e?.message, true)
    }
  }, [])

  const prepare = useMemo(() => {
    if (!discount || !address) return undefined

    return {
      address: bond.tellerAddress,
      abi: bondFixedTermTellerAbi,
      functionName: 'purchase',
      args: [
        address,
        REFERRER_ADDRESS[bond.chainId],
        BigInt(bond.marketId),
        quoteAmount.quotient,
        slippageAmount(payoutAmount, slippagePercent)[0],
      ],
    } as const satisfies UseSimulateContractParameters
  }, [
    address,
    bond.chainId,
    bond.tellerAddress,
    bond.marketId,
    discount,
    quoteAmount,
    payoutAmount,
    slippagePercent,
  ])

  const { data: simulation, isError } = useSimulateContract({
    ...prepare,
    chainId: bond.chainId,
    query: {
      enabled: Boolean(bond.chainId === chain?.id && address && approved),
    },
  })

  const {
    writeContractAsync,
    isLoading: isWritePending,
    data,
  } = useWriteContract({
    mutation: {
      onSuccess,
      onError,
    },
  })

  const write = useMemo(() => {
    if (!simulation || !address) return undefined

    return async (confirm: () => void) => {
      try {
        await writeContractAsync(simulation.request)
        confirm()
      } catch {}
    }
  }, [address, writeContractAsync, simulation])

  const { status } = useWaitForTransactionReceipt({
    chainId: bond.chainId,
    hash: data,
  })

  return (
    <DialogProvider>
      <DialogReview>
        {({ confirm }) => (
          <>
            {children}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Purchase bond ({payoutAmount.toSignificant(6)}{' '}
                  {payoutAmount.currency.symbol})
                </DialogTitle>
                <DialogDescription>
                  With {quoteAmount.toSignificant(6)}{' '}
                  {quoteAmount.currency.symbol}
                </DialogDescription>
              </DialogHeader>
              {isNegativeDiscount && (
                <div className="flex items-start p-3 rounded-xl bg-red/20">
                  <label className="text-sm font-medium text-red-500">
                    This market is currently priced at a premium, it is cheaper
                    to buy on the market.
                  </label>
                </div>
              )}
              <div className="w-full bg-[rgba(0,0,0,0.04)] text-gray-500 dark:text-gray-400 dark:bg-[#1A2031] text-sm rounded-xl px-4 py-2 flex flex-row items-center space-x-3">
                <RefreshIcon
                  height={16}
                  width={16}
                  className="animate-rotate"
                />
                <div>
                  <span>Price quote is refreshed automatically every</span>
                  <span className="text-blue font-semibold"> 4 </span>
                  <span>seconds.</span>
                </div>
              </div>
              <List className="!pt-0">
                <List.Control>
                  <List.KeyValue title="Network">
                    {Chain.from(bond.chainId)?.name}
                  </List.KeyValue>
                  <List.KeyValue
                    title="Discount"
                    subtitle="Percentage off current spot price."
                  >
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
                  </List.KeyValue>
                  <List.KeyValue
                    title="Cliff"
                    subtitle="Amount of days until discounted tokens are claimable from the moment they are purchased."
                  >
                    {formatDistance(cliffTimestamp, Date.now())}
                  </List.KeyValue>
                  <List.KeyValue
                    title="Claimable Date"
                    subtitle="The date when tokens are available for claim."
                  >
                    {format(cliffTimestamp, 'MMM dd, yyyy')}
                    <br />
                    {format(cliffTimestamp, 'HH:mm')}
                  </List.KeyValue>
                  <List.KeyValue
                    title="Bond"
                    subtitle="Asset used to purchase the bond."
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {quoteAmount.toSignificant(4)}{' '}
                        {quoteAmount.currency.symbol}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatUSD('0')}
                      </span>
                    </div>
                  </List.KeyValue>
                  <List.KeyValue
                    title="Payout"
                    subtitle="Token available for purchase at a discount."
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {payoutAmount.toSignificant(4)}{' '}
                        {payoutAmount.currency.symbol}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatUSD('0')}
                      </span>
                    </div>
                  </List.KeyValue>
                </List.Control>
                <List.Control>
                  <List.KeyValue title="Bonder">
                    {address ? (
                      shortenAddress(address)
                    ) : (
                      <SkeletonText fontSize="sm" />
                    )}
                  </List.KeyValue>
                </List.Control>
              </List>
              <DialogFooter className="mt-4">
                <Button
                  size="xl"
                  fullWidth
                  loading={!write || isWritePending}
                  onClick={() => write?.(confirm)}
                  testId="confirm-buy-bond"
                  type="button"
                  variant={buttonVariant}
                >
                  {isError ? (
                    'Shoot! Something went wrong :('
                  ) : isWritePending ? (
                    <Dots>{buttonText}</Dots>
                  ) : (
                    <>{buttonText}</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </>
        )}
      </DialogReview>
      <DialogConfirm
        chainId={bond.chainId}
        status={status}
        testId="buy-bond-confirmation-modal"
        successMessage={`Successfully purchased a bond (${payoutAmount.toSignificant(
          4,
        )} ${payoutAmount.currency.symbol} with ${quoteAmount.toSignificant(
          4,
        )} ${quoteAmount.currency.symbol})`}
        txHash={data}
        buttonLink={successLink}
        buttonText="View your bond"
      />
    </DialogProvider>
  )
}
