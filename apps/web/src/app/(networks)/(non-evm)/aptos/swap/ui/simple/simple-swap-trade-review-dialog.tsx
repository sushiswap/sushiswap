'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
  SlippageToleranceStorageKey,
  useSlippageTolerance,
} from '@sushiswap/hooks'
import {
  Badge,
  Button,
  Dots,
  List,
  SkeletonBox,
  SkeletonCircle,
  SkeletonText,
  classNames,
} from '@sushiswap/ui'
import { Provider } from 'aptos'
import React, { FC } from 'react'
import { DEFAULT_SLIPPAGE } from 'sushi/config'
import { ModalType } from '~aptos/_common//components/Modal/ModalProvider'
import { Modal } from '~aptos/_common/components/Modal/Modal'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { formatNumberWithDecimals } from '~aptos/_common/lib/common/format-number-with-decimals'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { CurrencyIcon } from '~aptos/_common/ui/currency/currency-icon'
import { createToast } from '~aptos/_common/ui/toast'
import { getSwapPayload } from '~aptos/swap/lib/get-swap-payload'
import { useSwap } from '~aptos/swap/lib/use-swap'
import {
  warningSeverity,
  warningSeverityClassName,
} from '~aptos/swap/lib/warning-severity'
import {
  useSimpleSwapActions,
  useSimpleSwapState,
} from '~aptos/swap/ui/simple/simple-swap-provider/simple-swap-provider'

