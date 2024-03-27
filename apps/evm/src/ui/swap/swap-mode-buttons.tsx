'use client'

import { useLocalStorage } from '@sushiswap/hooks'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ShuffleIcon,
} from '@sushiswap/ui'
import { motion } from 'framer-motion'
import Link from 'next/link'

import { PathnameButton } from '../pathname-button'

export const SwapModeButtons = () => {
  const [bannerMinimized] = useLocalStorage('xswap-banner-minimized', false)

  return (
    <div className="flex gap-2">
      <Link href="/swap">
        <PathnameButton pathname="/swap" size="sm">
          Swap
        </PathnameButton>
      </Link>
      {bannerMinimized ? (
        <HoverCard>
          <motion.div layoutId="container">
            <motion.div layout layoutId="title">
              <Link href="/swap/cross-chain">
                <PathnameButton pathname="/swap/cross-chain" size="sm">
                  <HoverCardTrigger asChild>
                    <span className="saturate-200 flex items-center gap-2 bg-gradient-to-r from-blue to-pink bg-clip-text text-transparent">
                      <ShuffleIcon
                        width={20}
                        height={20}
                        className="text-blue"
                      />
                      Cross Chain
                    </span>
                  </HoverCardTrigger>
                </PathnameButton>
              </Link>
            </motion.div>
          </motion.div>
          <HoverCardContent className="!p-0 max-w-[320px]">
            <CardHeader>
              <CardTitle>Cross-chain Swap</CardTitle>
              <CardDescription>
                Swap tokens natively across 13 chains including Ethereum,
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
      ) : null}
    </div>
  )
}
