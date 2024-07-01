import {
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  InboxArrowDownIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { usePrice } from '@sushiswap/react-query'
import {
  BrowserEvent,
  InterfaceElementName,
  InterfaceEventName,
  TraceEvent,
} from '@sushiswap/telemetry'
import {
  ClipboardController,
  LinkExternal,
  OnramperButton,
} from '@sushiswap/ui'
import { IconButton } from '@sushiswap/ui'
import { List } from '@sushiswap/ui'
import React, { Dispatch, FC, SetStateAction, useMemo } from 'react'
import chains, { ChainId } from 'sushi/chain'
import { isWNativeSupported } from 'sushi/config'
import { Amount, Native } from 'sushi/currency'
import { Fraction } from 'sushi/math'
import { zeroAddress } from 'viem'
import { useBalance, useDisconnect } from 'wagmi'
import { ProfileView } from './ProfileView'

interface DefaultProps {
  chainId: ChainId
  address: `0x${string}`
  setView: Dispatch<SetStateAction<ProfileView>>
}

export const DefaultView: FC<DefaultProps> = ({
  chainId,
  address,
  setView,
}) => {
  const { disconnect } = useDisconnect()
  const { data: _price } = usePrice({
    chainId,
    address: Native.onChain(chainId).wrapped.address,
    enabled: isWNativeSupported(chainId),
  })

  const price = useMemo(() => {
    return Native.onChain(chainId).wrapped.address === zeroAddress
      ? new Fraction(0)
      : _price
  }, [_price, chainId])

  const { data: _balance } = useBalance({
    address: address,
    chainId,
  })

  const balance = useMemo(
    () =>
      Amount.fromRawAmount(
        Native.onChain(chainId),
        _balance ? _balance?.value.toString() : '0',
      ),
    [_balance, chainId],
  )

  const balanceAsUsd = useMemo(() => {
    return balance && price ? balance.multiply(price) : undefined
  }, [balance, price])

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <IconButton
              size="sm"
              icon={Cog6ToothIcon}
              onClick={() => setView(ProfileView.Settings)}
              description="Settings"
              name="Settings"
            />
            <ClipboardController hideTooltip>
              {({ setCopied, isCopied }) => (
                <IconButton
                  size="sm"
                  icon={DocumentDuplicateIcon}
                  onClick={() => setCopied(address)}
                  description={isCopied ? 'Copied!' : 'Copy Address'}
                  name="Copy"
                />
              )}
            </ClipboardController>
            <LinkExternal href={chains[chainId].getAccountUrl(address)}>
              <IconButton
                size="sm"
                icon={LinkIcon}
                description="View on Explorer"
                name="View on Explorer"
              />
            </LinkExternal>

            <TraceEvent
              events={[BrowserEvent.onClick]}
              name={InterfaceEventName.DISCONNECT_WALLET_BUTTON_CLICKED}
              element={InterfaceElementName.DISCONNECT_WALLET_BUTTON}
            >
              <IconButton
                size="sm"
                icon={ArrowLeftOnRectangleIcon}
                onClick={() => disconnect()}
                description="Disconnect"
                name="Disconnect"
              />
            </TraceEvent>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-3xl font-medium whitespace-nowrap">
            {balance.toSignificant(3)} {Native.onChain(chainId).symbol}
          </p>
          <p className="font-medium text-slate-400">
            ${balanceAsUsd?.toFixed(2)}
          </p>
        </div>
      </div>
      <List>
        <List.Control className="bg-gray-100">
          <List.MenuItem
            icon={InboxArrowDownIcon}
            title="Transactions"
            onClick={() => setView(ProfileView.Transactions)}
            hoverIconProps={{ width: 20, height: 20 }}
          />
          <OnramperButton className="w-full" chainId={chainId}>
            <List.MenuItem
              icon={CreditCardIcon}
              title="Buy Crypto"
              hoverIconProps={{ width: 20, height: 20 }}
            />
          </OnramperButton>
        </List.Control>
      </List>
    </>
  )
}
