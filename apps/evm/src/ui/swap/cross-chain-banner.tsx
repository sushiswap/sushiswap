'use client'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { useLocalStorage } from '@sushiswap/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  IconButton,
  ShuffleIcon,
  Switch,
} from '@sushiswap/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import React, { FC, useCallback, useState, useTransition } from 'react'

export const CrossChainBanner: FC = () => {
  const [minimized, setBannerMinimize] = useLocalStorage(
    'xswap-banner-minimized',
    false,
  )
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [checked, setChecked] = useState(pathname === '/swap/cross-chain')
  const { push } = useRouter()

  const handleChange = useCallback(
    (checked: boolean) => {
      setChecked(checked)
      setTimeout(() => {
        startTransition(() => {
          if (checked) push('/swap/cross-chain')
          else push('/swap')
        })
      }, 100)
    },
    [push],
  )

  return (
    <AnimatePresence mode="popLayout">
      {!minimized ? (
        <motion.div layout layoutId="container">
          <Card className="bg-gradient-to-r from-blue/20 to-pink/20">
            <CardHeader>
              <CardTitle>
                <motion.div layoutId="title">
                  <span className="text-base tracking-tighter saturate-200 flex items-center gap-2 bg-gradient-to-r from-blue to-pink bg-clip-text text-transparent">
                    <ShuffleIcon width={20} height={20} className="text-blue" />
                    Cross-chain Swap
                  </span>
                </motion.div>
              </CardTitle>
              <CardDescription>
                Swap tokens natively across 13 chains including Ethereum,
                Arbitrum, Optimism, Polygon, Base and more!{' '}
                <a
                  target="_blank"
                  className="text-blue hover:underline"
                  href="https://www.sushi.com/blog/sushixswap-v2"
                  rel="noreferrer"
                >
                  Learn more.
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Switch checked={checked} onCheckedChange={handleChange} />
            </CardContent>
            <div className="absolute right-2 top-2">
              <IconButton
                icon={XMarkIcon}
                name="minimize"
                onClick={() => setBannerMinimize(true)}
                size="xs"
              />
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
