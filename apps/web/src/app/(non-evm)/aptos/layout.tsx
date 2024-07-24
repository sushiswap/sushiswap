import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SushiSwap | Aptos',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>
}
