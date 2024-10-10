'use client'

import type { ButtonProps } from '@sushiswap/ui'
import { FC } from 'react'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { ConnectButton } from '~aptos/_common/ui/user-profile/connect-button'

const Connect: FC<ButtonProps> = ({ children, ...props }) => {
  const { connected } = useWallet()

  if (!connected) return <ConnectButton {...props} />

  return <>{children}</>
}

export { Connect }
