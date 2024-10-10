'use client'

import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
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
  const { network } = useAptosWallet()

  return (
    <BaseSidebarContainer
      {...props}
      selectedNetwork={NonStandardChainId.APTOS}
      connectedNetwork={
        network?.name === 'mainnet' ? NonStandardChainId.APTOS : undefined
      }
    />
  )
}

export { SidebarProvider }
