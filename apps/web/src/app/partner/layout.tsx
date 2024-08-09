import { Navigation } from '@sushiswap/ui'
import { Metadata } from 'next'
import { headerElements } from '../_common/header-elements'

export const metadata: Metadata = {
  title: 'Partner',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation leftElements={headerElements()} />
      <div className="flex flex-col flex-1">{children}</div>
    </>
  )
}
