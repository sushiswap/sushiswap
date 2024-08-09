import { Navigation } from '@sushiswap/ui'
import { Metadata } from 'next'
import { headerElements } from '../../(evm)/_common/header-elements'

export const metadata: Metadata = {
  title: 'Terms Of Service',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation leftElements={headerElements()} />
      <div className="flex flex-col flex-1">{children}</div>
    </>
  )
}
