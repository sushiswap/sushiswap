import { Metadata } from 'next'
import React from 'react'
import { Header } from './header'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Sushi 🍣',
    template: '%s | Sushi 🍣',
  },
  description:
    'A Decentralised Finance (DeFi) app with features such as swap, cross chain swap, streaming, vesting, and permissionless market making for liquidity providers.',
}

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col h-full">
        <Header />
        {children}
      </div>
    </Providers>
  )
}
