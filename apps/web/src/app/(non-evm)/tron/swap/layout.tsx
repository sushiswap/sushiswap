import { Providers } from './providers'

export default function SwapLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="lg:p-4 mt-16 mb-[86px]">{children}</div>
    </Providers>
  )
}
