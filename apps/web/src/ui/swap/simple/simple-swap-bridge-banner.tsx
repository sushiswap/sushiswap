'use client'

import { XIcon } from '@heroicons/react-v1/solid'
import { ArrowUpRightIcon } from '@heroicons/react/20/solid'
import { useLocalStorage } from '@sushiswap/hooks'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { FC } from 'react'
import { Chain, ChainId } from 'sushi/chain'
import { useDerivedStateSimpleSwap } from './derivedstate-simple-swap-provider'

const BridgeInfo = {
  [ChainId.SKALE_EUROPA]: {
    url: 'https://portal.skale.space/bridge',
    background: (
      <video autoPlay muted loop className="absolute inset-0 -z-10">
        <source src="/skale-hero-video.mp4" type="video/mp4" />
      </video>
    ),
    textColor: 'text-white',
  },
} as const

export const SimpleSwapBridgeBanner: FC = () => {
  const [hideBanner, setHideBanner] = useLocalStorage(
    'hide-bridge-banner',
    false,
  )

  const {
    state: { chainId },
  } = useDerivedStateSimpleSwap()

  return chainId in BridgeInfo && !hideBanner ? (
    <a
      href={BridgeInfo[chainId as keyof typeof BridgeInfo].url}
      target="_blank"
      rel="noopener noreferrer"
      className={BridgeInfo[chainId as keyof typeof BridgeInfo].textColor}
    >
      <div className="block xl:fixed xl:right-8 xl:bottom-8 rounded-xl relative p-6 bg-blue/10 min-w-[360px] overflow-hidden">
        {BridgeInfo[chainId as keyof typeof BridgeInfo].background}
        <XIcon
          width={20}
          height={20}
          className={'absolute top-[10px] right-[10px] cursor-pointer'}
          onClick={(e) => {
            e.preventDefault()
            setHideBanner(true)
          }}
        />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <NetworkIcon chainId={chainId} width={24} height={24} />
            <div className="flex items-center">
              <span className="font-semibold">
                Bridge to {Chain.fromChainId(chainId)?.name}
              </span>
              <ArrowUpRightIcon width={20} height={20} />
            </div>
          </div>
          <span className="text-xs">
            Deposit your tokens to {Chain.fromChainId(chainId)?.name}.
          </span>
        </div>
      </div>
    </a>
  ) : (
    <div />
  )
}
