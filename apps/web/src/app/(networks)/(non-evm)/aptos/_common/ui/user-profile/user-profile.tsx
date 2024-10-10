import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@sushiswap/ui'
import { JazzIcon } from '@sushiswap/ui/icons/JazzIcon'
import React, { useState } from 'react'
import { useBaseTokens } from '~aptos/_common/lib/common/use-base-tokens'
import { useTokenBalance } from '~aptos/_common/lib/common/use-token-balances'
import { ConnectButton } from './connect-button'
import { ConnectView } from './connect-view/connect-view'
import { DefaultView } from './default-view'
import { SettingsView } from './settings-view'

export enum ProfileView {
  // Disconnected = 0,
  Default = 1,
  Transactions = 2,
  Settings = 3,
}

export function UserProfile() {
  const { account, connected } = useWallet()
  const [view, setView] = useState<ProfileView>(ProfileView.Default)
  const { data: tokens } = useBaseTokens()

  const nativeCurr = tokens?.['0x1::aptos_coin::AptosCoin']
  const { data: balance } = useTokenBalance({
    account: account?.address,
    currency: nativeCurr?.address,
    refetchInterval: 2000,
  })

  if (!connected || !account?.address)
    return <ConnectButton variant="secondary" />

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <JazzIcon diameter={20} address={account?.address} />
          <span className="hidden sm:block">{`${account?.address?.slice(
            0,
            6,
          )}...${account?.address?.slice(-4)}`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {!connected && <ConnectView close={close} />}
        {connected && view === ProfileView.Default && (
          <DefaultView
            balance={balance && balance / 10 ** 8}
            setView={setView}
          />
        )}
        {view === ProfileView.Settings && <SettingsView setView={setView} />}
      </PopoverContent>
    </Popover>
  )
}
