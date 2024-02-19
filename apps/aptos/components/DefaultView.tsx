import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { ClipboardController, IconButton } from '@sushiswap/ui'
import { LinkExternal } from '@sushiswap/ui'
import { providerNetwork } from 'lib/constants'
import React, { Dispatch, SetStateAction } from 'react'
import { ProfileView } from './WalletSelector'
interface Props {
  balance: number | undefined
  setView: Dispatch<SetStateAction<ProfileView>>
}

export const DefaultView = ({ balance, setView }: Props) => {
  const { account, disconnect } = useWallet()

  let [big, portion] = (balance ? `${balance}` : '0.00').split('.')
  portion = portion ? portion.substring(0, 2) : ''

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
                  onClick={() => setCopied(account?.address as string)}
                  description={isCopied ? 'Copied!' : 'Copy Address'}
                  name="Copy"
                />
              )}
            </ClipboardController>
            <LinkExternal
              href={`https://explorer.aptoslabs.com/account/${account?.address}?network=${providerNetwork}`}
            >
              <IconButton
                size="sm"
                icon={LinkIcon}
                description="View on Explorer"
                name="View on Explorer"
              />
            </LinkExternal>

            <IconButton
              size="sm"
              icon={ArrowLeftOnRectangleIcon}
              onClick={() => disconnect()}
              description="Disconnect"
              name="Disconnect"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-3xl font-medium whitespace-nowrap">
            {big}
            {portion && <>.{portion}</>} APT
          </p>
        </div>
      </div>
    </>
  )
}
