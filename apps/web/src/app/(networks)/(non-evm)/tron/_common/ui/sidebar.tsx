'use client'

import { useWallet as useTronWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { FC } from 'react'
import { NonStandardChainId } from 'src/config'
import {
  SidebarContainer as BaseSidebarContainer,
  SidebarContainerProps,
  SidebarProvider,
} from 'src/ui/sidebar'

export const SidebarContainer: FC<
  Omit<SidebarContainerProps, 'connectedNetwork' | 'selectedNetwork'>
> = (props) => {
  const { connected } = useTronWallet()

  return (
    <BaseSidebarContainer
      {...props}
      selectedNetwork={NonStandardChainId.TRON}
      connectedNetwork={connected ? NonStandardChainId.TRON : undefined}
    />
  )
}

export { SidebarProvider }
