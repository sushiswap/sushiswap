'use client'
import { SlippageToleranceStorageKey } from '@sushiswap/hooks'
import {
  Container,
  SettingsModule,
  SettingsOverlay,
  typographyVariants,
} from '@sushiswap/ui'
import { AmountIn } from '~tron/_common/ui/Swap/AmountIn'
import { AmountOut } from '~tron/_common/ui/Swap/AmountOut'
import { ReviewSwapDialog } from '~tron/_common/ui/Swap/ReviewSwapDialog'
import { SwapStats } from '~tron/_common/ui/Swap/SwapStats'
import { SwitchSwapDirection } from '~tron/_common/ui/Swap/SwitchSwapDirection'
import { SwitchSwapType } from '~tron/_common/ui/Swap/SwitchSwapType'

export default function SwapSimplePage() {
  return (
    <Container maxWidth="lg" className="px-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start gap-2">
          <h1 className={typographyVariants({ variant: 'h1' })}>Trade</h1>
        </div>
        <div className="flex items-center justify-between">
          <SwitchSwapType />
          <SettingsOverlay
            options={{
              slippageTolerance: {
                storageKey: SlippageToleranceStorageKey.Swap,
              },
            }} //use this key to get slippage from localStorage
            modules={[SettingsModule.SlippageTolerance]}
          />
        </div>
        <AmountIn />
        <SwitchSwapDirection />
        <div className="flex flex-col">
          <AmountOut />
          <ReviewSwapDialog />
        </div>
        <SwapStats />
      </div>
    </Container>
  )
}
