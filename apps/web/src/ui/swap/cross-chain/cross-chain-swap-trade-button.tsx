'use client'

import { DialogTrigger } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import React, { FC, useEffect, useState } from 'react'
import { APPROVE_TAG_XSWAP } from 'src/lib/constants'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import { SUSHIXSWAP_2_ADDRESS, SushiXSwap2ChainId } from 'sushi/config'
import { ZERO } from 'sushi/math'
import { warningSeverity } from '../../../lib/swap/warningSeverity'
import { CrossChainSwapTradeReviewDialog } from './cross-chain-swap-trade-review-dialog'
import {
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
} from './derivedstate-cross-chain-swap-provider'
import { useIsCrossChainSwapMaintenance } from './use-is-cross-chain-swap-maintenance'

export const CrossChainSwapTradeButton: FC = () => {
  const { data: maintenance } = useIsCrossChainSwapMaintenance()
  const {
    state: { swapAmount, swapAmountString, chainId0 },
  } = useDerivedStateCrossChainSwap()
  const { data: trade } = useCrossChainSwapTrade()
  const [checked, setChecked] = useState(false)

  // Reset
  useEffect(() => {
    if (warningSeverity(trade?.priceImpact) <= 3) {
      setChecked(false)
    }
  }, [trade])

  return (
    <CrossChainSwapTradeReviewDialog>
      <div>
        <Checker.Guard
          guardWhen={maintenance}
          guardText="Maintenance in progress"
        >
          <Checker.Connect fullWidth>
            <Checker.Network fullWidth chainId={chainId0}>
              <Checker.Amounts fullWidth chainId={chainId0} amount={swapAmount}>
                <Checker.ApproveERC20
                  id="approve-erc20"
                  fullWidth
                  amount={swapAmount}
                  contract={
                    SUSHIXSWAP_2_ADDRESS[chainId0 as SushiXSwap2ChainId]
                  }
                >
                  <Checker.Success tag={APPROVE_TAG_XSWAP}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={Boolean(
                          !trade?.amountOut?.greaterThan(ZERO) ||
                            trade?.status === 'NoWay' ||
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
                        size="xl"
                        testId="swap"
                      >
                        {!checked && warningSeverity(trade?.priceImpact) >= 3
                          ? 'Price impact too high'
                          : trade?.status === 'NoWay'
                            ? 'No trade found'
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
    </CrossChainSwapTradeReviewDialog>
  )
}
