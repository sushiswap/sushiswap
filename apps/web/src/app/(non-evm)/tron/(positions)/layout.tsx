'use client'

import { Container, LinkInternal } from '@sushiswap/ui'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { PathnameButton, PoolsFiltersProvider } from 'src/ui/pool'
import { Hero } from './hero'

export default function Layout({
  children,
}: {
  children: React.ReactNode
  params: { chainId: string }
}) {
  const searchParams = useSearchParams()

  return (
    <>
      <Container maxWidth="7xl" className="px-4 py-16">
        <Hero />
      </Container>
      <Container
        maxWidth="7xl"
        className="px-4 flex justify-between flex-wrap-reverse gap-4 pb-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <LinkInternal
            shallow={true}
            scroll={false}
            href={`/tron/pool?${searchParams.toString()}`}
          >
            <PathnameButton
              id="my-positions"
              pathname={`/tron/pool`}
              asChild
              size="sm"
            >
              My Positions
            </PathnameButton>
          </LinkInternal>
          {/* <LinkInternal
            shallow={true}
            scroll={false}
            href={`/tron/rewards?${searchParams.toString()}`}
          >
            <PathnameButton
              id="my-rewards"
              pathname={`/tron/rewards`}
              asChild
              size="sm"
            >
              My Rewards
            </PathnameButton>
          </LinkInternal> */}
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
