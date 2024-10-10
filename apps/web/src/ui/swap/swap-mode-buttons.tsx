'use client'

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@sushiswap/ui'
import { ShuffleIcon } from '@sushiswap/ui/icons/ShuffleIcon'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { isTwapSupportedChainId } from 'src/config'
import { ChainId, ChainKey } from 'sushi/chain'
import { isSushiXSwap2ChainId } from 'sushi/config'
import { PathnameButton } from '../pathname-button'

export const SwapModeButtons = () => {
  const { chainId: _chainId } = useParams()
  const chainId = +_chainId as ChainId

  return (
    <div className="flex gap-2 flex-wrap">
      <Link href={`/${ChainKey[chainId]}/swap`}>
        <PathnameButton pathname={`/${ChainKey[chainId]}/swap`} size="sm">
          Swap
        </PathnameButton>
      </Link>
      <Link
        href={`/${
          isTwapSupportedChainId(chainId) ? ChainKey[chainId] : 'ethereum'
        }/limit`}
      >
        <PathnameButton pathname={`/${ChainKey[chainId]}/limit`} size="sm">
          Limit
        </PathnameButton>
      </Link>
      <Link
        href={`/${
          isTwapSupportedChainId(chainId) ? ChainKey[chainId] : 'ethereum'
        }/dca`}
      >
        <PathnameButton pathname={`/${ChainKey[chainId]}/dca`} size="sm">
          DCA
        </PathnameButton>
      </Link>
      <HoverCard>
        <Link
          href={`/${
            isSushiXSwap2ChainId(chainId) ? ChainKey[chainId] : 'ethereum'
          }/cross-chain-swap`}
        >
          <PathnameButton
            pathname={`/${ChainKey[chainId]}/cross-chain-swap`}
            size="sm"
          >
            <HoverCardTrigger asChild>
              <span className="saturate-200 flex items-center gap-2 bg-gradient-to-r from-blue to-pink bg-clip-text text-transparent">
                <ShuffleIcon width={20} height={20} className="text-blue" />
                Cross-Chain
              </span>
            </HoverCardTrigger>
          </PathnameButton>
        </Link>
        <HoverCardContent className="!p-0 max-w-[320px]">
          <CardHeader>
            <CardTitle>Cross-Chain Swap</CardTitle>
            <CardDescription>
              Swap tokens natively across 15 chains including Ethereum,
              Arbitrum, Optimism, Polygon, Base and more!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              target="_blank"
              className="text-sm text-blue hover:underline"
              href="https://www.sushi.com/blog/sushixswap-v2"
              rel="noreferrer"
            >
              Learn more.
            </a>
          </CardContent>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
