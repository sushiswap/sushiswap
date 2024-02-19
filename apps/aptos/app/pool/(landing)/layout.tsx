'use client'

import { Container, LinkInternal } from '@sushiswap/ui'
import { useSearchParams } from 'next/navigation'

import { PoolsFiltersProvider } from 'components/PoolFiltersProvider'
import { PathnameButton } from '../../../components/PathnameButton'
import { Hero } from '../hero'

export default function TabsLayout({
  children,
}: { children: React.ReactNode }) {
  const searchParams = useSearchParams()

  return (
    <>
      <Container maxWidth="7xl" className="px-4 pt-20 pb-10">
        <Hero />
      </Container>
      <Container maxWidth="7xl" className="px-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/pool?${searchParams.toString()}`}
          >
            <PathnameButton id="all-pools" pathname={'/pool'} asChild size="sm">
              All Pools
            </PathnameButton>
          </LinkInternal>
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/pool/my-positions?${searchParams.toString()}`}
          >
            <PathnameButton
              id="my-positions"
              pathname={'/pool/my-positions'}
              asChild
              size="sm"
            >
              My Positions
            </PathnameButton>
          </LinkInternal>
          {/*<LinkInternal*/}
          {/*  shallow={true}*/}
          {/*  scroll={false}*/}
          {/*  href={`/pool/my-rewards?${searchParams.toString()}`}*/}
          {/*>*/}
          <PathnameButton
            disabled
            id="my-rewards"
            pathname={'/pool/my-rewards'}
            size="sm"
          >
            My Rewards
          </PathnameButton>
          {/*</LinkInternal>*/}
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
