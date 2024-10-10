import { Container } from '@sushiswap/ui'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SushiSwap | Test',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <Container maxWidth="4xl" className="px-4 mt-20 pb-40 space-y-12">
        {children}
      </Container>
    </div>
  )
}
