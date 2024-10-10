'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { ChevronDownIcon } from '@heroicons/react-v1/solid'
import {
  Badge,
  Navigation,
  SushiNavigationDropdown,
  classNames,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { SushiIcon } from '@sushiswap/ui/icons/SushiIcon'
import { SushiWithTextIcon } from '@sushiswap/ui/icons/SushiWithTextIcon'
import React, { FC, Suspense } from 'react'
import { NonStandardChainId, SUPPORTED_NETWORKS } from 'src/config'
import { HeaderNetworkSelector } from 'src/lib/wagmi/components/header-network-selector'
import { SidebarToggle, useSidebar } from 'src/ui/sidebar'
import { useAccount, useChainId } from 'wagmi'
import { headerElements } from './_common/header-elements'
import { UserProfile } from './_common/ui/user-profile/user-profile'

export const Header: FC = () => {
  const { connected } = useWallet()

  const evmChainId = useChainId()

  const { isConnected: isEVMConnected } = useAccount()

  const { isOpen } = useSidebar()

  return (
    <div className="flex z-20">
      <div
        className={classNames(
          'hidden lg:flex justify-between items-center px-1 w-56 h-14 flex-shrink-0 bg-gray-100 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 border-b',
          isOpen && 'border-b-gray-100 dark:border-b-slate-900',
        )}
      >
        <SushiNavigationDropdown className="!px-2">
          <SushiWithTextIcon width={90} />
        </SushiNavigationDropdown>
        <SidebarToggle variant="ghost" className="!px-2" asChild>
          <Badge
            position="bottom-right"
            badgeContent={
              connected || isEVMConnected ? (
                <div className="bg-green rounded-full w-2 h-2 mr-0.5 mb-0.5" />
              ) : (
                <div />
              )
            }
          >
            <NetworkIcon
              chainId={connected ? NonStandardChainId.APTOS : evmChainId}
              width={22}
              height={22}
            />
          </Badge>
          <ChevronDownIcon className="w-3 h-3" />
        </SidebarToggle>
      </div>
      <div className="flex lg:hidden justify-between items-center pl-4 bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <SushiNavigationDropdown>
          <SushiIcon width={24} height={24} />
        </SushiNavigationDropdown>
      </div>
      <Navigation
        className="!pl-0 lg:!pl-4"
        hideSushiDropdown
        leftElements={headerElements}
        rightElement={
          <Suspense>
            <HeaderNetworkSelector
              networks={SUPPORTED_NETWORKS}
              selectedNetwork={NonStandardChainId.APTOS}
              className="flex lg:hidden"
            />
            <UserProfile />
          </Suspense>
        }
      />
    </div>
  )
}
