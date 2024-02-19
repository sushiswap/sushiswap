'use client'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Container } from '@sushiswap/ui'
import { SettingsModule, SettingsOverlay } from '@sushiswap/ui'
import Loading from 'app/loading'
import { SwapButton } from 'components/SwapButton'
import SwapTrade from 'components/SwapTrade'
import { SwapTradeInput } from 'components/SwapTradeInput'
import { SwapTradeOutput } from 'components/SwapTradeOutput'
import { TradeReviewDialog } from 'components/TradeReviewDialog'
import { TradeStats } from 'components/TradeStats'
import React, { useEffect } from 'react'
import requiredNetworkAlert from 'utils/requiredNetworkAlert'
import { useAccount } from 'utils/useAccount'
import { SwitchAppType } from 'widget/SwitchAppType'
import { WidgetTitleV2 } from 'widget/WidgetTitleV2'
import { useSwapActions, useSwapState } from './trade/TradeProvider'

export default function SwapPage() {
  const { disconnect, network } = useWallet()
  const { setToken0, setToken1 } = useSwapActions()
  const { token0, token1, isTransactionPending } = useSwapState()
  const { isLoadingAccount } = useAccount()

  useEffect(() => {
    requiredNetworkAlert(network, disconnect)
  }, [network, disconnect])

  const swapTokenIfAlreadySelected = () => {
    setToken0(token1)
    setToken1(token0)
  }

  return (
    <>
      {isLoadingAccount && <Loading />}
      <Container maxWidth="lg" className="p-4 mt-20">
        <div className="flex flex-col gap-4">
          <WidgetTitleV2 />
          <div className="flex items-center justify-between">
            <SwitchAppType />
            <SettingsOverlay modules={[SettingsModule.SlippageTolerance]} />
          </div>
          <SwapTradeInput handleSwap={swapTokenIfAlreadySelected} />
          <SwapTrade />
          <div className="flex flex-col">
            <SwapTradeOutput handleSwap={swapTokenIfAlreadySelected} />
            <SwapButton />
          </div>
          <TradeStats />
          <TradeReviewDialog isTransactionPending={isTransactionPending} />
        </div>
      </Container>
    </>
  )
}
