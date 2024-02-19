import { Providers } from './providers'

export const metadata = {
  title: 'Pool',
}

export default function PoolLayout({
  children,
}: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
