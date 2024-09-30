import { Container } from '@sushiswap/ui'

import React from 'react'
import { PoolsFiltersProvider } from 'src/ui/pool'
import { Hero } from './hero'

export const metadata = {
  title: 'Pools 💦',
}

export default function ExploreLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      <Container maxWidth="7xl" className="px-4 py-[9.5rem]">
        <Hero />
      </Container>
      <section className="flex flex-col min-h-screen">
        <div className="flex-1 bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-4 pb-20">
          <PoolsFiltersProvider>{children}</PoolsFiltersProvider>
        </div>
      </section>
    </>
  )
}
