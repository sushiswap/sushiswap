import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { ClipboardController, IconButton, SkeletonText } from '@sushiswap/ui'
import { LinkExternal } from '@sushiswap/ui'
import React, { Dispatch, SetStateAction } from 'react'
import { formatUSD } from 'sushi/format'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { Aptos } from '~aptos/_common/config/coins'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { useStablePrice } from '~aptos/_common/lib/common/use-stable-price'
import { ProfileView } from './user-profile'

interface Props {
  balance: number | undefined
  setView: Dispatch<SetStateAction<ProfileView>>
}

export const DefaultView = ({ balance, setView }: Props) => {
  const { account, disconnect } = useWallet()
  const { network } = useNetwork()

  let [big, portion] = (balance ? `${balance}` : '0.00').split('.')
  portion = portion ? portion.substring(0, 2) : ''

  const price = useStablePrice({ currency: Aptos[network] })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between gap-2">
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
            href={`https://explorer.aptoslabs.com/account/${
              account?.address
            }?network=${networkNameToNetwork(network)}`}
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
        {!price || !balance ? (
          <div className="w-12">
            <SkeletonText fontSize="default" />
          </div>
        ) : (
          <p className="font-medium text-slate-400">
            {formatUSD(price * balance)}
          </p>
        )}
      </div>
    </div>
  )
}
