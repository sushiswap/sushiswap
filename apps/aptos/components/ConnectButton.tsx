import { WalletName, useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Button,
  ButtonProps,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sushiswap/ui'
import React from 'react'
import { WalletIcons } from './ConnectView'

export enum ProfileView {
  Disconnected = 0,
  Default = 1,
  Transactions = 2,
  Settings = 3,
}

export default function ConnectButton(props: ButtonProps) {
  const { wallets, connect } = useWallet()

  const onSelect = (name: WalletName) => {
    connect(name)
  }

  // const { data: tokens } = useTokens()
  // const nativeCurr = tokens?.['0x1::aptos_coin::AptosCoin']
  // const { data: balance } = useTokenBalance({
  //   account: account?.address as string,
  //   currency: nativeCurr?.address as string,
  //   refetchInterval: 2000,
  // })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button {...props}>
          <span className="hidden sm:block">Connect Wallet</span>
          <span className="block sm:hidden">Connect</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {wallets.map((wallet) => {
            const Icon = WalletIcons[wallet.name]
            return (
              <DropdownMenuItem
                onClick={() => onSelect(wallet.name as WalletName)}
                key={wallet.name}
              >
                <Icon className="w-4 h-4 mr-2" />
                {wallet.name}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
