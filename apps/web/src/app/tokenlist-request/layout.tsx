import React from 'react'

import { headers } from 'next/headers'
import { Header } from './header'
import { Providers } from './providers'

export default function Layout({ children }: { children: React.ReactNode }) {
  const cookie = headers().get('cookie')
  return (
    <Providers cookie={cookie}>
      <div className="flex flex-col h-full">
        <Header />
        {children}
      </div>
    </Providers>
  )
}
