'use client'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceEventName,
  TraceEvent,
} from '@sushiswap/telemetry'
import { Button, ButtonProps } from '@sushiswap/ui'
import React, { FC, useCallback } from 'react'
import { useConnect } from '../hooks/wallet/useConnect'

export const ConnectButton: FC<ButtonProps> = ({
  children: _children,
  ...props
}) => {
  const { pending, connect, connectors } = useConnect()
  const { openConnectModal } = useConnectModal()

  const onConnect = useCallback(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'test') {
      connect({ connector: connectors[0] })
    } else {
      openConnectModal?.()
    }
  }, [openConnectModal, connect, connectors])

  // Pending confirmation state
  // Awaiting wallet confirmation
  if (pending) {
    return (
      <Button loading {...props}>
        Authorize Wallet
      </Button>
    )
  }

  return (
    <TraceEvent
      events={[BrowserEvent.onClick]}
      name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
      element={InterfaceElementName.CONNECT_WALLET_BUTTON}
    >
      <Button
        {...props}
        onClick={onConnect}
        onKeyDown={onConnect}
        testId="connect"
      >
        <span className="hidden sm:block">Connect Wallet</span>
        <span className="block sm:hidden">Connect</span>
      </Button>
    </TraceEvent>
  )
}
