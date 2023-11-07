import { CrossChainBanner } from '../cross-chain-banner'
import { SwapModeButtons } from '../swap-mode-buttons'
import { SimpleSwapHeader } from './simple-swap-header'
import { SimpleSwapSettingsOverlay } from './simple-swap-settings-overlay'
import { SimpleSwapSwitchTokensButton } from './simple-swap-switch-tokens-button'
import { SimpleSwapTokenNotFoundDialog } from './simple-swap-token-not-found-dialog'
import { SimpleSwapToken0Input } from './simple-swap-token0-input'
import { SimpleSwapToken1Input } from './simple-swap-token1-input'
import { SimpleSwapTradeButton } from './simple-swap-trade-button'
import { SimpleSwapTradeStats } from './simple-swap-trade-stats'
import { SwapMaintenanceMessage } from './swap-maintenance-message'

export const SimpleSwapWidget = () => {
  return (
    <div className="flex flex-col gap-4">
      <SimpleSwapHeader />
      <div className="flex items-center justify-between">
        <SwapModeButtons />
        <SimpleSwapSettingsOverlay />
      </div>
      <SwapMaintenanceMessage />
      <CrossChainBanner />
      <SimpleSwapToken0Input />
      <SimpleSwapSwitchTokensButton />
      <div className="flex flex-col">
        <SimpleSwapToken1Input />
        <SimpleSwapTradeButton />
      </div>
      <SimpleSwapTradeStats />
      <SimpleSwapTokenNotFoundDialog />
    </div>
  )
}
