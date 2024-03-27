'use client'

import { useIsMounted } from '@sushiswap/hooks'
import { useBreakpoint } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
// import { JazzIcon } from '@sushiswap/ui/components/icons/JazzIcon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@sushiswap/ui/components/popover'
import React, { FC, useState } from 'react'
import { ChainId } from 'sushi/chain'
import { shortenAddress } from 'sushi/format'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
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
  const { address, chain, isConnected } = useAccount()

  const { data: name } = useEnsName({
    chainId: ChainId.ETHEREUM,
    address,
  })

  const { data: avatar } = useEnsAvatar({
    name: name || undefined,
    chainId: ChainId.ETHEREUM,
  })

  const chainId = (chain?.id as ChainId) || ChainId.ETHEREUM

  if (!address || !isMounted) return <ConnectButton variant="secondary" />

  return (
    <Popover>
      <PopoverTrigger asChild>
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
