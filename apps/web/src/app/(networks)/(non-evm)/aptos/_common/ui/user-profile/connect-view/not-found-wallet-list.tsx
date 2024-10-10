import { Wallet } from '@aptos-labs/wallet-adapter-core'
import { LinkExternal } from '@sushiswap/ui'
import React, { SVGProps } from 'react'
import { useNetwork } from '~aptos/_common/lib/common/use-network'

interface NotFoundWalletList {
  Icons: Record<string, (props: SVGProps<SVGSVGElement>) => JSX.Element | null>
  wallet: Wallet
}

export const NotFoundWalletList = ({ Icons, wallet }: NotFoundWalletList) => {
  const {
    other: { MSafeOrigin },
  } = useNetwork()

  return (
    <LinkExternal
      href={
        wallet.name === 'MSafe'
          ? `${MSafeOrigin}apps/0?url=${encodeURIComponent(
              window.location.href,
            )}`
          : wallet.url
      }
      className="p-0 items-center hover:bg-black/[0.04] active:bg-black/[0.06] hover:dark:bg-white/[0.02] active:dark:bg-white/[0.03] relative flex gap-4 px-4 py-3 w-full cursor-pointer rounded-xl"
      rel="noreferrer"
    >
      <span className="h-[18px] w-[18px]">
        {React.createElement(Icons[wallet.name], {
          width: 18,
          height: 18,
          strokeWidth: 2,
          className: 'text-blue-500',
        })}
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-slate-200">
        {wallet.name}
      </span>
    </LinkExternal>
  )
}
