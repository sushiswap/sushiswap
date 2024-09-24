import { Header } from './header'
import { Providers } from './providers'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <div>{children}</div>
    </Providers>
  )
}