export const SimpleSwapTradeReviewDialog: FC = () => {
  const {
    bestRoutes,
    token0,
    token1,
    slippageAmount,
    amount,
    outputAmount,
    isPriceFetching,
    isTransactionPending,
  } = useSimpleSwapState()
  const { account, signAndSubmitTransaction } = useWallet()
  const { setisTransactionPending, setAmount } = useSimpleSwapActions()

  const { data: routes } = useSwap()

  const minOutput = slippageAmount
    ? formatNumberWithDecimals(slippageAmount, token1 ? token1.decimals : 8)
    : 0

  const {
    network,
    contracts: { swap: swapContract },
  } = useNetwork()

  const swapToken = async (close: () => void) => {
    const provider = new Provider(networkNameToNetwork(network))
    const payload = getSwapPayload(
      swapContract,
      parseInt(
        (parseFloat(String(amount)) *
          10 ** token0.decimals) as unknown as string,
      ),
      bestRoutes,
      parseInt(String(slippageAmount)),
    )
    if (!account?.address) return []
    setisTransactionPending(true)
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(payload)
      // wait for transaction
      await provider.waitForTransaction(response?.hash)

      //return from here if response is failed
      if (!response?.output.success) return
      const toastId = `completed:${response?.hash}`
      createToast({
        summery: `Swap ${amount} ${token0.symbol} for ${parseFloat(
          (parseInt(outputAmount) / 10 ** token1?.decimals).toFixed(9),
        )} ${token1.symbol}`,
        toastId: toastId,
      })
      close()
      setAmount('')
    } catch (_e) {
      const toastId = `failed:${Math.random()}`
      createToast({ summery: 'User rejected request', toastId: toastId })
    } finally {
      setisTransactionPending(false)
    }
  }
  const [slippageTolerance] = useSlippageTolerance(
    SlippageToleranceStorageKey.Swap,
  )

  return (
    <>
      <Modal.Review
        modalType={ModalType.Regular}
        variant="opaque"
        tag="review-modal"
      >
        {({ close }) => (
          <div className="max-w-[504px] mx-auto">
            <button type="button" onClick={close} className="p-3 pl-0">
              <ArrowLeftIcon strokeWidth={3} width={24} height={24} />
            </button>
            <div className="flex items-start justify-between gap-4 py-2">
              <div className="flex flex-col flex-grow gap-1">
                {!outputAmount || isPriceFetching ? (
                  <SkeletonText fontSize="3xl" className="w-2/3" />
                ) : (
                  <h1 className="text-3xl font-semibold dark:text-slate-50">
                    Buy{' '}
                    {formatNumberWithDecimals(
                      Number(outputAmount),
                      token1.decimals,
                    )}{' '}
                    {token1?.symbol}
                  </h1>
                )}
                <h1 className="text-lg font-medium text-gray-900 dark:text-slate-300">
                  Sell {amount} {token0?.symbol}
                </h1>
              </div>
              <div className="min-w-[56px] min-h-[56px]">
                <div className="pr-1">
                  <Badge
                    position="bottom-right"
                    badgeContent={
                      <div className="bg-gray-100 border-2 border-gray-100 rounded-full">
                        <PlusIcon
                          strokeWidth={2}
                          width={24}
                          height={24}
                          className="bg-blue text-white rounded-full p-0.5"
                        />
                      </div>
                    }
                  >
                    {token1 ? (
                      <CurrencyIcon currency={token1} width={56} height={56} />
                    ) : (
                      // <img src={token1.logoURI} className="rounded-full" width={56} height={56} />
                      <SkeletonCircle
                        radius={56}
                        className="bg-gray-100 dark:bg-slate-800"
                      />
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <List>
                <List.Control>
                  <List.KeyValue title="Network">APTOS</List.KeyValue>
                  <List.KeyValue
                    title="Price Impact"
                    subtitle="The impact your trade has on the market price of this pool."
                  >
                    <span
                      className={classNames(
                        warningSeverityClassName(
                          warningSeverity(routes?.priceImpact),
                        ),
                        'text-gray-700 text-right dark:text-slate-400 ',
                      )}
                    >
                      {isPriceFetching ? (
                        <SkeletonBox className="h-4 py-0.5 w-[60px] rounded-md" />
                      ) : (
                        <>
                          {routes?.priceImpact
                            ? (-routes?.priceImpact).toFixed(4)
                            : 0}
                          %
                        </>
                      )}
                    </span>
                  </List.KeyValue>
                  <List.KeyValue
                    title={`Min. received after slippage (${
                      slippageTolerance === 'AUTO'
                        ? DEFAULT_SLIPPAGE
                        : slippageTolerance
                    }%)`}
                    subtitle="The minimum amount you are guaranteed to receive."
                  >
                    {!outputAmount || isPriceFetching ? (
                      <SkeletonText
                        align="right"
                        fontSize="sm"
                        className="w-1/2"
                      />
                    ) : (
                      <>
                        {minOutput} {token1?.symbol}
                      </>
                    )}
                  </List.KeyValue>

                  <List.KeyValue title="Network fee">
                    {isPriceFetching ? (
                      <SkeletonText
                        align="right"
                        fontSize="sm"
                        className="w-1/3"
                      />
                    ) : (
                      '~$0.00'
                    )}
                  </List.KeyValue>
                </List.Control>

                {account?.address && (
                  <List className="!pt-2">
                    <List.Control>
                      <List.KeyValue title="Recipient">
                        <a
                          target="_blank"
                          href={`https://explorer.aptoslabs.com/account/${
                            account?.address
                          }?network=${networkNameToNetwork(network)}`}
                          className={classNames(
                            'flex items-center gap-2 cursor-pointer text-blue',
                          )}
                          rel="noreferrer"
                        >
                          {`${account?.address.substring(
                            0,
                            6,
                          )}...${account?.address.substring(66 - 4)}`}
                        </a>
                      </List.KeyValue>
                    </List.Control>
                  </List>
                )}
              </List>
            </div>
            <div className="pt-4">
              <div className="space-y-4">
                <Button
                  disabled={isTransactionPending || isPriceFetching}
                  color="blue"
                  fullWidth
                  size="xl"
                  onClick={() => {
                    swapToken(close)
                  }}
                >
                  {isTransactionPending ? (
                    <Dots>Confirm Swap</Dots>
                  ) : (
                    <>
                      Swap {token0?.symbol} For {token1?.symbol}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal.Review>
    </>
  )
}
