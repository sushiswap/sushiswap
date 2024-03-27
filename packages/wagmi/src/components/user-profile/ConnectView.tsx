import {
  ChevronDoubleDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import {
  CoinbaseWalletIcon,
  FrameIcon,
  GnosisSafeIcon,
  LedgerIcon,
  MetamaskIcon,
  RabbyIcon,
  TrustWalletIcon,
  WalletConnectIcon,
} from '@sushiswap/ui/components/icons'
import { List } from '@sushiswap/ui/components/list/List'
import React, { FC, ReactNode, SVGProps, useCallback, useMemo } from 'react'

import { useConnect } from '../../hooks'

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
        ))}
      </List.Control>
    </List>
  )
}
