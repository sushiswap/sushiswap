import {
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { ClipboardController, IconButton, SkeletonText } from '@sushiswap/ui'
import { JazzIcon } from '@sushiswap/ui/icons/JazzIcon'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import Link from 'next/link'
import React, { Dispatch, SetStateAction } from 'react'
import { formatNumber, formatUSD } from 'sushi/format'
import { WTRX } from '~tron/_common/constants/token-list'
import { useNativeBalance } from '~tron/_common/lib/hooks/useNativeBalance'
import { useStablePrice } from '~tron/_common/lib/hooks/useStablePrice'
import { truncateText } from '~tron/_common/lib/utils/formatters'
import { getTronscanAddressLink } from '~tron/_common/lib/utils/tronscan-helpers'
import { IProfileView } from './WalletConnector'

type DefaultViewProps = {
  setView: Dispatch<SetStateAction<IProfileView>>
}

export const DefaultView = ({ setView }: DefaultViewProps) => {
  const { address, disconnect } = useWallet()
  const { data, isLoading: isLoadingBalance } = useNativeBalance()

  const { data: price, isLoading: isLoadingPrice } = useStablePrice({
    token: WTRX,
  })

  const isLoading = isLoadingBalance || isLoadingPrice

  return (
    <div className="flex flex-col gap-8 p-4 w-full">
      <div className="flex justify-between gap-2 w-full">
        <div className="text-sm font-semibold flex items-center gap-1.5 text-gray-700 dark:text-slate-200">
          {address && <JazzIcon diameter={16} address={address} />}
          <ClipboardController>
            {({ setCopied }) => (
              <span
                onKeyDown={() => setCopied(address ?? '')}
                className="cursor-pointer"
                onClick={() => setCopied(address ?? '')}
              >
                {truncateText(address ?? '')}
              </span>
            )}
          </ClipboardController>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={Cog6ToothIcon}
            onClick={() => setView('settings')}
            name="Settings"
            description="Settings"
            size="xs"
          />
          <ClipboardController>
            {({ setCopied }) => (
              <IconButton
                icon={DocumentDuplicateIcon}
                onClick={() => setCopied(address ?? '')}
                name={'Copy Address'}
                description={'Copy Address'}
                size="xs"
              />
            )}
          </ClipboardController>
          <Link
            href={getTronscanAddressLink(address ?? '')}
            target="_blank"
            rel="noopenner noreferrer"
          >
            <IconButton
              icon={LinkIcon}
              size="xs"
              name="View on Explorer"
              description="View on Explorer"
            />
          </Link>
          <IconButton
            icon={ArrowLeftOnRectangleIcon}
            onClick={async () => await disconnect()}
            name="Disconnect"
            size="xs"
            description="Disconnect"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 justify-center items-center">
        {isLoading || !price || data?.formattedBalance === undefined ? (
          <div className="flex items-center gap-2">
            <SkeletonText className="!w-24 mx-auto !h-7" />
            <span className="text-3xl font-medium h-7">TRX</span>
          </div>
        ) : (
          <p className="text-3xl font-medium whitespace-nowrap">
            {formatNumber(data?.formattedBalance)} TRX
          </p>
        )}
        {isLoading || !price || data?.formattedBalance === undefined ? (
          <SkeletonText className="!w-12 mx-auto" />
        ) : (
          <p className="font-medium text-slate-400">
            {formatUSD(Number(price) * data?.formattedBalance)}
          </p>
        )}
      </div>
    </div>
  )
}
