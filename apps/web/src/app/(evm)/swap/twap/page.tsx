import { Container } from '@sushiswap/ui'
import dynamic from 'next/dynamic'
import { Providers } from '../(simple)/providers'

const TWAPPanel = dynamic(
  () => import('src/ui/swap/twap/twap').then((it) => it.TWAPPanel),
  { ssr: false },
)

export const metadata = {
  title: 'SushiSwap',
}

export default function SwapTwapPage() {
  return (
    <Providers>
      <Container maxWidth="lg" className="px-4">
        <TWAPPanel />
      </Container>
    </Providers>
  )
}
