'use client'

import { useIsMounted } from '@sushiswap/hooks'
import { InterfaceEventName, sendAnalyticsEvent } from '@sushiswap/telemetry'
import { useBreakpoint } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
// import { JazzIcon } from '@sushiswap/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@sushiswap/ui'
import React, { FC, useState } from 'react'
import { ChainId } from 'sushi/chain'
import { shortenAddress } from 'sushi/format'
import { useAccount, useChainId, useEnsAvatar, useEnsName } from 'wagmi'
import { ConnectButton } from '../connect-button'
import { ConnectView } from './ConnectView'
import { DefaultView } from './DefaultView'
import { ProfileView } from './ProfileView'
import { SettingsView } from './SettingsView'
import { TransactionsView } from './TransactionsView'

interface ProfileProps {
  networks: ChainId[]
}

export const UserProfile: FC<ProfileProps> = () => {
  const isMounted = useIsMounted()
  const { isSm } = useBreakpoint('sm')
  const [view, setView] = useState<ProfileView>(ProfileView.Default)
  const chainId = useChainId()
  const { address, isConnected } = useAccount()

  const { data: name } = useEnsName({
    chainId: ChainId.ETHEREUM,
    address,
  })

  const { data: avatar } = useEnsAvatar({
    name: name || undefined,
    chainId: ChainId.ETHEREUM,
  })

  if (!address || !isMounted) return <ConnectButton variant="secondary" />

  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={() =>
          sendAnalyticsEvent(InterfaceEventName.ACCOUNT_DROPDOWN_BUTTON_CLICKED)
        }
      >
        <Button variant="secondary">
          {
            avatar ? (
              <img
                alt="ens-avatar"
                src={avatar}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : null
            // <JazzIcon diameter={20} address={address} />
          }
          <span>{shortenAddress(address, isSm ? 3 : 2)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {!isConnected && <ConnectView onSelect={close} />}
        {view === ProfileView.Default && address && (
          <DefaultView chainId={chainId} address={address} setView={setView} />
        )}
        {view === ProfileView.Settings && <SettingsView setView={setView} />}
        {view === ProfileView.Transactions && address && (
          <TransactionsView setView={setView} address={address} />
        )}
      </PopoverContent>
    </Popover>
  )
}
