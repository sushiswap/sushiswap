import {
  ChevronDoubleDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceEventName,
  TraceEvent,
} from '@sushiswap/telemetry'
import { List } from '@sushiswap/ui'
import { CoinbaseWalletIcon } from '@sushiswap/ui/icons/CoinbaseWalletIcon'
import { FrameIcon } from '@sushiswap/ui/icons/FrameIcon'
import { GnosisSafeIcon } from '@sushiswap/ui/icons/GnosisSafeIcon'
import { LedgerIcon } from '@sushiswap/ui/icons/LedgerIcon'
import { MetamaskIcon } from '@sushiswap/ui/icons/MetamaskIcon'
import { RabbyIcon } from '@sushiswap/ui/icons/RabbyIcon'
import { TrustWalletIcon } from '@sushiswap/ui/icons/TrustWalletIcon'
import { WalletConnectIcon } from '@sushiswap/ui/icons/WalletConnectIcon'
import React, { FC, ReactNode, SVGProps, useCallback, useMemo } from 'react'
import { useConnect } from 'wagmi'

const Icons: Record<
  string,
  (props: SVGProps<SVGSVGElement>) => ReactNode | null
> = {
  Injected: ChevronDoubleDownIcon,
  MetaMask: MetamaskIcon,
  'Trust Wallet': TrustWalletIcon,
  WalletConnect: WalletConnectIcon,
  WalletConnectLegacy: WalletConnectIcon,
  'Coinbase Wallet': CoinbaseWalletIcon,
  Safe: GnosisSafeIcon,
  Rabby: RabbyIcon,
  Frame: FrameIcon,
  Ledger: LedgerIcon,
}

export const ConnectView: FC<{ onSelect(): void }> = ({ onSelect }) => {
  const { connectors, connectAsync } = useConnect()

  const _connectors = useMemo(() => {
    const conns = [...connectors]

    const injected = conns.find((el) => el.id === 'injected')

    if (injected) {
      return [
        injected,
        ...conns.filter(
          (el) => el.id !== 'injected' && el.name !== injected.name,
        ),
      ]
    }

    return conns
  }, [connectors])

  const _onSelect = useCallback(
    (connectorId: string) => {
      onSelect()
      setTimeout(() => {
        const connector = _connectors.find((el) => el.id === connectorId)

        if (!connector) throw new Error('Connector not found')

        connectAsync({
          connector,
        })
      }, 250)
    },
    [connectAsync, _connectors, onSelect],
  )

  return (
    <List className="!p-0">
      {/* <List.Label>Wallet</List.Label> */}
      <List.Control className="bg-gray-100 dark:!bg-slate-700">
        {_connectors.map((connector) => (
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={InterfaceEventName.WALLET_SELECTED}
            properties={{ wallet_type: connector.name }}
            element={InterfaceElementName.WALLET_TYPE_OPTION}
          >
            <List.MenuItem
              onClick={() => _onSelect(connector.id)}
              icon={Icons[connector.name]}
              title={
                connector.name === 'Safe'
                  ? 'Gnosis Safe'
                  : connector.name === 'WalletConnectLegacy'
                    ? 'WalletConnect'
                    : connector.name
              }
              key={connector.id}
              hoverIcon={ChevronRightIcon}
            />
          </TraceEvent>
        ))}
      </List.Control>
    </List>
  )
}
