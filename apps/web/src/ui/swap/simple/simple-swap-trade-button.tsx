'use client'

import { DialogTrigger } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import React, { FC, useEffect, useState } from 'react'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import {
  ROUTE_PROCESSOR_5_ADDRESS,
  isRouteProcessor5ChainId,
} from 'sushi/config'
import { Native } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { APPROVE_TAG_SWAP } from '../../../lib/constants'
import { usePersistedSlippageError } from '../../../lib/hooks'
import { warningSeverity } from '../../../lib/swap/warningSeverity'
import {
  useDerivedStateSimpleSwap,
  useSimpleSwapTrade,
} from './derivedstate-simple-swap-provider'
import { SimpleSwapTradeReviewDialog } from './simple-swap-trade-review-dialog'
import { useIsSwapMaintenance } from './use-is-swap-maintenance'

export const SimpleSwapTradeButton: FC = () => {
  return (
    <>
      <SimpleSwapTradeReviewDialog>
        {({ error, isSuccess }) => (
          <_SimpleSwapTradeButton error={error} isSuccess={isSuccess} />
        )}
      </SimpleSwapTradeReviewDialog>
    </>
  )
}

export const _SimpleSwapTradeButton: FC<{
  error: Error | null
  isSuccess: boolean
}> = ({ error, isSuccess }) => {
  const { data: maintenance } = useIsSwapMaintenance()
  const { isSlippageError } = usePersistedSlippageError({ isSuccess, error })
  const { data: trade } = useSimpleSwapTrade()
  const [checked, setChecked] = useState(false)

  const {
    state: { swapAmount, swapAmountString, chainId, token0, token1 },
  } = useDerivedStateSimpleSwap()

  const isWrap =
    token0?.isNative &&
    token1?.wrapped.address === Native.onChain(chainId).wrapped.address
  const isUnwrap =
    token1?.isNative &&
    token0?.wrapped.address === Native.onChain(chainId).wrapped.address

  // Reset
  useEffect(() => {
    if (warningSeverity(trade?.priceImpact) <= 3) {
      setChecked(false)
    }
  }, [trade?.priceImpact])

  return (
    <>
      <div>
        <Checker.Guard
          guardWhen={maintenance}
          guardText="Maintenance in progress"
        >
          <Checker.Connect>
            <Checker.Network chainId={chainId}>
              <Checker.Amounts chainId={chainId} amount={swapAmount}>
                <Checker.ApproveERC20
                  id="approve-erc20"
                  amount={swapAmount}
                  contract={
                    isRouteProcessor5ChainId(chainId)
                      ? ROUTE_PROCESSOR_5_ADDRESS[chainId]
                      : undefined
                  }
                >
                  <Checker.Success tag={APPROVE_TAG_SWAP}>
                    <DialogTrigger asChild>
                      <Button
                        size="xl"
                        disabled={Boolean(
                          isSlippageError ||
                            error ||
                            !trade?.amountOut?.greaterThan(ZERO) ||
                            trade?.route?.status === 'NoWay' ||
                            +swapAmountString === 0 ||
                            (!checked &&
                              warningSeverity(trade?.priceImpact) > 3),
                        )}
                        color={
                          warningSeverity(trade?.priceImpact) >= 3
                            ? 'red'
                            : 'blue'
                        }
                        fullWidth
                        testId="swap"
                      >
                        {!checked && warningSeverity(trade?.priceImpact) >= 3
                          ? 'Price impact too high'
                          : trade?.route?.status === 'NoWay'
                            ? 'No trade found'
                            : isWrap
                              ? 'Wrap'
                              : isUnwrap
                                ? 'Unwrap'
                                : 'Swap'}
                      </Button>
                    </DialogTrigger>
                  </Checker.Success>
                </Checker.ApproveERC20>
              </Checker.Amounts>
            </Checker.Network>
          </Checker.Connect>
        </Checker.Guard>
      </div>
      {warningSeverity(trade?.priceImpact) > 3 && (
        <div className="flex items-start px-4 py-3 mt-4 rounded-xl bg-red/20">
          <input
            id="expert-checkbox"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="cursor-pointer mr-1 w-5 h-5 mt-0.5 text-red-600 !ring-red-600 bg-white border-red rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
          />
          <label
            htmlFor="expert-checkbox"
            className="ml-2 font-medium text-red-600"
          >
            Price impact is too high. You will lose a big portion of your funds
            in this trade. Please tick the box if you would like to continue.
          </label>
        </div>
      )}
    </>
  )
}
