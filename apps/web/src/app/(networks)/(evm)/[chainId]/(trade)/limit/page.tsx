import { Container } from '@sushiswap/ui'
import dynamic from 'next/dynamic'
const LimitPanel = dynamic(
  () => import('src/ui/swap/twap/twap').then((it) => it.LimitPanel),
  { ssr: false },
)

export const metadata = {
  title: 'Limit Order',
  description: 'SushiSwap Limit Order',
}

export default function SwapLimitPage() {
  return (
    <Container maxWidth="lg" className="px-4">
      <LimitPanel />
    </Container>
  )
}
