import { Container } from '@sushiswap/ui'
import dynamic from 'next/dynamic'
import { Providers } from '../(simple)/providers'
const LimitPanel = dynamic(() => import('src/ui/swap/twap/twap').then(it => it.LimitPanel), {ssr: false})

export const metadata = {
  title: 'SushiSwap',
}

export default function SwapLimitPage() {
  return (
    <Providers>
      <Container maxWidth="lg" className="px-4">
        <LimitPanel />
      </Container>
    </Providers>
  )
}
