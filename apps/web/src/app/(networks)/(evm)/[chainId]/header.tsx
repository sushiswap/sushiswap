'use client'

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
import React, { FC } from 'react'
import { SUPPORTED_NETWORKS } from 'src/config'
import { WagmiHeaderComponents } from 'src/lib/wagmi/components/wagmi-header-components'
import { SidebarToggle, useSidebar } from 'src/ui/sidebar'
import { ChainId } from 'sushi/chain'
import { useAccount, useChainId } from 'wagmi'
import { headerElements } from '../_common/header-elements'

export const Header: FC<{ chainId: ChainId }> = ({ chainId }) => {
  const connectedChainId = useChainId()

  const { address } = useAccount()

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
              address ? (
                <div className="bg-green rounded-full w-2 h-2 mr-0.5 mb-0.5" />
              ) : (
                <div />
              )
            }
          >
            <NetworkIcon chainId={connectedChainId} width={22} height={22} />
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
        leftElements={headerElements({ chainId })}
        rightElement={<WagmiHeaderComponents networks={SUPPORTED_NETWORKS} />}
      />
    </div>
  )
}
