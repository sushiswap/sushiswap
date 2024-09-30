import { CogIcon } from '@heroicons/react/24/outline'
import { SlippageToleranceStorageKey } from '@sushiswap/hooks'
import {
  IconButton,
  SettingsModule,
  SettingsOverlay,
  Widget,
  WidgetAction,
  WidgetDescription,
  WidgetHeader,
  WidgetTitle,
} from '@sushiswap/ui'
import { RemoveLiquidity } from '../Remove/RemoveLiquidity'

export const RemoveSection = () => {
  return (
    <Widget id="removeLiquidity" variant="empty">
      <WidgetHeader>
        <WidgetTitle>Remove Liquidity</WidgetTitle>
        <WidgetDescription>
          Trade in your LP tokens to receive your underlying tokens
        </WidgetDescription>
        <WidgetAction variant="empty">
          <SettingsOverlay
            options={{
              slippageTolerance: {
                storageKey: SlippageToleranceStorageKey.RemoveLiquidity,
              },
            }} //use this key to get slippage from localStorage
            modules={[SettingsModule.SlippageTolerance]}
          >
            <IconButton
              size="sm"
              name="Settings"
              icon={CogIcon}
              variant="secondary"
            />
          </SettingsOverlay>
        </WidgetAction>
      </WidgetHeader>
      <RemoveLiquidity />
    </Widget>
  )
}
