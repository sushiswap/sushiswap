import { Header } from './header'
import { Providers } from './providers'

export const fetchCache = 'default-no-store'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <div className="h-full">{children}</div>
    </Providers>
  )
}
