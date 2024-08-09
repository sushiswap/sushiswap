import { Container, LinkInternal } from '@sushiswap/ui'
import { GlobalStatsCharts } from 'src/ui/explore/global-stats-charts'
import { PathnameButton } from 'src/ui/pathname-button'
import { PoolsFiltersProvider } from 'src/ui/pool'
import { ChainId } from 'sushi/chain'
import { Hero } from './hero'

export const metadata = {
  title: 'Pools 💦',
}

export default async function ExploreLayout({
  children,
  params,
}: { children: React.ReactNode; params: { chainId: string } }) {
  return (
    <>
      <Container maxWidth="7xl" className="px-4 pt-20 pb-10">
        <Hero chainId={+params.chainId as ChainId} />
        <div className="mt-10">
          <GlobalStatsCharts chainId={+params.chainId as ChainId} />
        </div>
      </Container>
      <Container maxWidth="7xl" className="px-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/${params.chainId}/explore/pools`}
          >
            <PathnameButton
              id="all-pools"
              pathname={`/${params.chainId}/explore/pools`}
              asChild
              size="sm"
            >
              All Pools
            </PathnameButton>
          </LinkInternal>
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/${params.chainId}/explore/smart-pools`}
          >
            <PathnameButton
              id="smart-pools"
              pathname={`/${params.chainId}/explore/smart-pools`}
              asChild
              size="sm"
            >
              Smart Pools
            </PathnameButton>
          </LinkInternal>
        </div>
      </Container>
      <section className="flex flex-col flex-1">
        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-4 pb-20 h-full">
          <PoolsFiltersProvider>{children}</PoolsFiltersProvider>
        </div>
      </section>
    </>
  )
}
