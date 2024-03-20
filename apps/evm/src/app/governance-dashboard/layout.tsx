import { Container } from '@sushiswap/ui'
import React from 'react'

import { Header } from '../../ui/governance-dashboard'
import { Hero } from '../../ui/governance-dashboard/hero'
import { Providers } from './providers'

export default function GovernanceDashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <Header />
      <main className="dark:text-gray-50 text-slate-900">
        <Hero />
        <Container maxWidth="6xl" className="mx-auto px-4 py-8 md:py-14">
          {children}
        </Container>
      </main>
    </Providers>
  )
}
