import { HotJar } from '@sushiswap/ui/components/scripts'

import { Providers } from './providers'

export const metadata = {
  title: 'SushiSwap',
  description:
    'SushiSwap is a community-driven decentralized exchange (DEX) for traders and liquidity providers.',
}

export default function SwapLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      <Providers>{children}</Providers>
      <HotJar />
    </>
  )
}
