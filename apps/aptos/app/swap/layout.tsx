import { Providers } from './providers'

export const metadata = {
  title: 'SushiSwap',
}

export default function SwapLayout({
  children,
}: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
