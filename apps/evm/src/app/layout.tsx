import '@sushiswap/ui/index.css'

import 'sushi/bigint-serializer'

import type { Metadata } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import React from 'react'

import { headers } from 'next/headers'
import { SanctionedAddressDialog } from 'src/lib/wagmi/components/sanctioned-address-dialog'
import { Providers } from './providers'
import { Trackers } from './trackers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

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
  const cookie = headers().get('cookie')

  return (
    // <html lang="en" className="[color-scheme:dark]">
    <html
      lang="en"
      className={`${inter.variable} ${roboto_mono.variable} dark`}
      suppressHydrationWarning
    >
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png?v=1"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png?v=1"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png?v=1"
      />
      <link rel="manifest" href="/site.webmanifest?v=1" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg?v=1" color="#fa52a0" />
      <link rel="shortcut icon" href="/favicon.ico?v=1" />
      <body className="h-screen">
        <Providers cookie={cookie}>
          <div className="flex flex-col h-full">
            <SanctionedAddressDialog />
            {children}
          </div>
        </Providers>
        <Trackers />
      </body>
    </html>
  )
}
