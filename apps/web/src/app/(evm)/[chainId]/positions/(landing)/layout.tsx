'use client'

import { Container, LinkInternal } from '@sushiswap/ui'
import { useSearchParams } from 'next/navigation'
import { PathnameButton } from 'src/ui/pathname-button'
import { PoolsFiltersProvider } from 'src/ui/pool'
import { Hero } from './hero'

export default function TabsLayout({
  children,
  params: { chainId },
}: {
  children: React.ReactNode
  params: { chainId: string }
}) {
  const searchParams = useSearchParams()

  return (
    <>
      <Container maxWidth="7xl" className="px-4 pt-16 pb-4">
        <Hero />
      </Container>
      <Container maxWidth="7xl" className="px-4">
        <div className="flex flex-wrap items-center gap-2 my-4">
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/${chainId}/positions?${searchParams.toString()}`}
          >
            <PathnameButton
              id="my-positions"
              pathname={`/${chainId}/positions`}
              asChild
              size="sm"
            >
              My Positions
            </PathnameButton>
          </LinkInternal>
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/${chainId}/positions/rewards?${searchParams.toString()}`}
          >
            <PathnameButton
              id="my-rewards"
              pathname={`/${chainId}/positions/rewards`}
              asChild
              size="sm"
            >
              My Rewards
            </PathnameButton>
          </LinkInternal>
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/${chainId}/positions/migrate?${searchParams.toString()}`}
          >
            <PathnameButton
              id="migrate"
              pathname={`/${chainId}/positions/migrate`}
              asChild
              size="sm"
            >
              Migrate
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
