import { Navigation } from '@sushiswap/ui'
import { headerElements } from '~evm/_common/header-elements'

export const fetchCache = 'default-no-store'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation leftElements={headerElements({ includeOnramper: false })} />
      <div className="flex flex-col flex-1">{children}</div>
    </>
  )
}
